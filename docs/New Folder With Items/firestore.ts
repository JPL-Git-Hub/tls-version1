import { adminDb } from '@/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore'
import { ClientData, PortalData, CaseData, ClientCases, ClientRole, DocumentData, COLLECTIONS } from '@/types/database'
import { logFirebaseError } from '@/lib/logging/logger.server'
import { googleDrive } from '@/lib/google/drive'

// Server-side Firestore operations using Firebase Admin SDK
// Used exclusively in API routes for elevated privileges

// Client operations
export const createClient = async (
  clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>
) => {
  let clientId: string | undefined

  try {
    const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc()
    clientId = clientRef.id

    const fullClientData: ClientData = {
      ...clientData,
      clientId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await clientRef.set(fullClientData)
    return clientId
  } catch (error) {
    logFirebaseError(
      'CLIENT_CREATION_FAILED',
      error,
      {
        clientId,
        clientData: {
          email: clientData.email,
          firstName: clientData.firstName,
          lastName: clientData.lastName,
        },
      }
    )
    throw error
  }
}

export const getClient = async (
  clientId: string
): Promise<ClientData | null> => {
  try {
    const clientDoc = await adminDb
      .collection(COLLECTIONS.CLIENTS)
      .doc(clientId)
      .get()
    return clientDoc.exists ? (clientDoc.data() as ClientData) : null
  } catch (error) {
    logFirebaseError(
      'CLIENT_RETRIEVAL_FAILED',
      error,
      { clientId }
    )
    throw error
  }
}

export const getClientByEmail = async (
  email: string
): Promise<ClientData | null> => {
  try {
    const clientSnapshot = await adminDb
      .collection(COLLECTIONS.CLIENTS)
      .where('email', '==', email)
      .limit(1)
      .get()
    
    if (clientSnapshot.empty) {
      return null
    }
    
    return clientSnapshot.docs[0].data() as ClientData
  } catch (error) {
    logFirebaseError(
      'CLIENT_BY_EMAIL_RETRIEVAL_FAILED',
      error,
      { email }
    )
    throw error
  }
}

export const updateClient = async (
  clientId: string,
  updates: Partial<Omit<ClientData, 'clientId' | 'createdAt'>>
) => {
  try {
    const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc(clientId)
    await clientRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    logFirebaseError(
      'CLIENT_UPDATE_FAILED',
      error,
      { clientId, updates }
    )
    throw error
  }
}

// Portal operations
export const createPortal = async (
  portalData: Omit<PortalData, 'createdAt' | 'updatedAt'>
) => {
  let portalUuid: string | undefined

  try {
    portalUuid = portalData.portalUuid
    const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)

    const fullPortalData: PortalData = {
      ...portalData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await portalRef.set(fullPortalData)
    return portalUuid
  } catch (error) {
    logFirebaseError(
      'PORTAL_CREATION_FAILED',
      error,
      {
        portalUuid,
        clientId: portalData.clientId,
        clientName: portalData.clientName,
      }
    )
    throw error
  }
}

export const getPortal = async (
  portalUuid: string
): Promise<PortalData | null> => {
  try {
    const portalDoc = await adminDb
      .collection(COLLECTIONS.PORTALS)
      .doc(portalUuid)
      .get()
    return portalDoc.exists ? (portalDoc.data() as PortalData) : null
  } catch (error) {
    logFirebaseError(
      'PORTAL_RETRIEVAL_FAILED',
      error,
      { portalUuid }
    )
    throw error
  }
}

export const getPortalByClientId = async (
  clientId: string
): Promise<PortalData | null> => {
  try {
    const portalSnapshot = await adminDb
      .collection(COLLECTIONS.PORTALS)
      .where('clientId', '==', clientId)
      .limit(1)
      .get()
    
    if (portalSnapshot.empty) {
      return null
    }
    
    return portalSnapshot.docs[0].data() as PortalData
  } catch (error) {
    logFirebaseError(
      'PORTAL_BY_CLIENT_RETRIEVAL_FAILED',
      error,
      { clientId }
    )
    throw error
  }
}

export const updatePortal = async (
  portalUuid: string,
  updates: Partial<Omit<PortalData, 'portalUuid' | 'createdAt'>>
) => {
  try {
    const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)
    await portalRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    logFirebaseError(
      'PORTAL_UPDATE_FAILED',
      error,
      { portalUuid, updates }
    )
    throw error
  }
}

// Case operations
export const createCase = async (
  caseData: Omit<CaseData, 'caseId' | 'createdAt' | 'updatedAt'>,
  clients: Array<{ clientId: string; role: ClientRole }>
) => {
  let caseId: string | undefined
  let driveFolder: { id: string; webViewLink: string } | null = null

  try {
    const caseRef = adminDb.collection(COLLECTIONS.CASES).doc()
    caseId = caseRef.id

    // Create Google Drive folder for the case
    try {
      const folderName = googleDrive.generateCaseFolderName(caseId, caseData.clientNames)
      driveFolder = await googleDrive.createCaseFolder({ name: folderName })
    } catch (driveError) {
      // Log Drive error but don't fail case creation
      logFirebaseError(
        'DRIVE_FOLDER_CREATION_FAILED',
        driveError,
        {
          caseId,
          clientNames: caseData.clientNames,
          folderName: googleDrive.generateCaseFolderName(caseId, caseData.clientNames)
        }
      )
    }

    const fullCaseData: CaseData = {
      ...caseData,
      caseId,
      googleDriveFolderId: driveFolder?.id,
      googleDriveFolderUrl: driveFolder?.webViewLink,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await caseRef.set(fullCaseData)

    // Create ClientCases junction records for each client
    for (const client of clients) {
      await createClientCaseRelationship(client.clientId, caseId, client.role)
    }

    return caseId
  } catch (error) {
    logFirebaseError(
      'CASE_CREATION_FAILED',
      error,
      {
        caseId,
        clients: clients.map(c => ({ clientId: c.clientId, role: c.role })),
        caseType: caseData.caseType,
        status: caseData.status,
        driveFolder: driveFolder ? { id: driveFolder.id, url: driveFolder.webViewLink } : 'creation_failed'
      }
    )
    throw error
  }
}

// ClientCases junction table operations
export const createClientCaseRelationship = async (
  clientId: string,
  caseId: string,
  role: ClientRole
) => {
  let participantId: string | undefined

  try {
    const participantRef = adminDb.collection(COLLECTIONS.CLIENT_CASES).doc()
    participantId = participantRef.id

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
  } catch (error) {
    logFirebaseError(
      'CLIENT_CASE_RELATIONSHIP_FAILED',
      error,
      {
        participantId,
        clientId,
        caseId,
        role,
      }
    )
    throw error
  }
}

export const getCase = async (caseId: string): Promise<CaseData | null> => {
  try {
    const caseDoc = await adminDb.collection(COLLECTIONS.CASES).doc(caseId).get()
    
    if (!caseDoc.exists) {
      return null
    }
    
    return caseDoc.data() as CaseData
  } catch (error) {
    logFirebaseError(
      'CASE_RETRIEVAL_FAILED',
      error,
      { caseId }
    )
    throw error
  }
}

export const getCases = async (): Promise<CaseData[]> => {
  let caseCount: number | undefined

  try {
    const casesSnapshot = await adminDb.collection(COLLECTIONS.CASES).get()
    caseCount = casesSnapshot.size
    return casesSnapshot.docs.map(doc => doc.data() as CaseData)
  } catch (error) {
    logFirebaseError(
      'CASES_RETRIEVAL_FAILED',
      error,
      { caseCount }
    )
    throw error
  }
}


// Document operations
export const createDocument = async (
  documentData: Omit<DocumentData, 'documentId' | 'createdAt' | 'updatedAt'>
) => {
  let documentId: string | undefined

  try {
    const documentRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc()
    documentId = documentRef.id

    const fullDocumentData: DocumentData = {
      ...documentData,
      documentId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await documentRef.set(fullDocumentData)
    return documentId
  } catch (error) {
    logFirebaseError(
      'DOCUMENT_CREATION_FAILED',
      error,
      {
        documentId,
        caseId: documentData.caseId,
        fileName: documentData.fileName,
        docType: documentData.docType,
      }
    )
    throw error
  }
}

export const getDocumentsByCase = async (caseId: string): Promise<DocumentData[]> => {
  let documentCount: number | undefined

  try {
    const documentsSnapshot = await adminDb
      .collection(COLLECTIONS.DOCUMENTS)
      .where('caseId', '==', caseId)
      .orderBy('createdAt', 'desc')
      .get()
    
    documentCount = documentsSnapshot.size
    return documentsSnapshot.docs.map(doc => doc.data() as DocumentData)
  } catch (error) {
    logFirebaseError(
      'DOCUMENTS_BY_CASE_RETRIEVAL_FAILED',
      error,
      { caseId, documentCount }
    )
    throw error
  }
}

export const getClientCases = async (clientId: string): Promise<string[]> => {
  let caseCount: number | undefined

  try {
    const clientCasesSnapshot = await adminDb
      .collection(COLLECTIONS.CLIENT_CASES)
      .where('clientId', '==', clientId)
      .get()
    
    caseCount = clientCasesSnapshot.size
    return clientCasesSnapshot.docs.map(doc => (doc.data() as ClientCases).caseId)
  } catch (error) {
    logFirebaseError(
      'CLIENT_CASES_RETRIEVAL_FAILED',
      error,
      { clientId, caseCount }
    )
    throw error
  }
}
