import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { firebaseAdminConfig, useEmulator, getEmulatorConfig } from '@/lib/config/firebase.server'

// Initialize Firebase Admin app with singleton pattern
const getAdminApp = (): App => {
  if (getApps().length === 0) {
    if (useEmulator) {
      return initializeApp({
        projectId: firebaseAdminConfig.projectId,
      })
    }

    return initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey
          ? firebaseAdminConfig.privateKey.replace(/\\n/g, '\n')
          : '',
      }),
    })
  }
  return getApps()[0]
}

const adminApp = getAdminApp()

// Initialize Firebase Admin services
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

// Configure emulators using centralized pattern
const configureEmulators = () => {
  if (useEmulator) {
    const emulatorConfig = getEmulatorConfig()

    Object.entries(emulatorConfig).forEach(([key, value]) => {
      process.env[key] = value
    })
  }
}

configureEmulators()

export default adminApp