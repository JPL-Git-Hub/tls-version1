import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { verifyAttorneyToken } from '@/lib/firebase/server-claims'
import { createClient, countRecentClientsByEmail } from '@/lib/firebase/firestore'
import { ClientData } from '@/types/database'
import { ClientInputSchema } from '@/types/inputs'
import { createContact } from '@/lib/google/contacts'

export async function POST(request: NextRequest) {
  try {
    // Check if this is an authenticated attorney request or public lead submission
    const authorization = request.headers.get('authorization')
    let isAttorneyRequest = false

    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.substring(7)
      const user = await verifyIdToken(idToken)
      if (user) {
        const isAttorney = await verifyAttorneyToken(idToken)
        if (isAttorney) {
          isAttorneyRequest = true
        }
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = ClientInputSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid input data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const clientInput = validation.data

    // Check for excessive submissions (same email > 3 in last 24 hours)
    if (!isAttorneyRequest) {
      const recentCount = await countRecentClientsByEmail(clientInput.email, 24)
      if (recentCount >= 3) {
        return NextResponse.json(
          { error: 'RATE_LIMIT_EXCEEDED', message: 'Maximum submissions per day reached' },
          { status: 429 }
        )
      }
    }

    // Create client data object
    const clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'> = {
      email: clientInput.email,
      firstName: clientInput.firstName,
      lastName: clientInput.lastName,
      mobilePhone: clientInput.mobilePhone,
      ...(clientInput.propertyAddress && { propertyAddress: clientInput.propertyAddress }),
      status: isAttorneyRequest ? 'active' : 'lead' // Attorneys create active clients, public creates leads
    }

    // Create client in Firestore
    const clientId = await createClient(clientData)

    // Sync to Google Contacts (one-way)
    try {
      await createContact(clientInput, clientId)
    } catch (contactError) {
      // Log but don't fail the request if Google Contacts sync fails
      console.error('Google Contacts sync failed:', contactError)
    }

    return NextResponse.json(
      { 
        success: true, 
        clientId,
        message: isAttorneyRequest ? 'Client created successfully' : 'Consultation request submitted successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Client creation error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to create client' },
      { status: 500 }
    )
  }
}