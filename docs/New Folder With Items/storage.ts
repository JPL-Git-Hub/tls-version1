import { clientStorage } from '@/lib/firebase/client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { logClientError } from '@/lib/logging/logger.client'

// Client-side Storage operations using Firebase SDK
// Used in React components and client-side logic

export const uploadDocument = async (
  file: File,
  caseId: string
): Promise<string> => {
  let fileName: string | undefined
  let filePath: string | undefined

  try {
    fileName = file.name
    filePath = `documents/${caseId}/${Date.now()}_${fileName}`
    const storageRef = ref(clientStorage, filePath)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    // Don't log here - let the calling component handle logging with business context
    throw error
  }
}
