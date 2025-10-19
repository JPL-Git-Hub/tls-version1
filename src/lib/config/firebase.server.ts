import { validateServiceConfig } from './ext-env-var'

const validateAdminConfig = () => {
  if (useEmulator) {
    return {
      projectId: 'demo-project',
      clientEmail: 'demo@demo-project.iam.gserviceaccount.com',
      privateKey:
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC=\n-----END PRIVATE KEY-----\n',
    }
  }

  // Production credentials: Centralized validation (security-critical, fail-fast)
  return validateServiceConfig('Firebase admin', {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  })
}

export const useEmulator = process.env.USE_EMULATOR === 'true'
export const firebaseAdminConfig = validateAdminConfig()

// Emulator configuration: Inline defaults (development-only, fail-safe)
export const getEmulatorConfig = () => {
  if (!useEmulator) return {}
  
  return {
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080',
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099',
  }
}