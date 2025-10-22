require('dotenv').config({ path: '.env.local' })
const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  const useEmulator = process.env.USE_EMULATOR === 'true'
  
  if (useEmulator) {
    // Emulator mode: NO credentials, simple project ID only
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    
    admin.initializeApp({
      projectId: 'tls-version1',
      // NO credential property - prevents Google authentication
    })
    
    console.log('🧪 Using Firebase emulators')
  } else {
    // Production mode
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    
    console.log('🔥 Using production Firebase')
  }
}

const adminAuth = admin.auth()

async function setAttorneyClaims() {
  try {
    console.log('🔍 Looking for users to set attorney claims...\n')
    
    // List all users
    const listUsersResult = await adminAuth.listUsers()
    
    if (listUsersResult.users.length === 0) {
      console.log('❌ No users found in Firebase Auth')
      return
    }
    
    // Show all users and let user choose
    console.log('Found users:')
    listUsersResult.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'} (UID: ${user.uid})`)
    })
    
    // For now, set attorney claims on the first user with @thelawshop.com email
    const lawShopUser = listUsersResult.users.find(user => 
      user.email && user.email.endsWith('@thelawshop.com')
    )
    
    if (!lawShopUser) {
      console.log('❌ No @thelawshop.com user found')
      return
    }
    
    console.log(`\n🎯 Setting attorney claims for: ${lawShopUser.email}`)
    
    // Set custom claims
    await adminAuth.setCustomUserClaims(lawShopUser.uid, {
      role: 'attorney',
      attorney: true
    })
    
    console.log('✅ Attorney claims set successfully!')
    console.log(`User ${lawShopUser.email} now has role: attorney`)
    
    // Verify the claims were set
    const updatedUser = await adminAuth.getUser(lawShopUser.uid)
    console.log('🔑 Current claims:', JSON.stringify(updatedUser.customClaims, null, 2))
    
  } catch (error) {
    console.error('❌ Error setting claims:', error.message)
  }
}

setAttorneyClaims()