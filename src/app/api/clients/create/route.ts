import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { verifyAttorneyToken } from '@/lib/firebase/server-claims'
import { createClient } from '@/lib/firebase/firestore'
import { ClientData } from '@/types/database'

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

    // Parse request body
    const body = await request.json()
    const { email, firstName, lastName, mobilePhone, propertyAddress } = body

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Missing required fields: email, firstName, lastName' },
        { status: 400 }
      )
    }

    // Create client data object
    const clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'> = {
      email,
      firstName,
      lastName,
      mobilePhone: mobilePhone || '',
      propertyAddress: propertyAddress || undefined,
      status: isAttorneyRequest ? 'active' : 'lead' // Attorneys create active clients, public creates leads
    }

    // Create client in Firestore
    const clientId = await createClient(clientData)

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