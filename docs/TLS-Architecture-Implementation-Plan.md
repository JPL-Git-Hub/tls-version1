# TLS User Journeys, Architecture & Implementation Plan

## User Journeys

### Journey 1: Initial Consultation Flow

```
QR scan → Lead form page
  Fields: firstName, lastName, email, mobilePhone, propertyAddress (optional)
  ↓
POST /api/leads/submit
  - Creates lead record in Firestore (leads collection)
  - One-way sync: creates Google Contact via People API
  - Stores googleContactId in lead record
  - Returns success
  ↓
Redirect to Cal.com booking widget (iframe/embed)
  ↓
User books consultation → Cal.com webhook fires
  ↓
POST /api/webhooks/calcom
  - Stores raw webhook (calcom_webhooks collection)
  - Updates lead: status → 'consultation_scheduled', stores bookingId, consultationDateTime
  - Triggers confirmation email via Gmail API
  - Email from: attorney@thelawshop.com
  - Includes: .ics calendar attachment, branded template (React Email)
  ↓
Cal.com syncs with Google Calendar
Attorney sees consultation in:
  - Google Calendar
  - Google Contacts (synced lead)
  - Attorney dashboard (Firestore query)
```

### Journey 2: Payment & Portal Creation Flow

```
Post-consultation → Attorney triggers payment link OR client visits self-service

Path A: Attorney-triggered
  Attorney dashboard → "Send Payment Link" button
    ↓
  POST /api/payment-links/create
    - Looks up lead via Firestore (by email)
    - Retrieves propertyAddress if available
    - Generates token (UUID), stores { token, leadId, expiresAt: 48hrs }
    - Updates lead: status → 'payment_link_sent'
    - Sends email/SMS with link: thelawshop.com/payment/[token]
    
Path B: Self-service
  Client visits thelawshop.com/payment
    ↓
  Lookup form: enter email or phone
    ↓
  POST /api/leads/lookup
    - Queries Firestore leads collection
    - Returns token or redirects to /payment/[token]

Both paths converge:
  ↓
/payment/[token] page
  Step 1: Property details form
    - Property address (pre-filled from lead record OR client enters)
    - Purchase price (client enters)
    - Displays: Total fee = 0.35% × price, Due today = 50% of total
    ↓
  Step 2: Confirmation page
    - Review details
    - Checkbox: "I acknowledge attorney-client relationship"
    - Button: "Proceed to Payment"
    ↓
Stripe Checkout (embedded or redirect)
  Client enters payment details
  Submits payment
  ↓
Stripe webhook → POST /api/webhooks/stripe
  Event: payment_intent.succeeded
    ↓
  Webhook handler (synchronous):
    1. Verify webhook signature (prevent duplicates)
    2. Extract metadata: leadId, propertyAddress, purchasePrice, totalFee
    3. Get lead record from Firestore
    4. Create client record (clients collection, status: 'active')
       - Copy data from lead record
       - Add stripeCustomerId
    5. Create case record (cases collection)
       - propertyAddress, purchasePrice, totalFee
       - Google Drive folder creation (via Drive API)
    6. Create client-case relationship (client_cases junction)
    7. Generate portalUuid (UUID)
    8. Create portal record (portals collection)
       - registrationStatus: 'pending'
    9. Update lead record:
       - status: 'converted'
       - clientId: [new client ID]
       - Keep record for audit trail
    10. Return 200 to Stripe
    ↓
Redirect to /portal/[uuid]/activate
  ↓
Portal activation page
  User creates Firebase Auth account:
    - Option A: Email/password (using email from lead)
    - Option B: Google OAuth (any Google account)
    ↓
  Firebase Auth returns uid
    ↓
  POST /api/portal/set-client-claims
    - Body: { uid, portalUuid }
    - Calls setClientClaims(uid, portalUuid)
    - Updates portal: registrationStatus: 'completed'
    - Returns success
    ↓
Redirect to /portal/[uuid]/dashboard
  User sees portal homepage
```

## Architecture

### Data Model

**Firestore Collections:**

```typescript
// Lead tracking (pre-payment)
leads: {
  leadId: string (auto-generated doc ID)
  firstName, lastName, email, mobilePhone
  propertyAddress?: string
  status: 'form_submitted' | 'consultation_scheduled' | 'payment_link_sent' | 'converted' | 'abandoned'
  googleContactId?: string  // Reference to synced Google Contact
  bookingId?: string  // Cal.com booking reference
  consultationDateTime?: Timestamp
  clientId?: string  // Set when converted (audit trail link)
  createdAt, updatedAt, lastActivityAt: Timestamp
}

// Client records (post-payment)
clients: {
  clientId: string (auto-generated doc ID)
  firstName, lastName, email, mobilePhone
  stripeCustomerId?: string
  status: 'active' | 'inactive'
  createdAt, updatedAt: Timestamp
}

// Portal access
portals: {
  portalUuid: string (UUID, doc ID)
  clientId: string (reference)
  clientName: string
  portalStatus: 'pending' | 'created' | 'active' | 'suspended'
  registrationStatus: 'pending' | 'completed' | 'abandoned'
  createdAt, updatedAt: Timestamp
}

// Legal matters
cases: {
  caseId: string (auto-generated doc ID)
  clientNames: string
  caseType: 'Condo Apartment' | 'Coop Apartment' | 'Single Family House' | 'Other'
  status: 'intake' | 'active' | 'completed' | 'cancelled'
  propertyAddress?: string
  purchasePrice?: number
  totalFee?: number
  googleDriveFolderId?: string
  googleDriveFolderUrl?: string
  createdAt, updatedAt: Timestamp
}

// Client-case relationships
client_cases: {
  participantId: string (auto-generated doc ID)
  clientId, caseId: string (foreign keys)
  role: 'primary' | 'co-buyer'
  createdAt, updatedAt: Timestamp
}

// Document metadata
documents: {
  documentId: string (auto-generated doc ID)
  caseId: string (reference)
  fileName, fileUrl: string
  docType: 'contract of sale' | 'term sheet' | 'title report' | 'board minutes' | 'offering plan' | 'financials' | 'by-laws'
  uploadedAt, createdAt, updatedAt: Timestamp
}

// Webhook audit trails
calcom_webhooks: {
  webhookId: string
  eventType: string
  payload: object (raw Cal.com data)
  processedAt, createdAt: Timestamp
}

stripe_webhooks: {
  webhookId: string
  eventType: string
  payload: object (raw Stripe data)
  processedAt, createdAt: Timestamp
}

// Payment link tokens
payment_links: {
  token: string (UUID, doc ID)
  leadId: string
  expiresAt: Timestamp
  createdAt: Timestamp
}
```

**Google Contacts Storage:**
- One-way sync from Firestore leads
- Attorney convenience (tap-to-call, familiar UI)
- Not queried by application logic
- Firestore = source of truth

**Firebase Auth Custom Claims:**
```typescript
Attorney: { role: 'attorney', attorney: true }
Client: { role: 'client', client: true, portalAccess: [portalUuid] }
```

### Lead Status Transitions (Automated)

```
form_submitted (lead form POST creates record)
  ↓
consultation_scheduled (Cal.com webhook updates)
  ↓
payment_link_sent (attorney triggers payment link)
  ↓
converted (Stripe webhook → creates client + case)
  [Lead record kept for audit trail with clientId reference]

abandoned (future: background job for inactive leads)
```

### Tech Stack Integration Map

```
Frontend:
  Next.js 15 pages + React 19
  Tailwind CSS + shadcn/ui components
  Firebase Client SDK (auth, firestore)
  
Backend:
  Next.js API routes (/api/*)
  Firebase Admin SDK (auth, firestore, storage)
  
External Services:
  - Cal.com: Booking widget + webhooks
  - Stripe: Payment processing + webhooks
  - Google Workspace APIs:
    * People API (one-way sync from leads)
    * Calendar API (consultation sync via Cal.com)
    * Drive API (case folders, document storage)
    * Gmail API (transactional emails)
  - Firebase Services:
    * Authentication (email/password + Google OAuth)
    * Firestore (database)
    * Storage (document hosting)
    * Cloud Functions (Drive→Storage sync, future AI processing)
    
Email Delivery:
  React Email (templates) + Nodemailer (Gmail API transport)
  From: attorney@thelawshop.com
  Appears in attorney's Gmail Sent folder
```

### Document Flow Architecture

```
Attorney uploads to Google Drive case folder
  ↓
Cloud Function watches folder (Drive API webhook)
  ↓
New file detected → Function triggers:
  1. Copy file to Firebase Storage (/documents/[caseId]/[fileName])
  2. Create document metadata in Firestore (documents collection)
  3. [Future] Trigger Vertex AI Document AI for OCR/embedding
  ↓
Client portal queries Firestore documents collection
  ↓
Portal displays documents with:
  - View (Firebase Storage signed URL)
  - Download (Firebase Storage download)
  - Share (Web Share API → native email client)
```

## Implementation Task Plan

### Phase 1: Foundation (No user-facing features yet)

**Task 1.1: Firebase Configuration**
- Verify Firebase Admin SDK credentials
- Test Firestore emulator connection
- Confirm Firebase Auth providers enabled (email/password, Google OAuth)
- Add `leads` collection to Firestore schema

**Task 1.2: Google Cloud APIs Setup**
- Enable APIs: People, Calendar, Drive, Gmail
- Create service account for backend operations
- Configure OAuth consent screen for client portal Google sign-in
- Test API access via Admin SDK
- Test People API contact creation

**Task 1.3: Email Infrastructure**
- Install: `nodemailer`, `@react-email/render`, `@react-email/components`
- Create base email template component (React Email)
- Configure Gmail API OAuth credentials
- Test email sending via Nodemailer + Gmail transport
- Create utility: `sendEmail(to, subject, template, data)`

**Task 1.4: Stripe Setup**
- Install: `stripe` package
- Configure Stripe API keys (test mode)
- Create webhook endpoint: `/api/webhooks/stripe`
- Implement webhook signature verification
- Test webhook locally with Stripe CLI

### Phase 2: Lead Capture & Booking

**Task 2.1: Lead Form Page**
- Create page: `/pages/consult.tsx`
- Form fields: firstName, lastName, email, mobilePhone, propertyAddress (optional)
- Form validation: react-hook-form + zod
- Submit handler → POST `/api/leads/submit`

**Task 2.2: Lead Submission API**
- Create: `/api/leads/submit`
- Logic:
  1. Validate form data
  2. Create lead record in Firestore (leads collection, status: 'form_submitted')
  3. One-way sync: create Google Contact via People API
  4. Store googleContactId in lead record
  5. Return success { leadId }
- Error handling + logging
- Handle duplicate submissions (check existing email)

**Task 2.3: Cal.com Integration**
- Embed Cal.com booking widget on success page
- Configure Cal.com webhook URL: `/api/webhooks/calcom`
- Test booking flow end-to-end

**Task 2.4: Cal.com Webhook Handler**
- Create: `/api/webhooks/calcom`
- Logic:
  1. Verify webhook signature (if Cal.com provides)
  2. Store raw payload (calcom_webhooks collection)
  3. Extract: email, bookingId, startTime
  4. Query leads by email
  5. Update lead: status → 'consultation_scheduled', bookingId, consultationDateTime
  6. Trigger confirmation email
- Email template: branded confirmation with .ics attachment
- Test: book consultation → receive email → lead status updated

### Phase 3: Payment Flow

**Task 3.1: Payment Link Generation**
- Create: `/api/payment-links/create`
- Logic:
  1. Accept: { leadId or email }
  2. Query Firestore leads collection
  3. Generate token (UUID)
  4. Store: { token, leadId, expiresAt: now + 48hrs }
  5. Update lead: status → 'payment_link_sent'
  6. Send email/SMS with link: `thelawshop.com/payment/[token]`
  7. Return success
- Email template: payment link + instructions

**Task 3.2: Self-Service Lookup**
- Create page: `/pages/payment/index.tsx`
- Form: email or phone lookup
- Create: `/api/leads/lookup`
- Logic:
  1. Query Firestore leads collection
  2. If found → generate token → redirect to `/payment/[token]`
  3. If not found → error message
- Handle multiple leads with same email (edge case)

**Task 3.3: Payment Details Page**
- Create page: `/pages/payment/[token].tsx`
- Validate token, check expiration
- Query payment_links → get leadId → get lead data
- Step 1: Property form
  - Pre-fill propertyAddress from lead record
  - Input: purchasePrice
  - Calculate: totalFee = 0.35% × price, amountDue = 50%
  - Display calculation dynamically
- Step 2: Confirmation
  - Review details
  - Checkbox: attorney-client acknowledgment
  - Button: "Proceed to Payment"

**Task 3.4: Stripe Checkout Integration**
- Create: `/api/stripe/create-checkout-session`
- Logic:
  1. Accept: { token, propertyAddress, purchasePrice }
  2. Validate token, get leadId
  3. Calculate amountDue (50% of 0.35% × purchasePrice)
  4. Create Stripe checkout session with metadata: { leadId, propertyAddress, purchasePrice, totalFee }
  5. Return { sessionId }
- Frontend: redirect to Stripe Checkout
- Success URL: dynamic (set by webhook to `/portal/[uuid]/activate`)

**Task 3.5: Stripe Webhook Handler**
- Enhance: `/api/webhooks/stripe`
- Handle: `payment_intent.succeeded`
- Logic:
  1. Verify signature
  2. Check idempotency (prevent duplicate processing)
  3. Extract metadata: leadId, propertyAddress, purchasePrice, totalFee
  4. Get lead record from Firestore
  5. Create client record (status: 'active', add stripeCustomerId)
  6. Create case record (propertyAddress, purchasePrice, totalFee)
  7. Call Google Drive API: create case folder
  8. Create client-case relationship
  9. Generate portalUuid (UUID)
  10. Create portal record (registrationStatus: 'pending')
  11. Update lead record:
      - status: 'converted'
      - clientId: [new client ID]
  12. Store webhook (stripe_webhooks collection)
  13. Return 200
- Error handling: rollback strategy if partial failure
- Update Stripe session metadata with portalUuid for redirect

### Phase 4: Portal Activation & Access

**Task 4.1: Portal Activation Page**
- Create page: `/pages/portal/[uuid]/activate.tsx`
- Validate portalUuid exists, registrationStatus: 'pending'
- UI: Firebase Auth sign-up
  - Email/password option
  - Google OAuth option
- On success → POST `/api/portal/set-client-claims`

**Task 4.2: Set Client Claims API**
- Create: `/api/portal/set-client-claims`
- Logic:
  1. Accept: { uid, portalUuid }
  2. Verify portal exists and registrationStatus: 'pending'
  3. Call setClientClaims(uid, portalUuid)
  4. Update portal: registrationStatus: 'completed'
  5. Return success
- Error handling: portal not found, already activated, invalid uid

**Task 4.3: Portal Dashboard Page**
- Create page: `/pages/portal/[uuid]/dashboard.tsx`
- useAuth hook: verify user authenticated
- Display: welcome message, client name
- Stub sections: documents (empty for now)

**Task 4.4: Portal Route Protection** ⚠️ FLAGGED
- TODO: Middleware or API logic to verify:
  - User authenticated (Firebase Auth)
  - User has portalAccess claim for requested UUID
  - Call: `verifyClientPortalAccess(idToken, portalUuid)`
- Block access if verification fails
- Apply to all `/portal/[uuid]/*` routes

### Phase 5: Document Management

**Task 5.1: Attorney Document Upload (Google Drive)**
- Attorney uploads files to Google Drive case folder (manual for MVP)
- Document naming convention: establish standard
- Case folder structure: `/Cases/[caseId]-[clientNames]/`

**Task 5.2: Drive to Storage Sync (Cloud Function)**
- Create Cloud Function: `onDriveFileCreated`
- Trigger: Google Drive API webhook (watch folder)
- Logic:
  1. New file detected in case folder
  2. Download file from Drive
  3. Upload to Firebase Storage: `/documents/[caseId]/[fileName]`
  4. Create document metadata (documents collection)
  5. [Future] Trigger Vertex AI processing
- Deploy function, configure Drive webhook
- Test: upload file → appears in Storage → metadata created

**Task 5.3: Portal Document List**
- Update: `/pages/portal/[uuid]/dashboard.tsx`
- Fetch: GET `/api/portal/[uuid]/documents`
- Create: `/api/portal/[uuid]/documents`
- Logic:
  1. Verify user has portal access
  2. Get portal → get clientId → get caseIds
  3. Query documents collection by caseId
  4. Return: documentId, fileName, docType, uploadedAt
- Display: document list with view/download/share buttons

**Task 5.4: Document Actions**
- View: Generate Firebase Storage signed URL, open in new tab
- Download: Direct download link from Storage
- Share: Web Share API implementation
  - Mobile: `navigator.share()` opens native share sheet
  - Desktop: Download + copy link to clipboard
- Implement in portal UI

### Phase 6: Attorney Dashboard

**Task 6.1: Attorney Authentication**
- Create page: `/pages/attorney/login.tsx`
- Google OAuth sign-in (restricted to @thelawshop.com)
- On success → verify attorney claims
- Redirect to dashboard

**Task 6.2: Attorney Dashboard Page**
- Create page: `/pages/attorney/dashboard.tsx`
- Protected route: require attorney claims
- Sections (minimal):
  1. Upcoming consultations (query Firestore leads + Cal.com API)
  2. Lead list with status (query Firestore leads collection)
  3. Active cases list (query Firestore cases)
  4. Recent documents (query Firestore documents, order by createdAt)
  5. "Send Payment Link" button (opens modal)

**Task 6.3: Lead Status Tracking UI**
- Display leads table:
  - Columns: name, email, phone, propertyAddress, status, consultationDateTime, createdAt
  - Filter by status
  - Search by name/email
- Click lead → view detail modal
- Status badge colors for visual scanning

**Task 6.4: Payment Link Trigger UI**
- Modal component: select lead from dropdown or enter email
- Pre-fill propertyAddress if available
- On submit → POST `/api/payment-links/create`
- Show success message with generated link
- Copy link to clipboard button

**Task 6.5: Cases List View**
- Display: clientNames, propertyAddress, status, createdAt
- Click case → navigate to case detail page
- Implement basic filtering/search
- Show Google Drive folder link

### Phase 7: Testing & Deployment

**Task 7.1: End-to-End Testing**
- Test Journey 1: QR → form → lead created → Google Contact synced → booking → email received → lead status updated
- Test Journey 2: payment link → payment → lead converted → client/case created → portal activation → document view
- Test edge cases: 
  - Expired payment links
  - Duplicate lead submissions
  - Failed webhooks (Stripe retry)
  - Partial failures (case created but Drive folder failed)

**Task 7.2: Vercel Deployment**
- Configure environment variables
- Set up Stripe webhook endpoint (production URL)
- Set up Cal.com webhook endpoint (production URL)
- Deploy to Vercel
- Test webhooks in production

**Task 7.3: Production Configuration**
- Switch Stripe to live mode
- Configure Firebase production environment
- Set up custom domain: thelawshop.com
- SSL certificate verification
- Google Cloud API production credentials
- Gmail API production OAuth setup

**Task 7.4: Monitoring & Logging**
- Set up error tracking (Sentry or similar)
- Configure Firestore logging
- Monitor webhook delivery rates
- Set up alerts for failed payments

### Future Enhancements (Post-MVP)

- Lead abandonment detection (background job)
- Second payment collection workflow (remaining 50% at closing)
- AI document query (RAG pipeline with Vertex AI)
- Multi-client portal access (co-buyers)
- Attorney document upload via web UI
- Email notification system (document added, case status change)
- Client messaging/chat
- Appointment rescheduling from portal
- Automated follow-up emails based on lead status
- Analytics dashboard (conversion rates, payment trends)

## Critical Gaps Flagged

1. **Portal route protection**: Need to implement `verifyClientPortalAccess` middleware
2. **Second payment workflow**: Stripe implementation TBD (remaining 50%)
3. **Error recovery**: Partial webhook failures (case created but portal creation failed)
4. **Lead deduplication**: Strategy for handling duplicate email submissions

## Data Flow Summary

**Lead → Client Conversion:**
```
Lead created (form_submitted)
  ↓ [Cal.com webhook]
Lead updated (consultation_scheduled)
  ↓ [Attorney action]
Lead updated (payment_link_sent)
  ↓ [Stripe webhook]
Lead updated (status: converted, clientId: xxx)
  +
Client created (status: active)
  +
Case created (with Drive folder)
  +
Portal created (registrationStatus: pending)
  ↓ [User activation]
Portal updated (registrationStatus: completed)
  +
Firebase Auth custom claims set
```

**Document Flow:**
```
Attorney uploads → Google Drive case folder
  ↓ [Cloud Function]
File copied → Firebase Storage
  +
Metadata created → Firestore documents collection
  ↓ [Portal request]
Client views → Firebase Storage signed URL
Client shares → Native device share
```

---

**Implementation Status:** Ready to begin Phase 1

**Next Step:** Begin Task 1.1 (Firebase Configuration) or review/modify plan as needed
