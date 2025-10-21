// Database types - persistent entities for Firestore collections
import { Timestamp as ClientTimestamp } from 'firebase/firestore'

// Type definition compatible with both client and admin Timestamps
export type TimestampType = ClientTimestamp | {
  seconds: number
  nanoseconds: number
  toDate(): Date
  toMillis(): number
}

// Status enums for persistent entities
export type PortalStatus = 'pending' | 'created' | 'active' | 'suspended'
export type RegistrationStatus = 'pending' | 'completed' | 'abandoned'
export type CaseType = 'Condo Apartment' | 'Coop Apartment' | 'Single Family House' | 'Other'
export type CaseStatus = 'intake' | 'active' | 'completed' | 'cancelled'
export type DocumentType = 'contract of sale' | 'term sheet' | 'title report' | 'board minutes' | 'offering plan' | 'financials' | 'by-laws'
export type ClientRole = 'primary' | 'co-buyer'

// Client Data Schema (attorney management, billing data)
export interface ClientData {
  clientId: string
  firstName: string
  lastName: string
  email: string
  cellPhone: string
  propertyAddress?: string
  stripeCustomerId?: string
  status: 'lead' | 'paid' | 'active' | 'inactive'
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Portal Data Schema (portalUuid as primary key)
export interface PortalData {
  portalUuid: string
  clientId: string
  clientName: string
  portalStatus: PortalStatus
  registrationStatus: RegistrationStatus
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Case Data Schema (legal matter tracking)
export interface CaseData {
  caseId: string
  clientNames: string
  caseType: CaseType
  status: CaseStatus
  propertyAddress?: string
  purchasePrice?: number
  consultationBookingId?: string
  initialAttorneyConsulted?: string
  consultationDateTime?: TimestampType
  googleDriveFolderId?: string
  googleDriveFolderUrl?: string
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Client Cases Junction Schema (client-case many-to-many relationships)
export interface ClientCases {
  participantId: string
  clientId: string
  caseId: string
  role: ClientRole
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Document Data Schema (file management with caseId reference)
export interface DocumentData {
  documentId: string
  caseId: string
  fileName: string
  fileUrl: string
  docType: DocumentType
  uploadedAt: TimestampType
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Nylas Data Schemas (calendar and booking integration)
export interface NylasGrant {
  id: string               // grant_id from Nylas
  userUid: string          // Firebase UID owner (attorney)
  provider: 'google' | 'microsoft' | string
  email: string
  scope?: string
  refreshToken?: string    // encrypted at rest if stored
  createdAt: TimestampType
  updatedAt: TimestampType
}

export interface NylasConfiguration {
  id: string               // configuration_id from Nylas
  ownerGrantId: string     // links to NylasGrant.id
  name?: string
  slug?: string            // human-readable slug for /schedule/:slug
  visibility: 'public' | 'private'
  settings?: unknown       // raw config JSON from Nylas
  createdAt: TimestampType
  updatedAt: TimestampType
}

export interface NylasBooking {
  id: string               // booking.id from Nylas webhook
  configurationId: string
  organizerGrantId?: string
  startTime: string        // ISO datetime
  endTime: string          // ISO datetime
  timezone: string
  participant: { name?: string; email?: string }
  status: 'created' | 'pending' | 'rescheduled' | 'cancelled'
  nylasEventId?: string
  raw?: unknown            // full webhook payload for audit
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Collection Names Constants
export const COLLECTIONS = {
  CLIENTS: 'clients',
  PORTALS: 'portals',
  CASES: 'cases',
  DOCUMENTS: 'documents',
  CAL_BOOKINGS: 'cal_bookings',
  CAL_WEBHOOKS: 'cal_webhooks',
  CLIENT_CASES: 'client_cases',
  STRIPE_WEBHOOKS: 'stripe_webhooks',
  NYLAS_GRANTS: 'nylas_grants',
  NYLAS_CONFIGURATIONS: 'nylas_configurations',
  NYLAS_BOOKINGS: 'nylas_bookings',
  NYLAS_WEBHOOKS: 'nylas_webhooks',
  DOCUMENT_PROCESSING: 'document_processing',
} as const