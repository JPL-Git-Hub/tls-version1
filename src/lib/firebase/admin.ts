import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { firebaseAdminConfig, useEmulator, getEmulatorConfig } from '@/lib/config/firebase.server'

// Configure emulators BEFORE initializing services
if (useEmulator) {
  const emulatorConfig = getEmulatorConfig()
  Object.entries(emulatorConfig).forEach(([key, value]) => {
    process.env[key] = value
  })
}

// Initialize Firebase Admin app with singleton pattern
const getAdminApp = (): App => {
  if (getApps().length === 0) {
    if (useEmulator) {
      // Emulator mode: NO credentials, simple project ID only
      return initializeApp({
        projectId: 'tls-version1',
        // NO credential property - prevents Google authentication
      })
    }

    // Production mode: Use service account credentials
    return initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: firebaseAdminConfig.projectId,
    })
  }
  return getApps()[0]
}

const adminApp = getAdminApp()

// Initialize Firebase Admin services
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)

export const adminStorage = getStorage(adminApp)


// Server-side ID token verification for middleware authentication
export const verifyIdToken = async (
  idToken: string
): Promise<{ uid: string; email: string } | null> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    }
  } catch (error) {
    return null
  }
}

export default adminApp