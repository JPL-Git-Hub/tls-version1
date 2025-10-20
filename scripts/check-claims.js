// Quick script to check existing custom claims
const { adminAuth } = require('../src/lib/firebase/admin.ts')

async function checkAllUserClaims() {
  try {
    console.log('🔍 Checking existing custom claims...\n')
    
    // List all users
    const listUsersResult = await adminAuth.listUsers()
    
    if (listUsersResult.users.length === 0) {
      console.log('No users found in Firebase Auth')
      return
    }
    
    for (const user of listUsersResult.users) {
      console.log(`📧 User: ${user.email || 'No email'}`)
      console.log(`🆔 UID: ${user.uid}`)
      console.log(`📅 Created: ${user.metadata.creationTime}`)
      
      // Get custom claims
      const userRecord = await adminAuth.getUser(user.uid)
      const claims = userRecord.customClaims || {}
      
      if (Object.keys(claims).length > 0) {
        console.log(`🔑 Custom Claims:`, JSON.stringify(claims, null, 2))
      } else {
        console.log(`🔑 Custom Claims: None`)
      }
      
      console.log('─'.repeat(50))
    }
  } catch (error) {
    console.error('❌ Error checking claims:', error.message)
  }
}

checkAllUserClaims()