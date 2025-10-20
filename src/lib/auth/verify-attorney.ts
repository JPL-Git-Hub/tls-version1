import { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import type { DecodedIdToken } from 'firebase-admin/auth'

export interface AttorneyUser {
  uid: string
  email: string | undefined
  role: string
}

export interface VerificationError {
  error: string
  status: number
}

/**
 * Verifies attorney access from API routes
 * Checks session cookie or Authorization header for valid attorney token
 */
export async function verifyAttorneyAccess(
  request: NextRequest
): Promise<AttorneyUser | VerificationError> {
  try {
    let idToken: string | undefined

    // Check Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      idToken = authHeader.substring(7)
    }

    // Fallback to session cookie if no auth header
    if (!idToken) {
      const sessionCookie = request.cookies.get('session')?.value
      if (sessionCookie) {
        try {
          const decodedCookie = await adminAuth.verifySessionCookie(sessionCookie)
          if (decodedCookie.role === 'attorney') {
            return {
              uid: decodedCookie.uid,
              email: decodedCookie.email,
              role: decodedCookie.role as string
            }
          }
        } catch {
          // Session cookie invalid, continue to check other methods
        }
      }
    }

    if (!idToken) {
      return {
        error: 'No authentication token provided',
        status: 401
      }
    }

    // Verify the ID token
    const decodedToken: DecodedIdToken = await adminAuth.verifyIdToken(idToken)

    // Check if user has attorney role
    if (decodedToken.role !== 'attorney') {
      return {
        error: 'Access denied. Attorney role required.',
        status: 403
      }
    }

    // Check domain restriction
    if (!decodedToken.email?.endsWith('@thelawshop.com')) {
      return {
        error: 'Access denied. Must use thelawshop.com email address.',
        status: 403
      }
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role as string
    }
  } catch (error: any) {
    console.error('Attorney verification error:', error)
    
    if (error.code === 'auth/id-token-expired') {
      return {
        error: 'Token expired. Please sign in again.',
        status: 401
      }
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return {
        error: 'Token revoked. Please sign in again.',
        status: 401
      }
    }
    
    return {
      error: 'Authentication verification failed',
      status: 401
    }
  }
}

/**
 * Helper function to check if verification result is an error
 */
export function isVerificationError(
  result: AttorneyUser | VerificationError
): result is VerificationError {
  return 'error' in result
}

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(error: VerificationError): Response {
  return new Response(
    JSON.stringify({ error: error.error }),
    {
      status: error.status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}