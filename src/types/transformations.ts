// Type transformations for data flow between different layers
// Provides explicit mapping logic for agentic coding clarity

import type { ClientData, CaseData, ClientCases, DocumentData, TimestampType } from './database'


// Form Data → Database Entity Transformations

/**
 * Transforms lead form submission into client database record
 * Used by: /api/leads/submit
 */
export const leadToClient = (
  lead: { firstName: string; lastName: string; email: string; cellPhone: string },
  clientId: string,
  timestamp: TimestampType
): ClientData => ({
  clientId,
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  cellPhone: lead.cellPhone,
  status: 'lead', // Initial status for new leads
  createdAt: timestamp,
  updatedAt: timestamp
})

/**
 * Creates initial case record with default values
 * Used by: /api/clients/create
 */
export const createCaseData = (
  caseId: string,
  timestamp: TimestampType
): CaseData => ({
  caseId,
  caseType: 'Other', // Default until client specifies property type
  status: 'intake', // Initial status for new cases
  createdAt: timestamp,
  updatedAt: timestamp
})

/**
 * Creates client-case relationship junction record
 * Used by: /api/leads/submit
 */
export const createClientCaseRelationship = (
  participantId: string,
  clientId: string,
  caseId: string,
  timestamp: TimestampType
): ClientCases => ({
  participantId,
  clientId,
  caseId,
  role: 'primary', // Lead submitter is primary client
  createdAt: timestamp,
  updatedAt: timestamp
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
  uploadedAt: TimestampType,
  timestamp: TimestampType
): DocumentData => ({
  documentId,
  caseId,
  fileName,
  fileUrl,
  docType,
  uploadedAt,
  createdAt: timestamp,
  updatedAt: timestamp
})

// External API → Database Entity Transformations

// Case Display Helpers

/**
 * Builds display name from ClientCases junction + ClientData
 * Use this for listings, reports, UI display
 * Returns format: "John Smith" or "John Smith & Jane Doe"
 */
export const getCaseDisplayName = async (
  caseId: string,
  adminDb: any // FirebaseFirestore.Firestore from admin SDK
): Promise<string> => {
  const relationshipsSnapshot = await adminDb
    .collection('client_cases')
    .where('caseId', '==', caseId)
    .orderBy('createdAt', 'asc') // Primary client first
    .get()
  
  if (relationshipsSnapshot.empty) return 'Unknown'
  
  const clientNames = await Promise.all(
    relationshipsSnapshot.docs.map(async (doc: any) => {
      const clientDoc = await adminDb.collection('clients').doc(doc.data().clientId).get()
      if (!clientDoc.exists) return null
      const client = clientDoc.data()
      return `${client.firstName} ${client.lastName}`
    })
  )
  
  const validNames = clientNames.filter(Boolean)
  return validNames.join(' & ')
}

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
  // Note: cellPhone omitted for privacy
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

