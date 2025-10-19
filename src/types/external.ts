// Third-party API types and webhook schemas
import type { TimestampType } from './database'

// External API Event Types
export type StripeEventType =
  | 'payment_intent.succeeded'
  | 'invoice.paid'
  | 'subscription.updated'

// TODO: Replace with new booking system event types
// Previously used Cal.com event types removed

// Stripe Webhook Data Schema (payment event storage)
export interface StripeWebhookData {
  webhookId: string
  eventType: string
  payload: Record<string, unknown>
  processedAt: TimestampType
  createdAt: TimestampType
}

// TODO: Replace with new booking system webhook schema
// Previously used Cal.com webhook data schema removed

// TODO: Replace with new booking system data schema
// Previously used Cal.com booking data schema removed

// TODO: Replace with new booking system API types
// Previously used Cal.com API type definitions removed