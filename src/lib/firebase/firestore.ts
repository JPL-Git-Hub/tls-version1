import { adminDb } from '@/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore'
import { ClientData, PortalData, CaseData, ClientCases, ClientRole, DocumentData, COLLECTIONS } from '@/types/database'

// Server-side Firestore operations using Firebase Admin SDK
// Used exclusively in API routes for elevated privileges

// Client operations
export const createClient = async (
  clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>
) => {
  const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc()
  const clientId = clientRef.id

  const fullClientData: ClientData = {
    ...clientData,
    clientId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await clientRef.set(fullClientData)
  return clientId
}

export const getClient = async (
  clientId: string
): Promise<ClientData | null> => {
  const clientDoc = await adminDb
    .collection(COLLECTIONS.CLIENTS)
    .doc(clientId)
    .get()
  return clientDoc.exists ? (clientDoc.data() as ClientData) : null
}

export const getClientByEmail = async (
  email: string
): Promise<ClientData | null> => {
  const clientSnapshot = await adminDb
    .collection(COLLECTIONS.CLIENTS)
    .where('email', '==', email)
    .limit(1)
    .get()
  
  if (clientSnapshot.empty) {
    return null
  }
  
  return clientSnapshot.docs[0].data() as ClientData
}

export const updateClient = async (
  clientId: string,
  updates: Partial<Omit<ClientData, 'clientId' | 'createdAt'>>
) => {
  const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc(clientId)
  await clientRef.update({
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Portal operations
export const createPortal = async (
  portalData: Omit<PortalData, 'createdAt' | 'updatedAt'>
) => {
  const portalUuid = portalData.portalUuid
  const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)

  const fullPortalData: PortalData = {
    ...portalData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await portalRef.set(fullPortalData)
  return portalUuid
}

export const getPortal = async (
  portalUuid: string
): Promise<PortalData | null> => {
  const portalDoc = await adminDb
    .collection(COLLECTIONS.PORTALS)
    .doc(portalUuid)
    .get()
  return portalDoc.exists ? (portalDoc.data() as PortalData) : null
}

export const getPortalByClientId = async (
  clientId: string
): Promise<PortalData | null> => {
  const portalSnapshot = await adminDb
    .collection(COLLECTIONS.PORTALS)
    .where('clientId', '==', clientId)
    .limit(1)
    .get()
  
  if (portalSnapshot.empty) {
    return null
  }
  
  return portalSnapshot.docs[0].data() as PortalData
}

export const updatePortal = async (
  portalUuid: string,
  updates: Partial<Omit<PortalData, 'portalUuid' | 'createdAt'>>
) => {
  const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)
  await portalRef.update({
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Case operations
export const createCase = async (
  caseData: Omit<CaseData, 'caseId' | 'createdAt' | 'updatedAt'>,
  clients: Array<{ clientId: string; role: ClientRole }>
) => {
  const caseRef = adminDb.collection(COLLECTIONS.CASES).doc()
  const caseId = caseRef.id

  const fullCaseData: CaseData = {
    ...caseData,
    caseId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await caseRef.set(fullCaseData)

  // Create ClientCases junction records for each client
  for (const client of clients) {
    await createClientCaseRelationship(client.clientId, caseId, client.role)
  }

  return caseId
}

// ClientCases junction table operations
export const createClientCaseRelationship = async (
  clientId: string,
  caseId: string,
  role: ClientRole
) => {
  const participantRef = adminDb.collection(COLLECTIONS.CLIENT_CASES).doc()
  const participantId = participantRef.id

  const clientCaseData: ClientCases = {
    participantId,
    clientId,
    caseId,
    role,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await participantRef.set(clientCaseData)
  return participantId
}

export const getCase = async (caseId: string): Promise<CaseData | null> => {
  const caseDoc = await adminDb.collection(COLLECTIONS.CASES).doc(caseId).get()
  
  if (!caseDoc.exists) {
    return null
  }
  
  return caseDoc.data() as CaseData
}

export const getCases = async (): Promise<CaseData[]> => {
  const casesSnapshot = await adminDb.collection(COLLECTIONS.CASES).get()
  return casesSnapshot.docs.map(doc => doc.data() as CaseData)
}

export const updateCase = async (
  caseId: string,
  updates: Partial<Omit<CaseData, 'caseId' | 'createdAt'>>
) => {
  const caseRef = adminDb.collection(COLLECTIONS.CASES).doc(caseId)
  await caseRef.update({
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Document operations
export const createDocument = async (
  documentData: Omit<DocumentData, 'documentId' | 'createdAt' | 'updatedAt'>
) => {
  const documentRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc()
  const documentId = documentRef.id

  const fullDocumentData: DocumentData = {
    ...documentData,
    documentId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await documentRef.set(fullDocumentData)
  return documentId
}

export const getDocumentsByCase = async (caseId: string): Promise<DocumentData[]> => {
  const documentsSnapshot = await adminDb
    .collection(COLLECTIONS.DOCUMENTS)
    .where('caseId', '==', caseId)
    .orderBy('createdAt', 'desc')
    .get()
  
  return documentsSnapshot.docs.map(doc => doc.data() as DocumentData)
}

export const getClientCases = async (clientId: string): Promise<string[]> => {
  const clientCasesSnapshot = await adminDb
    .collection(COLLECTIONS.CLIENT_CASES)
    .where('clientId', '==', clientId)
    .get()
  
  return clientCasesSnapshot.docs.map(doc => (doc.data() as ClientCases).caseId)
}

export const countRecentClientsByEmail = async (email: string, hoursAgo: number): Promise<number> => {
  const cutoff = Timestamp.fromDate(new Date(Date.now() - hoursAgo * 60 * 60 * 1000))
  const clientsSnapshot = await adminDb
    .collection(COLLECTIONS.CLIENTS)
    .where('email', '==', email)
    .where('createdAt', '>=', cutoff)
    .get()
  
  return clientsSnapshot.size
}