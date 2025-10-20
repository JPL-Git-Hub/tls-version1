// Temporary processing types and intermediate data structures

// Document Processing Data (minimal for compilation)
export interface DocumentProcessingData {
  documentId: string
  caseId: string
  processingStatus: string
  extractedData?: unknown
  extractedText?: string
}

// TODO: Replace with new booking system flow types
// Previously used Cal.com booking flow state types removed