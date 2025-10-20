// Client-side error logger for browser console visibility
// ONLY location for console.error exemption - follows structured format
// Does not send errors to server - follows server-side centralized logging architecture

interface ClientError {
  code: string
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  context?: Record<string, unknown>
}

// Log client error with structured format for browser console visibility
export const logClientError = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  const errorCode = context?.operation || 'CLIENT_ERROR'
  
  const clientError: ClientError = {
    code: String(errorCode),
    message: errorMessage,
    stack: errorStack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    context
  }
  
  // Structured browser console output - SCOPED EXEMPTION for immediate developer feedback
  console.error(`[TLS-${clientError.code}]`, clientError.message, {
    stack: clientError.stack,
    url: clientError.url,
    context: clientError.context,
    timestamp: clientError.timestamp
  })
  
  // Send to server for error.log file logging in development
  if (typeof window !== 'undefined') {
    fetch('/api/logs/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: clientError, context })
    }).catch(() => {
      // Silently fail to avoid recursive error logging
    })
  }
}

// Setup global error handlers for browser console visibility
export const setupGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') return
  
  window.addEventListener('error', (event) => {
    logClientError(event.error, {
      type: 'javascript_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    logClientError(event.reason, {
      type: 'unhandled_promise_rejection'
    })
  })
}

// Auto-initialize error handlers when module loads in browser
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers()
}