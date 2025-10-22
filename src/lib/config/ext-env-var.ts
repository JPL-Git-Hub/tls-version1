export const validateServiceConfig = <
  T extends Record<string, string | undefined>,
>(
  serviceName: string,
  config: T
): T => {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `${serviceName} configuration failed. Missing: ${missing.join(', ')}`
    )
  }

  return config
}

// External service configuration
const validateExternalConfig = () => {
  const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('Missing required environment variable: CALCOM_WEBHOOK_SECRET')
  }
  
  return {
    calcom: {
      webhookSecret
    }
  }
}

export const externalConfig = validateExternalConfig()
