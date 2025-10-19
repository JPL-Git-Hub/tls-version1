# Type Schema Fields Reference

Total field count: **182 fields** across all type schema files.

## database.ts (128 fields)

### Type Definitions
- **TimestampType**: 4 fields
  - `seconds: number`
  - `nanoseconds: number`
  - `toDate(): Date`
  - `toMillis(): number`

- **PortalStatus**: 4 enum values
  - `'pending'`
  - `'created'`
  - `'active'`
  - `'suspended'`

- **RegistrationStatus**: 3 enum values
  - `'pending'`
  - `'completed'`
  - `'abandoned'`

- **CaseType**: 4 enum values
  - `'Condo Apartment'`
  - `'Coop Apartment'`
  - `'Single Family House'`
  - `'Other'`

- **CaseStatus**: 4 enum values
  - `'intake'`
  - `'active'`
  - `'completed'`
  - `'cancelled'`

- **DocumentType**: 7 enum values
  - `'contract of sale'`
  - `'term sheet'`
  - `'title report'`
  - `'board minutes'`
  - `'offering plan'`
  - `'financials'`
  - `'by-laws'`

- **ClientRole**: 2 enum values
  - `'primary'`
  - `'co-buyer'`

### Interfaces

- **ClientData**: 9 fields
  - `clientId: string`
  - `firstName: string`
  - `lastName: string`
  - `email: string`
  - `mobilePhone: string`
  - `stripeCustomerId?: string`
  - `status: 'lead' | 'paid' | 'active' | 'inactive'`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **PortalData**: 7 fields
  - `portalUuid: string`
  - `clientId: string`
  - `clientName: string`
  - `portalStatus: PortalStatus`
  - `registrationStatus: RegistrationStatus`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **CaseData**: 11 fields
  - `caseId: string`
  - `clientNames: string`
  - `caseType: CaseType`
  - `status: CaseStatus`
  - `propertyAddress?: string`
  - `consultationBookingId?: string`
  - `initialAttorneyConsulted?: string`
  - `consultationDateTime?: TimestampType`
  - `googleDriveFolderId?: string`
  - `googleDriveFolderUrl?: string`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **ClientCases**: 6 fields
  - `participantId: string`
  - `clientId: string`
  - `caseId: string`
  - `role: ClientRole`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **DocumentData**: 8 fields
  - `documentId: string`
  - `caseId: string`
  - `fileName: string`
  - `fileUrl: string`
  - `docType: DocumentType`
  - `uploadedAt: TimestampType`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **NylasGrant**: 8 fields
  - `id: string`
  - `userUid: string`
  - `provider: 'google' | 'microsoft' | string`
  - `email: string`
  - `scope?: string`
  - `refreshToken?: string`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **NylasConfiguration**: 8 fields
  - `id: string`
  - `ownerGrantId: string`
  - `name?: string`
  - `slug?: string`
  - `visibility: 'public' | 'private'`
  - `settings?: unknown`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

- **NylasBooking**: 12 fields
  - `id: string`
  - `configurationId: string`
  - `organizerGrantId?: string`
  - `startTime: string`
  - `endTime: string`
  - `timezone: string`
  - `participant: { name?: string; email?: string }`
  - `status: 'created' | 'pending' | 'rescheduled' | 'cancelled'`
  - `nylasEventId?: string`
  - `raw?: unknown`
  - `createdAt: TimestampType`
  - `updatedAt: TimestampType`

### Constants

- **COLLECTIONS**: 14 values
  - `CLIENTS: 'clients'`
  - `PORTALS: 'portals'`
  - `CASES: 'cases'`
  - `DOCUMENTS: 'documents'`
  - `CAL_BOOKINGS: 'cal_bookings'`
  - `CAL_WEBHOOKS: 'cal_webhooks'`
  - `CLIENT_CASES: 'client_cases'`
  - `STRIPE_WEBHOOKS: 'stripe_webhooks'`
  - `NYLAS_GRANTS: 'nylas_grants'`
  - `NYLAS_CONFIGURATIONS: 'nylas_configurations'`
  - `NYLAS_BOOKINGS: 'nylas_bookings'`
  - `NYLAS_WEBHOOKS: 'nylas_webhooks'`
  - `DOCUMENT_PROCESSING: 'document_processing'`

## external.ts (8 fields)

### Type Definitions
- **StripeEventType**: 3 enum values
  - `'payment_intent.succeeded'`
  - `'invoice.paid'`
  - `'subscription.updated'`

### Interfaces
- **StripeWebhookData**: 5 fields
  - `webhookId: string`
  - `eventType: string`
  - `payload: Record<string, unknown>`
  - `processedAt: TimestampType`
  - `createdAt: TimestampType`

## transformations.ts (17 fields)

### Function Return Types (unique anonymous types)

- **clientToApiResponse**: 6 fields
  - `clientId: string`
  - `firstName: string`
  - `lastName: string`
  - `email: string`
  - `status: string`
  - `createdAt: string`

- **documentToPortalResponse**: 4 fields
  - `documentId: string`
  - `fileName: string`
  - `docType: string`
  - `uploadedAt: string`

- **validateLeadTransformation parameter**: 4 fields
  - `firstName: string`
  - `lastName: string`
  - `email: string`
  - `mobilePhone: string`

- **validateDocumentTransformation parameters**: 3 fields
  - `fileName: string`
  - `fileUrl: string`
  - `caseId: string`

## inputs.ts (24 fields)

### Zod Schemas
- **LeadFormSchema**: 4 fields
  - `firstName: z.string().min(1)`
  - `lastName: z.string().min(1)`
  - `email: z.string().email()`
  - `mobilePhone: z.string().min(1)`

- **DocumentUploadSchema**: 3 fields
  - `fileName: z.string().min(1)`
  - `caseId: z.string().min(1)`
  - `docType: z.enum([...])`

- **CaseCreationSchema**: 3 fields
  - `clientNames: z.string().min(1)`
  - `caseType: z.enum([...])`
  - `propertyAddress: z.string().optional()`

- **PortalCreationSchema**: 2 fields
  - `clientId: z.string().min(1)`
  - `clientName: z.string().min(1)`

### Inferred Types
- **LeadFormData**: 4 fields (inferred from LeadFormSchema)
- **DocumentUploadData**: 3 fields (inferred from DocumentUploadSchema)
- **CaseCreationData**: 3 fields (inferred from CaseCreationSchema)
- **PortalCreationData**: 2 fields (inferred from PortalCreationSchema)

## temporary.ts (5 fields)

### Interfaces
- **DocumentProcessingData**: 5 fields
  - `documentId: string`
  - `caseId: string`
  - `processingStatus: string`
  - `extractedData?: any`
  - `extractedText?: string`

---

## Summary by File

| File | Field Count | Purpose |
|------|-------------|---------|
| `database.ts` | 128 | Firestore entities and enums |
| `inputs.ts` | 24 | Form validation schemas |
| `transformations.ts` | 17 | Data transformation mappings |
| `external.ts` | 8 | Third-party API types |
| `temporary.ts` | 5 | Processing intermediate types |
| **Total** | **182** | Complete type system |