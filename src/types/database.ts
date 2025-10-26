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
  googleContactResourceName?: string
  status: 'lead' | 'retained' | 'closed'
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Portal Data Schema (portalUuid as primary key)
export interface PortalData {
  portalUuid: string
  clientId: string
  portalStatus: PortalStatus
  registrationStatus: RegistrationStatus
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Case Data Schema (legal matter tracking)
export interface CaseData {
  caseId: string
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


// Collection Names Constants
export const COLLECTIONS = {
  CLIENTS: 'clients',
  PORTALS: 'portals',
  CASES: 'cases',
  DOCUMENTS: 'documents',
  CAL_BOOKINGS: 'cal_bookings',
  CAL_WEBHOOKS: 'cal_webhooks',
  CLIENT_CASES: 'client_cases',
} as const