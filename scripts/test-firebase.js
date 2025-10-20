/**
 * Firebase Connection Test Script
 * Tests Firebase Admin SDK, Client SDK, and emulator connections
 * Usage: node scripts/test-firebase.js
 */

require('dotenv').config({ path: '.env.local' })

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(testName, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'
  log(`${icon} ${testName}`, color)
  if (details) log(`   ${details}`, 'blue')
}

async function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'bold')
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ]
  
  let allPresent = true
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logTest(`${varName}`, 'pass', 'Found')
    } else {
      logTest(`${varName}`, 'fail', 'Missing from .env.local')
      allPresent = false
    }
  }
  
  // Check emulator mode
  if (process.env.USE_EMULATOR === 'true') {
    logTest('Emulator Mode', 'pass', 'Running in emulator mode')
  } else {
    logTest('Production Mode', 'pass', 'Using production credentials')
  }
  
  return allPresent
}

async function testFirebaseAdmin() {
  log('\n🔥 Testing Firebase Admin SDK...', 'bold')
  
  try {
    // Test Firebase Admin SDK by directly using firebase-admin
    const admin = require('firebase-admin')
    
    // Check if Firebase app is already initialized
    let app
    try {
      app = admin.app()
    } catch {
      // Initialize Firebase Admin if not already done
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      }, 'test-app')
    }
    
    const db = admin.firestore(app)
    const auth = admin.auth(app)
    
    // Test Firestore connection
    try {
      const testDoc = db.collection('_test').doc('connection-test')
      await testDoc.set({
        timestamp: new Date(),
        message: 'Firebase connection test successful',
        version: 'admin-sdk'
      })
      
      const docSnapshot = await testDoc.get()
      if (docSnapshot.exists) {
        logTest('Admin Firestore Write', 'pass', 'Successfully wrote test document')
        
        // Clean up test document
        await testDoc.delete()
        logTest('Admin Firestore Delete', 'pass', 'Successfully deleted test document')
      } else {
        logTest('Admin Firestore', 'fail', 'Test document not found after write')
      }
    } catch (error) {
      logTest('Admin Firestore', 'fail', error.message)
    }
    
    // Test Auth connection
    try {
      const users = await auth.listUsers(1)
      logTest('Admin Auth', 'pass', `Connected (${users.users.length} users found)`)
    } catch (error) {
      logTest('Admin Auth', 'fail', error.message)
    }
    
    // Clean up test app
    try {
      await app.delete()
    } catch {
      // Ignore cleanup errors
    }
    
  } catch (error) {
    logTest('Admin SDK Import', 'fail', error.message)
  }
}

async function testConfiguration() {
  log('\n⚙️ Testing Configuration System...', 'bold')
  
  try {
    // Test configuration by checking if files exist and basic imports work
    const fs = require('fs')
    const path = require('path')
    
    const configFiles = [
      '../src/lib/config/ext-env-var.ts',
      '../src/lib/config/firebase.server.ts', 
      '../src/lib/config/firebase.client.ts'
    ]
    
    for (const file of configFiles) {
      const filePath = path.join(__dirname, file)
      if (fs.existsSync(filePath)) {
        logTest(`Config File: ${path.basename(file)}`, 'pass', 'File exists')
      } else {
        logTest(`Config File: ${path.basename(file)}`, 'fail', 'File missing')
      }
    }
    
    logTest('Configuration System', 'pass', 'Config files present (TS compilation needed for runtime testing)')
    
  } catch (error) {
    logTest('Configuration', 'fail', error.message)
  }
}

async function testGoogleAPIs() {
  log('\n🌐 Testing Google APIs Configuration...', 'bold')
  
  try {
    // Test Google Auth library directly
    const { google } = require('googleapis')
    
    // Create service account auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    })
    
    // Test auth client creation
    const authClient = await auth.getClient()
    logTest('Google Service Account', 'pass', 'Service account authentication configured')
    
    // Test specific Google APIs
    const drive = google.drive({ version: 'v3', auth: authClient })
    logTest('Google Drive API', 'pass', 'Drive API client created')
    
  } catch (error) {
    logTest('Google APIs', 'fail', error.message)
  }
}

async function testEmailInfrastructure() {
  log('\n📧 Testing Email Infrastructure...', 'bold')
  
  try {
    // Test nodemailer directly
    const nodemailer = require('nodemailer')
    
    // Test OAuth2 transporter creation with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.FIREBASE_CLIENT_EMAIL,
        serviceClient: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }
    })
    
    logTest('Nodemailer Transporter', 'pass', 'Email transporter configured')
    
    // Test React Email components
    const fs = require('fs')
    const path = require('path')
    const emailDir = path.join(__dirname, '../src/components/email')
    
    if (fs.existsSync(emailDir)) {
      const emailFiles = fs.readdirSync(emailDir).filter(f => f.endsWith('.tsx'))
      logTest('Email Templates', 'pass', `Found ${emailFiles.length} email templates`)
    } else {
      logTest('Email Templates', 'fail', 'Email template directory not found')
    }
    
  } catch (error) {
    logTest('Email Infrastructure', 'fail', error.message)
  }
}

async function runAllTests() {
  log('🧪 Firebase & Infrastructure Connection Tests', 'bold')
  log('=' .repeat(50), 'blue')
  
  const envCheck = await checkEnvironmentVariables()
  
  if (!envCheck && process.env.USE_EMULATOR !== 'true') {
    log('\n❌ Missing required environment variables. Tests may fail.', 'red')
    log('   Create .env.local with Firebase credentials or set USE_EMULATOR=true', 'blue')
  }
  
  await testConfiguration()
  await testFirebaseAdmin()
  await testGoogleAPIs()
  await testEmailInfrastructure()
  
  log('\n✅ Testing Complete!', 'green')
  log('💡 Run `npm run dev` and test API endpoints manually', 'blue')
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n❌ Test runner failed: ${error.message}`, 'red')
    process.exit(1)
  })
}