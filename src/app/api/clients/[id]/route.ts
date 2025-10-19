import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { verifyAttorneyToken } from '@/lib/firebase/server-claims'
import { getClient, updateClient } from '@/lib/firebase/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get client by ID
    const client = await getClient(params.id)
    if (!client) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        client: {
          id: params.id,
          ...client
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Client retrieval error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to retrieve client' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if client exists
    const existingClient = await getClient(params.id)
    if (!existingClient) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Client not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, firstName, lastName, phone, address } = body

    // Validate at least one field is provided
    if (!email && !firstName && !lastName && !phone && !address) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'At least one field must be provided for update' },
        { status: 400 }
      )
    }

    // Build updates object (excluding attorneyId and createdAt)
    const updates: Record<string, string | null> = {}
    if (email !== undefined) updates.email = email
    if (firstName !== undefined) updates.firstName = firstName
    if (lastName !== undefined) updates.lastName = lastName
    if (phone !== undefined) updates.phone = phone
    if (address !== undefined) updates.address = address

    // Update client in Firestore (updateClient sets updatedAt automatically)
    await updateClient(params.id, updates)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Client updated successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Client update error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to update client' },
      { status: 500 }
    )
  }
}