import { google } from 'googleapis'

// Initialize Google Auth with service account
const credentials = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL || '')}`,
  universe_domain: 'googleapis.com'
}

// Create authenticated Google client
export const googleAuth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar'
  ]
})

// Initialize API clients
export const peopleClient = google.people({ version: 'v1', auth: googleAuth })
export const driveClient = google.drive({ version: 'v3', auth: googleAuth })
export const gmailClient = google.gmail({ version: 'v1', auth: googleAuth })
export const calendarClient = google.calendar({ version: 'v3', auth: googleAuth })