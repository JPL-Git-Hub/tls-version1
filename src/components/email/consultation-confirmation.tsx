import { Text, Section, Button } from '@react-email/components'
import { BaseTemplate } from './base-template'

interface ConsultationConfirmationProps {
  firstName: string
  lastName: string
  consultationDateTime: string
  bookingId: string
  propertyAddress?: string
}

export default function ConsultationConfirmation({
  firstName,
  lastName,
  consultationDateTime,
  bookingId,
  propertyAddress,
}: ConsultationConfirmationProps) {
  const formattedDate = new Date(consultationDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  
  const formattedTime = new Date(consultationDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return (
    <BaseTemplate preview={`Consultation confirmed for ${formattedDate}`}>
      <Text style={heading}>
        Your consultation is confirmed!
      </Text>
      
      <Text style={paragraph}>
        Hi {firstName},
      </Text>
      
      <Text style={paragraph}>
        Thank you for scheduling a consultation with The Law Shop. We&apos;re excited to help you with your real estate transaction.
      </Text>
      
      {/* Consultation Details */}
      <Section style={detailsSection}>
        <Text style={detailsHeading}>Consultation Details</Text>
        <Text style={detailsText}>
          <strong>Date:</strong> {formattedDate}<br />
          <strong>Time:</strong> {formattedTime}<br />
          <strong>Booking ID:</strong> {bookingId}
        </Text>
        {propertyAddress && (
          <Text style={detailsText}>
            <strong>Property:</strong> {propertyAddress}
          </Text>
        )}
      </Section>
      
      {/* What to Expect */}
      <Text style={subheading}>What to expect:</Text>
      <Text style={paragraph}>
        During our 30-minute consultation, we&apos;ll discuss:
      </Text>
      <Text style={listItem}>• Your real estate transaction timeline</Text>
      <Text style={listItem}>• Required legal documentation</Text>
      <Text style={listItem}>• Our fee structure (0.35% of purchase price)</Text>
      <Text style={listItem}>• Next steps to get started</Text>
      
      {/* Preparation */}
      <Text style={subheading}>Please prepare:</Text>
      <Text style={listItem}>• Purchase contract or term sheet (if available)</Text>
      <Text style={listItem}>• Property address and purchase price</Text>
      <Text style={listItem}>• Any questions about the transaction</Text>
      
      {/* Action Button */}
      <Section style={buttonSection}>
        <Button style={button} href="https://calendly.com/your-booking-link">
          View/Reschedule Appointment
        </Button>
      </Section>
      
      <Text style={paragraph}>
        We look forward to speaking with you soon!
      </Text>
      
      <Text style={signature}>
        Best regards,<br />
        <strong>The Law Shop Team</strong>
      </Text>
    </BaseTemplate>
  )
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 24px',
}

const subheading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '24px 0 12px',
}

const paragraph = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const listItem = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 8px',
  paddingLeft: '16px',
}

const detailsSection = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
}

const detailsHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 12px',
}

const detailsText = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const signature = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '32px 0 0',
}

// Default props for preview
ConsultationConfirmation.PreviewProps = {
  firstName: 'John',
  lastName: 'Doe',
  consultationDateTime: '2024-03-15T14:00:00Z',
  bookingId: 'cal_abc123',
  propertyAddress: '123 Main Street, Brooklyn, NY 11201',
} as ConsultationConfirmationProps