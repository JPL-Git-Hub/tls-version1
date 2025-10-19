/**
 * Test script to verify Firebase Admin SDK setup
 * Run with: node scripts/test-firebase.js
 */

require('dotenv').config({ path: '.env.local' })

async function testFirebaseConnection() {
  try {
    console.log('🔧 Testing Firebase Admin SDK connection...')
    
    // Import Firebase Admin SDK
    const { adminDb, adminAuth } = require('../src/lib/firebase/admin.ts')
    
    // Test Firestore connection
    console.log('📊 Testing Firestore connection...')
    const testDoc = adminDb.collection('_test').doc('connection-test')
    await testDoc.set({
      timestamp: new Date(),
      message: 'Firebase connection test successful',
      version: 'admin-sdk'
    })
    
    const docSnapshot = await testDoc.get()
    if (docSnapshot.exists) {
      console.log('✅ Firestore Admin SDK: Connected successfully')
      console.log('📝 Test document data:', docSnapshot.data())
      
      // Clean up test document
      await testDoc.delete()
      console.log('🧹 Test document cleaned up')
    } else {
      console.log('❌ Firestore Admin SDK: Document not found')
    }
    
    // Test Auth connection
    console.log('🔐 Testing Firebase Auth connection...')
    const users = await adminAuth.listUsers(1) // Get 1 user to test connection
    console.log('✅ Firebase Auth Admin SDK: Connected successfully')
    console.log(`👥 Current user count: ${users.users.length}`)
    
    console.log('\n🎉 All Firebase Admin SDK tests passed!')
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:')
    console.error(error.message)
    
    if (error.code) {
      console.error('Error code:', error.code)
    }
    
    if (error.message.includes('Could not load the default credentials')) {
      console.log('\n💡 Tip: Make sure your .env.local file has the correct Firebase Admin SDK credentials')
    }
    
    process.exit(1)
  }
}

// Run the test
testFirebaseConnection()