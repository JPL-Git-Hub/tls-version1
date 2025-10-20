import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import type { CalcomWebhookPayload, CalcomEventType } from '@/types/external'
import { adminDb } from '@/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore'
import { COLLECTIONS, type ClientData, type CaseData, type ClientCases } from '@/types/database'

/**
 * Cal.com Webhook Handler
 * 
 * Handles Cal.com booking events and creates client records via existing /api/clients/create endpoint
 * 
 * Webhook URL: https://yourdomain.com/api/webhooks/calcom
 * 
 * Environment Variables Required:
 * - CALCOM_WEBHOOK_SECRET (production only - get from Cal.com webhook settings)
 * 
 * Example webhook payload (BOOKING_CREATED):
 * {
 *   "triggerEvent": "BOOKING_CREATED",
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "payload": {
 *     "type": "consultation",
 *     "title": "Legal Consultation",
 *     "startTime": "2024-01-20T14:00:00.000Z",
 *     "endTime": "2024-01-20T15:00:00.000Z",
 *     "attendees": [{
 *       "email": "client@example.com",
 *       "name": "John Doe",
 *       "timeZone": "America/New_York"
 *     }],
 *     "responses": {
 *       "phone": "555-123-4567",
 *       "caseType": "Real Estate",
 *       "urgency": "Medium",
 *       "additionalDetails": "Need help with property purchase"
 *     },
 *     "uid": "cal_booking_12345",
 *     "additionalNotes": "First time client"
 *   }
 * }
 */

// Verify Cal.com webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    // Cal.com sends signature as "sha256=hash"
    const actualSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(actualSignature, 'hex')
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

// Log webhook event to Firestore for debugging
async function logWebhookEvent(
  eventType: CalcomEventType,
  payload: CalcomWebhookPayload,
  success: boolean,
  error?: string
) {
  try {
    const webhookId = `calcom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await adminDb.collection('webhook_logs').doc(webhookId).set({
      webhookId,
      source: 'calcom',
      eventType,
      payload,
      success,
      error: error || null,
      processedAt: Timestamp.now(),
      createdAt: Timestamp.now()
    })
  } catch (logError) {
    console.error('Failed to log webhook event:', logError)
  }
}

// Link booking to existing client and create case
async function handleCompleteBookingFlow(webhookPayload: CalcomWebhookPayload): Promise<{ clientId: string; caseId: string }> {
  const attendee = webhookPayload.payload.attendees[0]
  if (!attendee) {
    throw new Error('No attendee found in booking')
  }

  const responses = webhookPayload.payload.responses || {}
  
  // Split full name into firstName and lastName
  const fullName = attendee.name.trim()
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] || 'Unknown'
  const lastName = nameParts.slice(1).join(' ') || 'Unknown'
  
  // Find existing client by email (required - must fill form first)
  const existingClientQuery = await adminDb
    .collection(COLLECTIONS.CLIENTS)
    .where('email', '==', attendee.email)
    .limit(1)
    .get()

  if (existingClientQuery.empty) {
    throw new Error(`No client found with email ${attendee.email}. Client must fill consultation form before booking.`)
  }

  // Update existing client with booking metadata
  const existingDoc = existingClientQuery.docs[0]
  const clientId = existingDoc.id
  
  await existingDoc.ref.update({
    consultationBooked: true,
    consultationDate: Timestamp.fromDate(new Date(webhookPayload.payload.startTime)),
    bookingId: webhookPayload.payload.uid,
    updatedAt: Timestamp.now()
  })
  
  console.log('Updated existing client with booking:', clientId)

  // Create case record
  const caseRef = adminDb.collection(COLLECTIONS.CASES).doc()
  const caseId = caseRef.id
  
  const caseData: Omit<CaseData, 'caseId'> = {
    clientNames: `${firstName} ${lastName}`,
    caseType: (responses.caseType as any) || 'Other',
    status: 'intake',
    consultationBookingId: webhookPayload.payload.uid,
    consultationDateTime: Timestamp.fromDate(new Date(webhookPayload.payload.startTime)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  await caseRef.set({
    caseId,
    ...caseData
  })
  
  console.log('Created case:', caseId)

  // Link client to case via junction table
  const clientCaseRef = adminDb.collection(COLLECTIONS.CLIENT_CASES).doc()
  const participantId = clientCaseRef.id
  
  const clientCaseData: Omit<ClientCases, 'participantId'> = {
    clientId,
    caseId,
    role: 'primary',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  await clientCaseRef.set({
    participantId,
    ...clientCaseData
  })
  
  console.log('Linked client to case:', participantId)

  return { clientId, caseId }
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const headersList = await headers()
    const signature = headersList.get('x-cal-signature-256') || 
                     headersList.get('x-signature-256') ||
                     headersList.get('x-cal-signature')

    // Read raw body for signature verification
    const rawBody = await request.text()
    
    // Environment-aware signature verification
    const isDevelopment = process.env.NODE_ENV === 'development'
    const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET

    if (!isDevelopment) {
      // Production: require webhook secret and signature verification
      if (!webhookSecret) {
        console.error('CALCOM_WEBHOOK_SECRET not configured for production')
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        )
      }
      
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Cal.com webhook signature verification failed')
        return NextResponse.json(
          { error: 'Webhook signature verification failed' },
          { status: 401 }
        )
      }
    } else {
      // Development: log signature info but don't block
      console.log('Development mode: webhook signature verification skipped')
      if (signature) {
        console.log('Signature present:', signature)
      } else {
        console.log('No signature in development webhook')
      }
    }

    // Parse webhook payload
    let webhookPayload: CalcomWebhookPayload
    try {
      webhookPayload = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('Failed to parse Cal.com webhook payload:', parseError)
      await logWebhookEvent('BOOKING_CREATED', {} as CalcomWebhookPayload, false, 'Invalid JSON payload')
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // DEBUG: Log complete Cal.com webhook payload
    console.log('=== CAL.COM WEBHOOK DEBUG ===')
    console.log('Raw payload:', JSON.stringify(webhookPayload, null, 2))
    console.log('Trigger event:', webhookPayload.triggerEvent)
    console.log('Attendees:', webhookPayload.payload?.attendees)
    console.log('Responses:', webhookPayload.payload?.responses)

    console.log('Cal.com webhook received:', {
      triggerEvent: webhookPayload.triggerEvent,
      bookingId: webhookPayload.payload?.uid,
      attendeeEmail: webhookPayload.payload?.attendees?.[0]?.email
    })

    // Handle different event types
    switch (webhookPayload.triggerEvent) {
      case 'BOOKING_CREATED':
        try {
          const result = await handleCompleteBookingFlow(webhookPayload)
          
          await logWebhookEvent(webhookPayload.triggerEvent, webhookPayload, true)
          
          return NextResponse.json({
            success: true,
            message: 'Booking linked to existing client and case created',
            clientId: result.clientId,
            caseId: result.caseId
          })
          
        } catch (createError) {
          console.error('Error processing booking flow:', createError)
          await logWebhookEvent(webhookPayload.triggerEvent, webhookPayload, false, String(createError))
          
          return NextResponse.json(
            { error: 'Failed to process booking', details: String(createError) },
            { status: 500 }
          )
        }

      case 'BOOKING_RESCHEDULED':
        // TODO: Update consultation date in existing client record
        console.log('Booking rescheduled - not yet implemented')
        await logWebhookEvent(webhookPayload.triggerEvent, webhookPayload, true, 'Event logged but not processed')
        break

      case 'BOOKING_CANCELLED':
        // TODO: Update client status or flag consultation as cancelled
        console.log('Booking cancelled - not yet implemented')
        await logWebhookEvent(webhookPayload.triggerEvent, webhookPayload, true, 'Event logged but not processed')
        break

      default:
        console.log(`Unhandled Cal.com event: ${webhookPayload.triggerEvent}`)
        await logWebhookEvent(webhookPayload.triggerEvent, webhookPayload, true, 'Event logged but not processed')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })

  } catch (error) {
    console.error('Cal.com webhook processing error:', error)
    
    // Log the error
    try {
      await logWebhookEvent('BOOKING_CREATED', {} as CalcomWebhookPayload, false, String(error))
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests from Cal.com webhooks.' },
    { status: 405 }
  )
}