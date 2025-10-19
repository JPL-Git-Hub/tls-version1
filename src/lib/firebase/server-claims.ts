import { adminAuth } from '@/lib/firebase/admin'
import { UserClaims } from '@/lib/firebase/client-claims'

// Set attorney role for @thelawshop.com users
export const setAttorneyClaims = async (uid: string, email: string) => {
  if (!email.endsWith('@thelawshop.com')) {
    throw new Error(
      'Attorney claims can only be set for @thelawshop.com emails'
    )
  }

  const claims: UserClaims = {
    role: 'attorney',
    attorney: true,
  }

  await adminAuth.setCustomUserClaims(uid, claims)
}

// Set client role for portal users
export const setClientClaims = async (uid: string, portalUuid: string) => {
  const claims: UserClaims = {
    role: 'client',
    client: true,
    portalAccess: [portalUuid],
  }

  await adminAuth.setCustomUserClaims(uid, claims)
}

// Verify attorney role from token
export const verifyAttorneyToken = async (
  idToken: string
): Promise<boolean> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken.role === 'attorney'
  } catch (error) {
    return false
  }
}

// Verify client role and portal access
export const verifyClientPortalAccess = async (
  idToken: string,
  portalUuid: string
): Promise<boolean> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return (
      decodedToken.role === 'client' &&
      Array.isArray(decodedToken.portalAccess) &&
      decodedToken.portalAccess.includes(portalUuid)
    )
  } catch (error) {
    return false
  }
}