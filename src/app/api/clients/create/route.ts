import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase/admin'
import { verifyAttorneyToken } from '@/lib/firebase/server-claims'
import { createClient, countRecentClientsByEmail, createCase } from '@/lib/firebase/firestore'
import { ClientData, CaseData } from '@/types/database'

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
    
    // Lightweight runtime validation
    if (!body.firstName || !body.lastName || !body.email || !body.cellPhone) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Missing required fields: firstName, lastName, email, cellPhone' },
        { status: 400 }
      )
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Basic phone format check
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(body.cellPhone)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const clientInput = body

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

    // Create client data object (without googleContactResourceName initially)
    const clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'> = {
      email: clientInput.email,
      firstName: clientInput.firstName,
      lastName: clientInput.lastName,
      cellPhone: clientInput.cellPhone,
      ...(clientInput.propertyAddress && { propertyAddress: clientInput.propertyAddress }),
      status: 'lead' // All new contacts start as leads, attorneys convert to retained after consultation
    }

    // Create client in Firestore
    const clientId = await createClient(clientData)

    // Create case data object
    const caseData: Omit<CaseData, 'caseId' | 'createdAt' | 'updatedAt'> = {
      clientNames: `${clientInput.firstName} ${clientInput.lastName}`,
      caseType: 'Other',
      status: 'intake',
      ...(clientInput.propertyAddress && { propertyAddress: clientInput.propertyAddress }),
      ...(clientInput.purchasePrice && { purchasePrice: clientInput.purchasePrice })
    }

    // Create case and link to client
    const caseId = await createCase(caseData, [{ clientId, role: 'primary' }])


    return NextResponse.json(
      { 
        success: true, 
        clientId,
        caseId,
        message: isAttorneyRequest ? 'Client and case created successfully' : 'Consultation request submitted successfully'
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