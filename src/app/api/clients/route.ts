import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { verifyAttorneyToken } from '@/lib/firebase/server-claims'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/database'

export async function GET(request: NextRequest) {
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

    // Get all clients
    const clientsSnapshot = await adminDb
      .collection(COLLECTIONS.CLIENTS)
      .get()

    const clients = clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(
      { 
        success: true, 
        clients,
        count: clients.length
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Clients retrieval error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to retrieve clients' },
      { status: 500 }
    )
  }
}