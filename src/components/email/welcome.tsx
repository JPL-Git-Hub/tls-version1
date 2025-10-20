import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface WelcomeEmailProps {
  firstName?: string
}

export default function WelcomeEmail({ firstName = 'John' }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>The Law Shop</Text>
            <Text style={subtitle}>Real Estate Law Made Simple</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Welcome, {firstName}!</Text>
            
            <Text style={paragraph}>
              Thank you for choosing The Law Shop for your real estate legal needs. 
              We&apos;re here to make your property transaction smooth and stress-free.
            </Text>

            <Text style={paragraph}>
              Our team of experienced real estate attorneys will guide you through 
              every step of the process, from contract review to closing.
            </Text>

            <Button style={button} href="https://thelawshop.com/portal">
              Access Your Portal
            </Button>

            <Text style={paragraph}>
              If you have any questions, don&apos;t hesitate to reach out to us.
            </Text>
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              The Law Shop • Real Estate Attorney Services • New York, NY
            </Text>
            <Text style={footerText}>
              This email contains confidential attorney-client privileged information.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const title = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
}

const subtitle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0 0',
}

const content = {
  padding: '0 24px',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
}

const paragraph = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '4px 0',
}