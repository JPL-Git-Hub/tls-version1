// Type transformations for data flow between different layers
// Provides explicit mapping logic for agentic coding clarity

import { Timestamp } from 'firebase-admin/firestore'
import type { ClientData, CaseData, ClientCases, DocumentData } from './database'
import type { StripeWebhookData } from './external'

// Note: LeadFormData will be defined in inputs.ts when form validation is implemented

// Form Data → Database Entity Transformations

/**
 * Transforms lead form submission into client database record
 * Used by: /api/leads/submit
 */
export const leadToClient = (
  lead: { firstName: string; lastName: string; email: string; cellPhone: string },
  clientId: string
): ClientData => ({
  clientId,
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  cellPhone: lead.cellPhone,
  status: 'lead', // Initial status for new leads
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
})

/**
 * Creates initial case record from lead form data
 * Used by: /api/leads/submit
 */
export const leadToCase = (
  lead: { firstName: string; lastName: string },
  caseId: string
): CaseData => ({
  caseId,
  clientNames: `${lead.firstName} ${lead.lastName}`,
  caseType: 'Other', // Default until client specifies property type
  status: 'intake', // Initial status for new cases
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
})

/**
 * Creates client-case relationship junction record
 * Used by: /api/leads/submit
 */
export const createClientCaseRelationship = (
  participantId: string,
  clientId: string,
  caseId: string
): ClientCases => ({
  participantId,
  clientId,
  caseId,
  role: 'primary', // Lead submitter is primary client
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
})

// Document Upload → Database Entity Transformations

/**
 * Transforms document upload request into document metadata record
 * Used by: /api/documents/create
 */
export const uploadToDocument = (
  documentId: string,
  caseId: string,
  fileName: string,
  fileUrl: string,
  docType: DocumentData['docType'],
  uploadedAt: Date
): DocumentData => ({
  documentId,
  caseId,
  fileName,
  fileUrl,
  docType,
  uploadedAt: Timestamp.fromDate(uploadedAt),
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
})

// External API → Database Entity Transformations

/**
 * Transforms Stripe webhook payload into database record
 * Used by: Stripe webhook handlers (when implemented)
 */
export const stripeWebhookToRecord = (
  webhookId: string,
  eventType: string,
  payload: Record<string, unknown>
): StripeWebhookData => ({
  webhookId,
  eventType,
  payload,
  processedAt: Timestamp.now(),
  createdAt: Timestamp.now()
})

// Database Entity → API Response Transformations

/**
 * Transforms database client record for API responses
 * Removes sensitive fields and formats timestamps
 */
export const clientToApiResponse = (client: ClientData) => ({
  clientId: client.clientId,
  firstName: client.firstName,
  lastName: client.lastName,
  email: client.email,
  status: client.status,
  createdAt: client.createdAt.toDate().toISOString(),
  // Note: cellPhone and stripeCustomerId omitted for privacy
})

/**
 * Transforms database document record for client portal display
 * Formats timestamps and adds display-friendly fields
 */
export const documentToPortalResponse = (doc: DocumentData) => ({
  documentId: doc.documentId,
  fileName: doc.fileName,
  docType: doc.docType,
  uploadedAt: doc.uploadedAt.toDate().toISOString(),
  // Note: fileUrl omitted - use separate download API for security
})

// Validation Helpers

/**
 * Validates that lead form data can be safely transformed
 */
export const validateLeadTransformation = (lead: {
  firstName: string
  lastName: string
  email: string
  cellPhone: string
}): boolean => {
  return !!(
    lead.firstName?.trim() &&
    lead.lastName?.trim() &&
    lead.email?.trim() &&
    lead.cellPhone?.trim()
  )
}

/**
 * Validates that document upload data is complete
 */
export const validateDocumentTransformation = (
  fileName: string,
  fileUrl: string,
  caseId: string
): boolean => {
  return !!(
    fileName?.trim() &&
    fileUrl?.trim() &&
    caseId?.trim()
  )
}