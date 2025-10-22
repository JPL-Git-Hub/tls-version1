import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import type { CalcomWebhookPayload, CalcomEventType } from '@/types/external'
import { adminDb } from '@/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore'
import { COLLECTIONS, type ClientData, type CaseData, type ClientCases } from '@/types/database'
import { updateClient, updateCase, getClientCases } from '@/lib/firebase/firestore'
import { externalConfig } from '@/lib/config/ext-env-var'

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


// Link booking to existing client and update existing case
async function handleCompleteBookingFlow(webhookPayload: CalcomWebhookPayload): Promise<{ clientId: string; caseId: string }> {
  const attendee = webhookPayload.payload.attendees[0]
  if (!attendee) {
    throw new Error('No attendee found in booking')
  }

  // Find existing client by email (required - must fill form first)
  const existingClientQuery = await adminDb
    .collection(COLLECTIONS.CLIENTS)
    .where('email', '==', attendee.email)
    .limit(1)
    .get()

  if (existingClientQuery.empty) {
    throw new Error(`No client found with email ${attendee.email}. Client must fill consultation form before booking.`)
  }

  // Get existing client data
  const existingDoc = existingClientQuery.docs[0]
  const clientId = existingDoc.id
  
  // Update existing client with booking metadata using utility function  
  const clientUpdates: Record<string, any> = {
    consultationBooked: true,
    consultationDate: Timestamp.fromDate(new Date(webhookPayload.payload.startTime)),
    bookingId: webhookPayload.payload.uid
  }
  
  await updateClient(clientId, clientUpdates)
  console.log('Updated existing client with booking:', clientId)

  // Find existing case for this client (created by the form)
  const caseIds = await getClientCases(clientId)
  
  if (caseIds.length === 0) {
    throw new Error(`No case found for client ${clientId}. Case should have been created by consultation form.`)
  }

  // Use the first case (should only be one for new clients)
  const caseId = caseIds[0]
  
  // Update existing case with booking metadata using utility function
  const caseUpdates = {
    consultationBookingId: webhookPayload.payload.uid,
    consultationDateTime: Timestamp.fromDate(new Date(webhookPayload.payload.startTime))
  }
  
  await updateCase(caseId, caseUpdates)
  console.log('Updated existing case with booking metadata:', caseId)

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
    const webhookSecret = externalConfig.calcom.webhookSecret

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
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // First, log all webhook events to cal_webhooks collection for audit trail
    try {
      const webhookDocRef = adminDb.collection(COLLECTIONS.CAL_WEBHOOKS).doc()
      await webhookDocRef.set({
        webhookId: webhookDocRef.id,
        eventType: webhookPayload.triggerEvent,
        payload: webhookPayload,
        processedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      })
      console.log('Logged webhook event to audit trail:', webhookPayload.triggerEvent)
    } catch (logError) {
      console.error('Failed to log webhook to audit trail:', logError)
      // Continue processing even if logging fails
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

    // Filter events: only process BOOKING_CREATED in M1
    if (webhookPayload.triggerEvent !== 'BOOKING_CREATED') {
      console.log(`Event ${webhookPayload.triggerEvent} logged but not processed in M1`)
      return NextResponse.json({ 
        success: true, 
        message: `Event ${webhookPayload.triggerEvent} logged successfully` 
      })
    }

    // Process BOOKING_CREATED event
    try {
      const result = await handleCompleteBookingFlow(webhookPayload)
      
      return NextResponse.json({
        success: true,
        message: 'Booking linked to existing client and case updated',
        clientId: result.clientId,
        caseId: result.caseId
      })
      
    } catch (createError) {
      console.error('Error processing booking flow:', createError)
      
      return NextResponse.json(
        { error: 'Failed to process booking', details: String(createError) },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Cal.com webhook processing error:', error)

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