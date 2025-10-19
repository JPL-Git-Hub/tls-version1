import {
  Html,
  Head,
  Font,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'

interface BaseTemplateProps {
  preview?: string
  children: React.ReactNode
}

export function BaseTemplate({ preview, children }: BaseTemplateProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brandText}>The Law Shop</Text>
            <Text style={tagline}>Real Estate Law Made Simple</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              <strong>The Law Shop</strong><br />
              Real Estate Attorney Services<br />
              New York, NY
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or call us at{' '}
              <Link href="tel:+1234567890" style={link}>
                (123) 456-7890
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              This email contains confidential attorney-client privileged information.
              If you received this email in error, please delete it immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, Helvetica, Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '24px 24px 0',
  textAlign: 'center' as const,
}

const brandText = {
  fontSize: '28px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 8px',
}

const tagline = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 24px',
}

const content = {
  padding: '0 24px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  padding: '0 24px',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '16px',
  margin: '0 0 12px',
}

const footerDisclaimer = {
  fontSize: '11px',
  color: '#9ca3af',
  lineHeight: '14px',
  margin: '16px 0 0',
  fontStyle: 'italic',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}