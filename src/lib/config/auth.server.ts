import { validateServiceConfig } from './ext-env-var'

const validateGoogleConfig = () => {
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googlePrivateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
  }

  return validateServiceConfig('Google APIs', config)
}

const validateEmailConfig = () => {
  const config = {
    gmailClientId: process.env.GMAIL_CLIENT_ID,
    gmailClientSecret: process.env.GMAIL_CLIENT_SECRET,
    gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN,
    gmailUser: process.env.GMAIL_USER,
  }

  return validateServiceConfig('Gmail transport', config)
}

export const getGoogleConfig = () => validateGoogleConfig()
export const getEmailConfig = () => validateEmailConfig()