import { logClientError } from './logger.client'

// Async wrapper with automatic error logging
export async function withLogging<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logClientError(error, { operation })
    throw error
  }
}

// Sync wrapper with automatic error logging
export function withLoggingSync<T>(
  operation: string,
  fn: () => T
): T {
  try {
    return fn()
  } catch (error) {
    logClientError(error, { operation })
    throw error
  }
}

// Fetch wrapper with automatic error logging
export async function fetchWithLogging(
  operation: string,
  url: string,
  options?: RequestInit
): Promise<Response> {
  return withLogging(operation, async () => {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  })
}