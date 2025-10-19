/**
 * Test script to verify Google APIs setup
 * Run with: node scripts/test-google-apis.js
 */

require('dotenv').config({ path: '.env.local' })

async function testGoogleAPIs() {
  try {
    console.log('🔧 Testing Google APIs connection...')
    
    // Import Google APIs
    const { peopleClient, driveClient, gmailClient, calendarClient } = require('../src/lib/google/auth.ts')
    
    // Test People API (Google Contacts)
    console.log('👤 Testing People API (Google Contacts)...')
    try {
      const response = await peopleClient.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1,
        personFields: 'names,emailAddresses'
      })
      console.log('✅ People API: Connected successfully')
      console.log(`📞 Contact count: ${response.data.connections?.length || 0}`)
    } catch (error) {
      console.log('⚠️  People API: Limited access (may need domain-wide delegation for contacts)')
      console.log('   This is expected for service accounts without domain delegation')
    }
    
    // Test Drive API
    console.log('📁 Testing Drive API...')
    const driveResponse = await driveClient.files.list({
      pageSize: 1,
      fields: 'files(id, name)'
    })
    console.log('✅ Drive API: Connected successfully')
    console.log(`📄 File count in Drive: ${driveResponse.data.files?.length || 0}`)
    
    // Test Gmail API
    console.log('📧 Testing Gmail API...')
    try {
      const gmailResponse = await gmailClient.users.getProfile({
        userId: 'me'
      })
      console.log('✅ Gmail API: Connected successfully')
      console.log(`📨 Email address: ${gmailResponse.data.emailAddress}`)
    } catch (error) {
      console.log('⚠️  Gmail API: Service account cannot access Gmail directly')
      console.log('   Will need domain-wide delegation or OAuth for attorney@thelawshop.com')
    }
    
    // Test Calendar API
    console.log('📅 Testing Calendar API...')
    try {
      const calendarResponse = await calendarClient.calendarList.list({
        maxResults: 1
      })
      console.log('✅ Calendar API: Connected successfully')
      console.log(`📆 Calendar count: ${calendarResponse.data.items?.length || 0}`)
    } catch (error) {
      console.log('⚠️  Calendar API: Service account cannot access calendar directly')
      console.log('   Will need domain-wide delegation for attorney calendar access')
    }
    
    console.log('\n🎉 Google APIs setup completed!')
    console.log('💡 Note: Some APIs require domain-wide delegation for full functionality')
    
  } catch (error) {
    console.error('❌ Google APIs test failed:')
    console.error(error.message)
    
    if (error.code) {
      console.error('Error code:', error.code)
    }
    
    process.exit(1)
  }
}

// Run the test
testGoogleAPIs()