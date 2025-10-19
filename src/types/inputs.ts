// Form validation schemas and input types
import { z } from 'zod'

// Lead form validation (initial client contact)
export const LeadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  mobilePhone: z.string().min(1, 'Mobile phone is required'),
})

// Document upload form validation
export const DocumentUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  caseId: z.string().min(1, 'Case ID is required'),
  docType: z.enum(['contract of sale', 'term sheet', 'title report', 'board minutes', 'offering plan', 'financials', 'by-laws']),
})

// Case creation form validation
export const CaseCreationSchema = z.object({
  clientNames: z.string().min(1, 'Client names are required'),
  caseType: z.enum(['Condo Apartment', 'Coop Apartment', 'Single Family House', 'Other']),
  propertyAddress: z.string().optional(),
})

// Portal creation form validation
export const PortalCreationSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
})

// Inferred types from schemas
export type LeadFormData = z.infer<typeof LeadFormSchema>
export type DocumentUploadData = z.infer<typeof DocumentUploadSchema>
export type CaseCreationData = z.infer<typeof CaseCreationSchema>
export type PortalCreationData = z.infer<typeof PortalCreationSchema>