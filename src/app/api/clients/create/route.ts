import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { verifyAttorneyToken } from '@/lib/firebase/server-claims'
import { createClient } from '@/lib/firebase/firestore'
import { ClientData } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'AUTH_UNAUTHORIZED', message: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const idToken = authorization.substring(7) // Remove 'Bearer ' prefix

    // Verify basic token validity
    const user = await verifyIdToken(idToken)
    if (!user) {
      return NextResponse.json(
        { error: 'AUTH_UNAUTHORIZED', message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Verify attorney role
    const isAttorney = await verifyAttorneyToken(idToken)
    if (!isAttorney) {
      return NextResponse.json(
        { error: 'AUTH_UNAUTHORIZED', message: 'Attorney access required' },
        { status: 401 }
      )
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
      status: 'lead'
    }

    // Create client in Firestore
    const clientId = await createClient(clientData)

    return NextResponse.json(
      { 
        success: true, 
        clientId,
        message: 'Client created successfully'
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