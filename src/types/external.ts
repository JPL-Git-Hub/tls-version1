// Third-party API types and webhook schemas
import type { TimestampType } from './database'

// External API Event Types
export type StripeEventType =
  | 'payment_intent.succeeded'
  | 'invoice.paid'
  | 'subscription.updated'

// Cal.com Webhook Event Types
export type CalcomEventType = 
  | 'BOOKING_CREATED'
  | 'BOOKING_RESCHEDULED' 
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_REQUESTED'

// Cal.com Booking Responses (custom form fields)
export interface CalcomBookingResponses {
  phone?: string
  caseType?: string
  urgency?: string
  additionalDetails?: string
  [key: string]: string | undefined // Allow other custom fields
}

// Cal.com Webhook Payload Structure
export interface CalcomWebhookPayload {
  triggerEvent: CalcomEventType
  createdAt: string
  payload: {
    type: string
    title: string
    description?: string
    additionalNotes?: string
    customInputs?: Record<string, any>
    startTime: string
    endTime: string
    organizer: {
      id: number
      name: string
      email: string
      username: string
      timeZone: string
    }
    attendees: Array<{
      email: string
      name: string
      timeZone: string
      language: {
        locale: string
      }
    }>
    location?: string
    destinationCalendar?: {
      id: number
      integration: string
      externalId: string
      primaryEmail: string
      userId: number
    }
    uid: string
    recurringEventId?: string
    metadata?: Record<string, any>
    responses?: CalcomBookingResponses
  }
}

// Cal.com Webhook Data Schema (webhook event storage)
export interface CalcomWebhookData {
  webhookId: string
  eventType: CalcomEventType
  payload: CalcomWebhookPayload
  processedAt: TimestampType
  createdAt: TimestampType
}

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