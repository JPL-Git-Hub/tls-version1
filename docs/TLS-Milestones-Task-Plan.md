# TLS Development Milestones & Task Plan

**Last Updated:** Current as of latest implementation status
**Overall Progress:** 32.5% (M1: 50% | M2: 15% | M3-M5: 0%)

## Implementation Status Summary

**✅ COMPLETE (32.5%)**
- Firebase Admin & Client SDK setup
- Google APIs integration (People, Calendar, Drive, Gmail)
- Email infrastructure (Nodemailer + Gmail OAuth + React Email)
- Type system & validation schemas
- shadcn/ui component library
- Client CRUD operations

**🟡 IN PROGRESS (0%)**
- None currently active

**❌ NOT STARTED (67.5%)**
- Lead capture system
- Payment processing & Stripe integration
- Portal creation & activation
- Calendar booking integration
- Attorney dashboard
- Client portal interface
- Document management
- Production deployment

---

## Milestone Overview

**M1: Foundation & Lead Capture (2-3 days)**
- Firebase/Google APIs configured and tested
- Lead form + Cal.com booking flow working end-to-end
- Basic email infrastructure operational

**M2: Payment & Portal Creation (3-4 days)**
- Payment link generation and Stripe checkout integration
- Stripe webhook creates client/case/portal records
- Portal activation with Firebase Auth

**M3: Document Management (2-3 days)**
- Google Drive to Firebase Storage sync
- Portal document viewing/sharing
- Attorney document upload workflow

**M4: Attorney Dashboard (2-3 days)**
- Attorney authentication and protected routes
- Lead tracking and payment link generation UI
- Case management interface

**M5: Production & Testing (1-2 days)**
- End-to-end testing and deployment
- Production configuration and monitoring

**Total Estimated Time: 12-17 days**

---

## M1: Foundation & Lead Capture

### Deliverables
- Working lead form page
- Cal.com booking integration
- Email confirmation system
- Google Contacts sync
- Lead status tracking in Firestore

### Task 1.1: Firebase & Google APIs Setup
**Status: ✅ COMPLETE**

**Files to create/modify:**
```
.env.local                           # Environment variables
src/lib/firebase/admin.ts            # Already exists
src/lib/firebase/client.ts           # Already exists
src/lib/config/firebase.server.ts    # Firebase Admin config
src/lib/config/firebase.client.ts    # Firebase Client config
src/lib/google/auth.ts               # Google service account
src/types/database.ts                # Add leads collection schema
```

**Implementation steps:**
1. Create new Firebase project in console
2. Add Firebase Admin SDK credentials to .env.local
3. Add Firebase Client SDK config to .env.local
4. Enable Google APIs: People, Calendar, Drive, Gmail
5. Create service account, download JSON credentials
6. Add leads collection to Firestore schema

**Acceptance Criteria:**
- [ ] Firebase Admin SDK connects to Firestore
- [ ] Firebase Client SDK initializes without errors
- [ ] Google APIs enabled in GCP console
- [ ] Service account credentials working
- [ ] Test script creates/reads Firestore document successfully
- [ ] Test script creates Google Contact successfully
- [ ] Leads collection schema defined in types/database.ts

**Environment Variables Required:**
```
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

### Task 1.2: Email Infrastructure
**Status: ✅ COMPLETE**

**Files to create:**
```
src/lib/email/transporter.ts        # Nodemailer + Gmail API setup
src/lib/email/templates/base.tsx    # React Email base template
src/lib/email/templates/booking-confirmation.tsx  # Confirmation email
src/lib/email/send.ts                # Email sending utility
src/lib/email/calendar.ts            # .ics generation
```

**Implementation steps:**
1. Install dependencies: `nodemailer`, `@react-email/render`, `@react-email/components`
2. Configure Gmail API OAuth for attorney@thelawshop.com
3. Create Nodemailer transport with Gmail OAuth2
4. Build React Email base template (TLS branding)
5. Build booking confirmation template
6. Create .ics calendar attachment generator
7. Create sendEmail utility function

**Acceptance Criteria:**
- [ ] Gmail API OAuth configured for attorney@thelawshop.com
- [ ] Nodemailer transport successfully authenticates
- [ ] React Email templates render HTML correctly
- [ ] Test email sends successfully
- [ ] Email appears in attorney@thelawshop.com sent folder
- [ ] Calendar .ics attachment generates correctly
- [ ] sendEmail() utility handles errors gracefully

**Email Template Requirements:**
- TLS logo and branding
- Clear subject lines
- Mobile-responsive design
- Plain text fallback

### Task 1.3: Lead Form Page
**Status: ❌ NOT STARTED** (Next priority)

**Files to create:**
```
src/app/consult/page.tsx             # Lead form page
src/app/api/leads/submit/route.ts    # Form submission handler
src/lib/validation/lead-schema.ts    # Zod validation schemas
src/lib/firestore.ts                 # Add createLead function
src/lib/google/contacts.ts           # Google Contacts integration
```

**Implementation steps:**
1. Create lead form page with shadcn/ui components
2. Add form validation with react-hook-form + zod
3. Create API route: POST /api/leads/submit
4. Implement createLead function in firestore.ts
5. Implement Google Contacts sync
6. Add success redirect to Cal.com booking

**Acceptance Criteria:**
- [ ] Form validates required fields: firstName, lastName, email, mobilePhone
- [ ] Form accepts optional field: propertyAddress
- [ ] Validation errors display clearly
- [ ] Successful submission creates Firestore lead record (status: 'form_submitted')
- [ ] Google Contact created with People API
- [ ] googleContactId stored in lead record
- [ ] propertyAddress stored in Google Contact notes (if provided)
- [ ] Form redirects to Cal.com booking on success
- [ ] Duplicate email submissions handled gracefully

**Data Schema:**
```typescript
leads: {
  leadId: string
  firstName: string
  lastName: string
  email: string
  mobilePhone: string
  propertyAddress?: string
  status: 'form_submitted'
  googleContactId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActivityAt: Timestamp
}
```

### Task 1.4: Cal.com Integration
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/consult/success/page.tsx     # Cal.com widget embed page
src/app/api/webhooks/calcom/route.ts # Webhook handler
src/lib/validation/calcom-schema.ts  # Webhook payload schemas
src/lib/firestore.ts                 # Add updateLead function
```

**Implementation steps:**
1. Embed Cal.com booking widget on success page
2. Configure Cal.com webhook URL in Cal.com dashboard
3. Create webhook handler API route
4. Implement webhook signature verification (if available)
5. Parse webhook payload, extract booking data
6. Update lead status in Firestore
7. Trigger booking confirmation email

**Acceptance Criteria:**
- [ ] Cal.com widget embedded and displays correctly
- [ ] User can book consultation through widget
- [ ] Webhook receives booking event from Cal.com
- [ ] Webhook payload stored in calcom_webhooks collection
- [ ] Lead status updated to 'consultation_scheduled'
- [ ] bookingId stored in lead record
- [ ] consultationDateTime stored in lead record
- [ ] Booking confirmation email sent to client
- [ ] Email includes .ics calendar attachment
- [ ] Cal.com syncs with Google Calendar

**Webhook Data Requirements:**
```typescript
calcom_webhooks: {
  webhookId: string
  eventType: string
  payload: {
    bookingId: string
    startTime: string
    email: string
    name: string
    // other Cal.com fields
  }
  processedAt: Timestamp
  createdAt: Timestamp
}
```

---

## M2: Payment & Portal Creation

### Deliverables
- Payment link generation system
- Stripe checkout integration
- Portal creation via webhook
- Firebase Auth portal activation
- Lead-to-client conversion

### Task 2.1: Payment Link System
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/api/payment-links/create/route.ts    # Payment link generation
src/app/payment/page.tsx                      # Self-service lookup page
src/app/api/leads/lookup/route.ts             # Lead lookup API
src/lib/email/templates/payment-link.tsx      # Payment link email
src/lib/validation/payment-schema.ts          # Payment validation schemas
```

**Implementation steps:**
1. Create payment link generation API
2. Generate UUID tokens
3. Store payment_links with 48hr expiration
4. Create self-service lookup page
5. Create lead lookup API (by email/phone)
6. Build payment link email template
7. Update lead status to 'payment_link_sent'

**Acceptance Criteria:**
- [ ] Attorney can generate payment link for any lead (by leadId or email)
- [ ] Token generation creates unique UUID
- [ ] payment_links record stored with 48hr expiration
- [ ] Lead status updated to 'payment_link_sent'
- [ ] Email sent with payment link
- [ ] Self-service lookup page functional
- [ ] Lookup API queries Firestore leads by email/phone
- [ ] Lookup handles multiple leads with same email
- [ ] Invalid lookups show helpful error messages

**Data Schema:**
```typescript
payment_links: {
  token: string (UUID, doc ID)
  leadId: string
  expiresAt: Timestamp
  createdAt: Timestamp
}
```

### Task 2.2: Payment Details Page
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/payment/[token]/page.tsx              # Payment form page
src/app/api/payment-links/validate/route.ts   # Token validation API
src/components/payment/PropertyForm.tsx       # Property details form
src/components/payment/FeeCalculator.tsx      # Dynamic fee calculation
src/components/payment/Confirmation.tsx       # Review page
```

**Implementation steps:**
1. Create payment page with token parameter
2. Validate token (check existence, expiration)
3. Build property details form component
4. Implement dynamic fee calculation (0.35% × price, 50% due)
5. Build confirmation/review component
6. Add attorney-client acknowledgment checkbox
7. Connect to Stripe checkout API

**Acceptance Criteria:**
- [ ] Token validation prevents expired/invalid access
- [ ] 404 page shown for invalid tokens
- [ ] Property address pre-filled from lead record
- [ ] Purchase price input validates as positive number
- [ ] Fee calculation displays: totalFee = 0.35% × purchasePrice
- [ ] Amount due displays: 50% of totalFee
- [ ] Calculations update in real-time as user types
- [ ] Confirmation page shows all details for review
- [ ] Attorney-client acknowledgment checkbox required
- [ ] "Proceed to Payment" button creates Stripe session

### Task 2.3: Stripe Integration
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/api/stripe/create-checkout-session/route.ts  # Checkout creation
src/app/api/webhooks/stripe/route.ts                  # Payment webhook
src/lib/stripe/config.ts                              # Stripe setup
src/lib/services/portal-creation.ts                   # Portal creation service
src/lib/google/drive.ts                               # Drive folder creation
```

**Implementation steps:**
1. Install Stripe package, configure API keys
2. Create checkout session creation API
3. Implement Stripe webhook handler
4. Add webhook signature verification
5. Implement idempotency checking
6. Build portal creation service
7. Integrate Google Drive folder creation
8. Add lead-to-client conversion logic

**Acceptance Criteria:**
- [ ] Stripe checkout session created with metadata (leadId, propertyAddress, purchasePrice, totalFee)
- [ ] Client redirected to Stripe Checkout UI
- [ ] Webhook signature verification prevents spoofing
- [ ] Idempotency prevents duplicate processing on retries
- [ ] Payment success creates client record (status: 'active')
- [ ] stripeCustomerId stored in client record
- [ ] Case record created with propertyAddress, purchasePrice, totalFee
- [ ] Google Drive case folder created successfully
- [ ] googleDriveFolderId and googleDriveFolderUrl stored in case
- [ ] Client-case relationship created in client_cases junction
- [ ] Portal UUID generated
- [ ] Portal record created (registrationStatus: 'pending')
- [ ] Lead status updated to 'converted'
- [ ] Lead clientId reference stored (audit trail)
- [ ] Webhook payload stored in stripe_webhooks collection
- [ ] Webhook returns 200 to Stripe
- [ ] Redirect URL updated with portalUuid

**Data Requirements:**
```typescript
clients: {
  clientId: string
  firstName, lastName, email, mobilePhone
  stripeCustomerId: string
  status: 'active'
  createdAt, updatedAt: Timestamp
}

cases: {
  caseId: string
  clientNames: string
  caseType: CaseType
  status: 'intake'
  propertyAddress: string
  purchasePrice: number
  totalFee: number
  googleDriveFolderId: string
  googleDriveFolderUrl: string
  createdAt, updatedAt: Timestamp
}

portals: {
  portalUuid: string (UUID)
  clientId: string
  clientName: string
  portalStatus: 'pending'
  registrationStatus: 'pending'
  createdAt, updatedAt: Timestamp
}

client_cases: {
  participantId: string
  clientId: string
  caseId: string
  role: 'primary'
  createdAt, updatedAt: Timestamp
}

leads: {
  // existing fields...
  status: 'converted'
  clientId: string  // added on conversion
}
```

### Task 2.4: Portal Activation
**Status: 🟡 PARTIAL** (Schemas and claims infrastructure exist)

**Files to create:**
```
src/app/portal/[uuid]/activate/page.tsx       # Activation page
src/app/api/portal/set-client-claims/route.ts # Claims setter
src/hooks/useAuth.ts                          # Authentication hook
src/lib/firebase/server-claims.ts             # Already exists
src/middleware.ts                             # Route protection
```

**Implementation steps:**
1. Create portal activation page
2. Validate portalUuid before showing form
3. Implement Firebase Auth email/password signup
4. Implement Firebase Auth Google OAuth signup
5. Create claims setter API route
6. Build useAuth hook for portal pages
7. Implement portal route protection middleware

**Acceptance Criteria:**
- [ ] Portal UUID validation checks existence and status: 'pending'
- [ ] 404 shown for invalid/completed portals
- [ ] Email/password signup form functional
- [ ] Google OAuth signup button functional
- [ ] Signup creates Firebase Auth user
- [ ] POST /api/portal/set-client-claims called with uid and portalUuid
- [ ] Custom claims set: { role: 'client', client: true, portalAccess: [portalUuid] }
- [ ] Portal registrationStatus updated to 'completed'
- [ ] Redirect to /portal/[uuid]/dashboard on success
- [ ] Error handling for failed signups
- [ ] **Portal route protection implemented: verifyClientPortalAccess(idToken, portalUuid)**
- [ ] **Middleware blocks unauthorized portal access**
- [ ] **User must have portalAccess claim for requested UUID**

**Security Requirements:**
- Firebase Auth integration
- Custom claims for role-based access
- Portal-specific permissions verification
- Route protection for all /portal/[uuid]/* routes

### Task 2.5: Portal Dashboard
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/portal/[uuid]/dashboard/page.tsx      # Dashboard page
src/components/portal/Header.tsx              # Portal header
src/components/portal/WelcomeCard.tsx         # Welcome section
```

**Implementation steps:**
1. Create portal dashboard layout
2. Add useAuth hook to verify authentication
3. Display client name from portal/client records
4. Add placeholder sections for documents
5. Implement basic navigation

**Acceptance Criteria:**
- [ ] Dashboard loads for authenticated users
- [ ] useAuth hook verifies user authentication
- [ ] Client name displayed from Firestore
- [ ] Welcome message personalized
- [ ] Navigation stub present
- [ ] Document section placeholder visible
- [ ] Logout button functional

---

## M3: Document Management

### Deliverables
- Google Drive to Firebase Storage sync
- Portal document viewing/sharing
- Attorney document upload workflow
- Document metadata tracking

### Task 3.1: Attorney Document Upload (Google Drive)
**Status: ❌ NOT STARTED**

**Files to create:**
```
docs/DOCUMENT_NAMING_CONVENTION.md   # Naming standards
```

**Implementation steps:**
1. Establish document naming convention
2. Create case folder structure in Google Drive
3. Configure Drive API permissions
4. Test manual upload workflow

**Acceptance Criteria:**
- [ ] Case folder structure defined: /Cases/[caseId]-[clientNames]/
- [ ] Document naming convention documented
- [ ] Attorney can manually upload to Drive case folders
- [ ] Drive API permissions configured correctly

### Task 3.2: Drive to Storage Sync (Cloud Function)
**Status: ❌ NOT STARTED**

**Files to create:**
```
functions/src/onDriveFileCreated.ts           # Cloud Function
functions/src/lib/storage-sync.ts             # Sync logic
src/lib/firestore.ts                          # Add createDocument
```

**Implementation steps:**
1. Create Cloud Function project
2. Configure Google Drive API webhook
3. Implement file download from Drive
4. Upload to Firebase Storage
5. Create document metadata in Firestore
6. Deploy function

**Acceptance Criteria:**
- [ ] Cloud Function deploys successfully
- [ ] Drive webhook triggers on new file
- [ ] File downloads from Drive
- [ ] File uploads to Firebase Storage path: /documents/[caseId]/[fileName]
- [ ] Document metadata created in Firestore
- [ ] Function handles errors gracefully
- [ ] Logs show successful processing

**Data Schema:**
```typescript
documents: {
  documentId: string
  caseId: string
  fileName: string
  fileUrl: string (Firebase Storage URL)
  docType: DocumentType
  uploadedAt: Timestamp
  createdAt, updatedAt: Timestamp
}
```

### Task 3.3: Portal Document List
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/portal/[uuid]/dashboard/page.tsx      # Update with documents
src/app/api/portal/[uuid]/documents/route.ts  # Document list API
src/components/portal/DocumentList.tsx        # Document list component
src/components/portal/DocumentCard.tsx        # Document card component
```

**Implementation steps:**
1. Create document list API endpoint
2. Verify user has portal access
3. Query documents by caseId
4. Build document list component
5. Display documents in portal dashboard

**Acceptance Criteria:**
- [ ] API endpoint verifies user portal access
- [ ] API retrieves portal → clientId → caseIds
- [ ] API queries documents collection by caseId
- [ ] Documents ordered by uploadedAt (newest first)
- [ ] Document list displays: fileName, docType, uploadedAt
- [ ] Empty state shown when no documents
- [ ] Loading state during fetch

### Task 3.4: Document Actions
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/components/portal/DocumentActions.tsx     # Action buttons
src/lib/storage/signed-urls.ts                # Signed URL generation
src/hooks/useShare.ts                         # Web Share API hook
```

**Implementation steps:**
1. Implement view action (Firebase Storage signed URL)
2. Implement download action (direct download)
3. Implement share action (Web Share API)
4. Add mobile/desktop detection
5. Add fallback for unsupported browsers

**Acceptance Criteria:**
- [ ] View button generates Firebase Storage signed URL
- [ ] View opens document in new tab
- [ ] Download button initiates direct download
- [ ] Share button triggers native share sheet (mobile)
- [ ] Share copies link to clipboard (desktop fallback)
- [ ] Actions handle errors gracefully
- [ ] Loading states during URL generation

---

## M4: Attorney Dashboard

### Deliverables
- Attorney authentication and protected routes
- Lead tracking with status visualization
- Payment link generation UI
- Case management interface
- Document overview

### Task 4.1: Attorney Authentication
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/attorney/login/page.tsx               # Attorney login page
src/lib/firebase/auth.ts                      # Update with attorney OAuth
src/middleware.ts                             # Add attorney route protection
```

**Implementation steps:**
1. Create attorney login page
2. Configure Google OAuth for @thelawshop.com domain restriction
3. Implement sign-in flow
4. Verify attorney custom claims
5. Add route protection for /attorney/* routes

**Acceptance Criteria:**
- [ ] Login page displays Google OAuth button
- [ ] OAuth restricted to @thelawshop.com domain
- [ ] Successful login verifies attorney claims
- [ ] Redirect to /attorney/dashboard on success
- [ ] Non-attorney emails rejected
- [ ] Route protection blocks unauthenticated access to /attorney/*

### Task 4.2: Attorney Dashboard Page
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/attorney/dashboard/page.tsx           # Dashboard page
src/components/attorney/UpcomingConsults.tsx  # Consultation list
src/components/attorney/LeadsList.tsx         # Lead tracking table
src/components/attorney/CasesList.tsx         # Active cases list
src/components/attorney/RecentDocs.tsx        # Recent documents
```

**Implementation steps:**
1. Create attorney dashboard layout
2. Build upcoming consultations component (query Firestore leads)
3. Build leads list with status badges
4. Build active cases list
5. Build recent documents component

**Acceptance Criteria:**
- [ ] Dashboard requires attorney authentication
- [ ] Upcoming consultations displayed (query leads with consultationDateTime)
- [ ] Leads list shows: name, email, status, consultationDateTime, createdAt
- [ ] Status badges color-coded for visual scanning
- [ ] Active cases list shows: clientNames, propertyAddress, status, createdAt
- [ ] Recent documents ordered by createdAt (limit 10)
- [ ] All sections have loading states

### Task 4.3: Lead Status Tracking UI
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/components/attorney/LeadStatusBadge.tsx   # Status badge component
src/components/attorney/LeadFilters.tsx       # Filter component
src/components/attorney/LeadSearch.tsx        # Search component
src/components/attorney/LeadDetailModal.tsx   # Detail modal
```

**Implementation steps:**
1. Build status badge component
2. Implement filter by status
3. Implement search by name/email
4. Build lead detail modal
5. Add click handlers for lead rows

**Acceptance Criteria:**
- [ ] Status badges show correct colors per status
- [ ] Filter dropdown includes all lead statuses
- [ ] Filtering updates table in real-time
- [ ] Search filters by name or email (case-insensitive)
- [ ] Click lead row opens detail modal
- [ ] Modal shows all lead data
- [ ] Modal includes "Send Payment Link" button

### Task 4.4: Payment Link Trigger UI
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/components/attorney/PaymentLinkModal.tsx  # Payment link modal
src/components/attorney/PaymentLinkButton.tsx # Trigger button
```

**Implementation steps:**
1. Build payment link modal component
2. Add lead selector dropdown
3. Display pre-filled propertyAddress if available
4. Implement link generation
5. Add copy-to-clipboard functionality

**Acceptance Criteria:**
- [ ] "Send Payment Link" button opens modal
- [ ] Modal can be opened from lead detail or standalone
- [ ] Lead dropdown populated from Firestore
- [ ] Selected lead pre-fills email and propertyAddress
- [ ] Click "Generate Link" calls /api/payment-links/create
- [ ] Success shows generated link
- [ ] Copy button copies link to clipboard
- [ ] Email sent notification displayed

### Task 4.5: Cases Management View
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/app/attorney/cases/page.tsx               # Cases list page
src/app/attorney/cases/[caseId]/page.tsx      # Case detail page
src/components/attorney/CaseFilters.tsx       # Case filtering
src/components/attorney/CaseCard.tsx          # Case card component
```

**Implementation steps:**
1. Create cases list page
2. Implement filtering by status
3. Add search by client name/property address
4. Build case detail page
5. Display Google Drive folder link

**Acceptance Criteria:**
- [ ] Cases list displays all cases
- [ ] Filter by status functional
- [ ] Search by clientNames or propertyAddress works
- [ ] Case cards show key information
- [ ] Click case navigates to detail page
- [ ] Case detail shows full information
- [ ] Google Drive folder link functional
- [ ] Link opens Drive folder in new tab

---

## M5: Production & Testing

### Deliverables
- Comprehensive end-to-end testing
- Production deployment to Vercel
- Environment configuration
- Monitoring and error tracking

### Task 5.1: End-to-End Testing
**Status: ❌ NOT STARTED**

**Test scenarios to execute:**

**Journey 1: Lead Capture**
1. Submit lead form → verify Firestore record created
2. Verify Google Contact created and synced
3. Book consultation via Cal.com → verify webhook received
4. Verify lead status updated to 'consultation_scheduled'
5. Verify confirmation email received with calendar attachment

**Journey 2: Payment & Portal**
1. Generate payment link from attorney dashboard
2. Verify lead status updated to 'payment_link_sent'
3. Open payment link → verify token validation
4. Complete payment form → verify calculations
5. Process Stripe payment → verify webhook
6. Verify client, case, portal, client_cases records created
7. Verify lead status updated to 'converted' with clientId
8. Verify Google Drive folder created
9. Activate portal → verify Firebase Auth signup
10. Verify custom claims set correctly
11. Access portal dashboard → verify authentication

**Edge Cases:**
1. Expired payment link → verify 404 page
2. Duplicate lead submission → verify handling
3. Failed Stripe webhook → verify retry logic
4. Partial webhook failure → verify rollback/recovery
5. Invalid portal UUID → verify 404
6. Unauthorized portal access → verify blocked

**Acceptance Criteria:**
- [ ] All Journey 1 steps pass
- [ ] All Journey 2 steps pass
- [ ] All edge cases handled correctly
- [ ] No console errors during flows
- [ ] Performance acceptable (page loads < 2s)

### Task 5.2: Vercel Deployment
**Status: ❌ NOT STARTED**

**Files to create/modify:**
```
.env.production                       # Production environment variables
vercel.json                           # Vercel configuration
README.md                             # Deployment documentation
```

**Implementation steps:**
1. Create Vercel project
2. Configure environment variables in Vercel dashboard
3. Set up custom domain: thelawshop.com
4. Configure Stripe webhook URL (production)
5. Configure Cal.com webhook URL (production)
6. Deploy to Vercel
7. Verify deployment successful

**Acceptance Criteria:**
- [ ] Vercel project created and linked to repository
- [ ] All environment variables configured
- [ ] Custom domain configured with SSL
- [ ] DNS records updated
- [ ] Stripe webhook endpoint configured (production URL)
- [ ] Cal.com webhook endpoint configured (production URL)
- [ ] Production deployment successful
- [ ] All pages load without errors
- [ ] Webhooks receive test events successfully

### Task 5.3: Production Configuration
**Status: ❌ NOT STARTED**

**Configuration checklist:**
- [ ] Switch Stripe to live mode
- [ ] Update Stripe API keys (live keys)
- [ ] Configure Firebase production environment
- [ ] Update Firebase config (production project)
- [ ] Verify Google Cloud APIs enabled (production)
- [ ] Configure Gmail API production OAuth
- [ ] Update service account credentials (production)
- [ ] Test production email sending
- [ ] Configure Firestore security rules
- [ ] Configure Firebase Storage security rules
- [ ] Set up Cloud Functions production environment

### Task 5.4: Monitoring & Logging
**Status: ❌ NOT STARTED**

**Files to create:**
```
src/lib/logging/logger.server.ts      # Already exists
src/lib/logging/logger.client.ts      # Client-side logging
```

**Implementation steps:**
1. Set up error tracking (Sentry or similar)
2. Configure Firestore logging
3. Set up webhook monitoring
4. Configure failed payment alerts
5. Set up uptime monitoring
6. Create monitoring dashboard

**Acceptance Criteria:**
- [ ] Error tracking service configured
- [ ] Errors automatically reported
- [ ] Firestore operations logged
- [ ] Webhook delivery monitored
- [ ] Failed payments trigger alerts
- [ ] Uptime monitoring active
- [ ] Monitoring dashboard accessible

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Lead abandonment detection (background job)
- Second payment collection (remaining 50% at closing)
- Automated follow-up emails based on lead status
- Email notification system (document added, case status change)

### Phase 3 Features
- AI document query (RAG pipeline with Vertex AI)
- Multi-client portal access (co-buyers)
- Attorney document upload via web UI (alternative to Drive)
- Client messaging/chat system
- Appointment rescheduling from portal

### Phase 4 Features
- Analytics dashboard (conversion rates, payment trends)
- Client satisfaction surveys
- Referral tracking system
- Document templates library
- Automated document generation

---

## Critical Technical Decisions

### Flagged Items Requiring Implementation
1. **Portal route protection**: Implement `verifyClientPortalAccess` middleware (M2 Task 2.4)
2. **Webhook idempotency**: Prevent duplicate processing on Stripe retries (M2 Task 2.3)
3. **Error recovery**: Handle partial webhook failures gracefully (M2 Task 2.3)
4. **Lead deduplication**: Strategy for duplicate email submissions (M1 Task 1.3)

### Architecture Constraints
- Single Firebase project (no staging environment)
- Data clearing strategy between dev/prod phases
- Maximum 1,000 portals lifetime
- Maximum 25 concurrent users
- Single codebase, single domain (thelawshop.com)

### Security Requirements
- Firebase Auth custom claims for authorization
- Portal-specific access verification
- Webhook signature verification (Cal.com, Stripe)
- Firestore security rules enforcement
- Storage security rules enforcement

---

## Implementation Status

**Current Phase:** M1 (50% complete) - Ready for Task 1.3

**Completed Work:**
- ✅ Firebase Admin & Client SDK infrastructure
- ✅ Google Cloud APIs integration (People, Calendar, Drive, Gmail)
- ✅ Email system (Nodemailer + Gmail OAuth + React Email templates)
- ✅ Type system & validation schemas
- ✅ Configuration management with validation
- ✅ Custom claims system (attorney & client roles)
- ✅ Client CRUD API endpoints

**Next Immediate Steps:**
1. **Task 1.3:** Build lead form page (`/consult`)
2. **Task 1.3:** Create lead submission API (`/api/leads/submit`)
3. **Task 1.3:** Implement Google Contacts sync
4. **Task 1.4:** Integrate Cal.com booking widget
5. **Task 1.4:** Create Cal.com webhook handler

**Ready to implement:** Task 1.3 (Lead Form Page)

**Estimated Timeline:**
- Complete M1: 1-2 days remaining
- M2 Payment & Portal: 3-4 days
- M3 Documents: 2-3 days
- M4 Attorney Dashboard: 2-3 days
- M5 Production: 1-2 days

**Total remaining: 9-14 days to production-ready MVP**
