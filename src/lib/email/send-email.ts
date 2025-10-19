import { render } from '@react-email/render'
import { createElement } from 'react'
import { getEmailTransporter } from './transport'

interface EmailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

interface SendEmailParams {
  to: string
  subject: string
  template: React.ComponentType<Record<string, unknown>>
  data: Record<string, unknown>
  attachments?: EmailAttachment[]
  from?: string
}

export async function sendEmail({
  to,
  subject,
  template: EmailTemplate,
  data,
  attachments = [],
  from = 'attorney@thelawshop.com',
}: SendEmailParams): Promise<void> {
  try {
    // Render the React email template to HTML
    const html = await render(createElement(EmailTemplate, data))
    
    // Get the configured transporter
    const transporter = await getEmailTransporter()
    
    // Email options
    const mailOptions = {
      from: {
        name: 'The Law Shop',
        address: from,
      },
      to,
      subject,
      html,
      attachments: attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    }
    
    // Send the email
    const result = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      to,
      subject,
    })
    
    return
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Utility function to create calendar .ics attachment
export function createCalendarAttachment(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string
): EmailAttachment {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Law Shop//Consultation//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@thelawshop.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description}` : '',
    location ? `LOCATION:${location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
  
  return {
    filename: 'consultation.ics',
    content: Buffer.from(icsContent, 'utf8'),
    contentType: 'text/calendar',
  }
}