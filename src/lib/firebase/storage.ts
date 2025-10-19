import { clientStorage } from '@/lib/firebase/client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Client-side Storage operations using Firebase SDK
// Used in React components and client-side logic

export const uploadDocument = async (
  file: File,
  caseId: string
): Promise<string> => {
  const fileName = file.name
  const filePath = `documents/${caseId}/${Date.now()}_${fileName}`
  const storageRef = ref(clientStorage, filePath)

  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return downloadURL
}