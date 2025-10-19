import nodemailer from 'nodemailer'
import { google } from 'googleapis'

// Create Gmail OAuth2 transporter
async function createGmailTransporter() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  })

  try {
    const { token } = await oauth2Client.getAccessToken()
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER || 'attorney@thelawshop.com',
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: token || '',
      },
    })

    return transporter
  } catch (error) {
    console.error('Failed to create Gmail transporter:', error)
    throw new Error('Gmail authentication failed')
  }
}

// Alternative: Service account transporter (for domain-wide delegation)
function createServiceAccountTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: 'attorney@thelawshop.com',
      serviceClient: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  })
}

// Export the appropriate transporter based on available credentials
export async function getEmailTransporter() {
  if (process.env.GMAIL_REFRESH_TOKEN) {
    return await createGmailTransporter()
  } else {
    return createServiceAccountTransporter()
  }
}