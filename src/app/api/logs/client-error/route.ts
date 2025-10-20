import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, context } = body

    // Create logs directory if it doesn't exist
    const logsDir = join(process.cwd(), 'logs')
    await mkdir(logsDir, { recursive: true })

    // Format error log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'CLIENT_ERROR',
      code: error.code,
      message: error.message,
      stack: error.stack,
      url: error.url,
      userAgent: error.userAgent,
      context: context
    }

    // Write to error.log file
    const logLine = JSON.stringify(logEntry) + '\n'
    const logPath = join(logsDir, 'error.log')
    
    await writeFile(logPath, logLine, { flag: 'a' })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to log client error:', err)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}