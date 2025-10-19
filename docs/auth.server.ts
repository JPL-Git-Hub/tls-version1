import { validateServiceConfig } from '../src/lib/config/ext-env-var'

const validateAuthConfig = () => {
  const config = {
    authorizedAttorneys: process.env.AUTHORIZED_ATTORNEYS,
    googleWorkspaceDomain: process.env.GOOGLE_WORKSPACE_DOMAIN,
  }

  return validateServiceConfig('Attorney authorization', config)
}

const validateNylasConfig = () => {
  const config = {
    nylasApiKey: process.env.NYLAS_API_KEY,
    nylasClientId: process.env.NYLAS_CLIENT_ID,
    nylasWebhookSecret: process.env.NYLAS_WEBHOOK_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  }

  return validateServiceConfig('Nylas integration', config)
}

const getAuthConfig = () => {
  const { authorizedAttorneys, googleWorkspaceDomain } = validateAuthConfig()

  return {
    authorizedAttorneys: authorizedAttorneys
      ? authorizedAttorneys.split(',').map(email => email.trim())
      : [],
    googleWorkspaceDomain,
  }
}

export const getNylasConfig = () => {
  const {
    nylasApiKey,
    nylasClientId,
    nylasWebhookSecret,
    googleClientId,
    googleClientSecret,
    siteUrl
  } = validateNylasConfig()

  return {
    nylasApiKey,
    nylasClientId,
    nylasWebhookSecret,
    googleClientId,
    googleClientSecret,
    siteUrl,
    callbackUrl: `${siteUrl}/api/nylas/oauth/callback`,
    baseUrl: 'https://api.us.nylas.com/v3',
  }
}

export const isAuthorizedAttorney = (email: string): boolean => {
  const { authorizedAttorneys, googleWorkspaceDomain } = getAuthConfig()

  // Check domain restriction
  if (!email.endsWith(`@${googleWorkspaceDomain}`)) {
    return false
  }

  // Check authorized attorney list
  return authorizedAttorneys.includes(email)
}
