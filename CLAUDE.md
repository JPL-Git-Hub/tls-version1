# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. 

Claude Code or CC should employ the following incremental Implementation Approach:
- **Single deliverable focus** - Complete one clear objective per response
- **Build on existing foundation** - Reference and extend previously created components
- **Follow established patterns** - Use existing codebase patterns and conventions
- **Minimal scope changes** - Avoid expanding beyond the specific request

## Cal.com Integration Patterns

**Form-to-Booking Data Flow**: The consultation system uses sessionStorage to pass data seamlessly:
1. **Consultation form** (`/consult`) collects client information and stores in sessionStorage
2. **Booking page** (`/consult/book`) reads sessionStorage and prefills Cal.com embed
3. **Cal.com webhook** receives booking and links to existing client record by email
4. **Error prevention**: Webhook enforces form-first workflow (client must exist before booking)

**SessionStorage Format**:
```typescript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+12345678901", 
  "metadata[property]": "123 Main St",
  "metadata[price]": "$500,000"
}
```

**Critical**: Always use `@calcom/embed-react` for Cal.com integration, not `@calcom/atoms`

## Architecture Overview

This is a **Next.js 15 App Router** application with **React Server Components** by default. The codebase maintains strict **Firebase SDK separation** between client and server contexts to prevent runtime conflicts. All components are server-side by default unless they require browser APIs or React hooks (marked with 'use client').

## Development Commands

### Core Development
- `npm run dev` - Start Next.js development server (http://localhost:3000)
- `npm run build` - Build production bundle
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint with Next.js config
- `npm run type-check` - TypeScript type checking without emit
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Email Development
- `npm run email:preview` - Preview React Email templates (http://localhost:3001)

### Testing Commands
- `npm run test:firebase` - Run Firebase connection and operation tests
- `node scripts/test-email.js` - Test email sending functionality
- `node scripts/test-google-apis.js` - Test Google API integration
- `node scripts/analyze-imports.js` - Analyze import dependencies for Firebase SDK separation compliance

### Development Scripts
- `./scripts/local-dev-emulator.sh` - Start development with Firebase emulators (automatically sets attorney claims)
- `./scripts/local-dev-real.sh` - Start development with production Firebase
- `./scripts/clean-firestore.sh` - Clean Firestore data for testing
- `USE_EMULATOR=true node scripts/set-attorney-claims.js` - Set attorney custom claims for admin access (emulator)
- `node scripts/set-attorney-claims.js` - Set attorney custom claims for admin access (production)

## Current Implementation

### Project Structure

```
src/
├── app/                              # Next.js 15 App Router
│   ├── api/                          # Server-side API endpoints
│   │   ├── clients/                  # Client CRUD operations
│   │   │   ├── create/
│   │   │   │   └── route.ts          # POST /api/clients/create
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET/PUT /api/clients/[id]
│   │   │   └── route.ts              # GET /api/clients
│   │   ├── logs/                     # Error logging endpoints
│   │   │   └── client-error/
│   │   │       └── route.ts          # POST /api/logs/client-error
│   │   └── webhooks/                 # External service webhooks
│   │       └── calcom/
│   │           └── route.ts          # POST /api/webhooks/calcom
│   ├── admin/                        # Attorney admin interface
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Admin dashboard with auth state
│   │   ├── login/
│   │   │   └── page.tsx              # Google Workspace authentication
│   │   └── layout.tsx                # Admin layout wrapper
│   ├── components-test/              # Component showcase/testing page
│   │   └── page.tsx
│   ├── consult/                      # Consultation pages
│   │   ├── book/
│   │   │   └── page.tsx              # Cal.com booking integration
│   │   └── page.tsx                  # Consultation form page
│   ├── document-management-system-test/ # Document management testing page
│   │   └── page.tsx
│   ├── favicon.ico                   # Default favicon
│   ├── globals.css                   # Tailwind CSS 3.x + shadcn/ui styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── middleware.ts                     # Next.js middleware for route protection
├── components/                       # React components
│   ├── email/                        # React Email templates
│   │   ├── base-template.tsx         # Base email template
│   │   ├── consultation-confirmation.tsx # Consultation confirmation
│   │   └── welcome.tsx               # Welcome email template
│   ├── law-shop-logo.tsx             # Custom law firm logo component
│   └── ui/                          # shadcn/ui component library
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── pagination.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       └── tooltip.tsx
├── hooks/                           # Custom React hooks
│   └── use-mobile.ts               # Mobile detection hook
├── lib/                            # Utilities and configurations
│   ├── config/                     # Configuration management
│   │   ├── auth.server.ts          # Server-side auth configuration
│   │   ├── ext-env-var.ts         # External service validation
│   │   ├── firebase.client.ts     # Client-side Firebase config
│   │   └── firebase.server.ts     # Server-side Firebase config
│   ├── email/                      # Email infrastructure
│   │   ├── send-email.ts          # Email sending utilities
│   │   └── transport.ts           # Email transport configuration
│   ├── firebase/                   # Firebase integrations
│   │   ├── admin.ts               # Admin SDK for API routes
│   │   ├── auth.ts                # Firebase authentication utilities
│   │   ├── client.ts              # Client SDK for components
│   │   ├── client-claims.ts       # Client claims management
│   │   ├── firestore.ts           # CRUD operations
│   │   ├── server-claims.ts       # Custom claims verification
│   │   └── storage.ts             # Firebase storage operations
│   ├── auth/                       # Authentication utilities
│   │   └── verify-attorney.ts      # Server-side attorney verification
│   ├── google/                     # Google services integration
│   │   └── auth.ts                # Google service authentication
│   ├── logging/                    # Error logging system
│   │   ├── error-handlers.ts      # Error handling utilities
│   │   └── logger.client.ts       # Client-side logging
│   └── utils.ts                   # shadcn/ui utility functions
└── types/                          # TypeScript type definitions
    ├── database.ts                 # Database schema types
    ├── external.ts                 # External API types
    ├── inputs.ts                   # Form input types
    ├── temporary.ts                # Temporary/utility types
    └── transformations.ts          # Data transformation types
```

### Installed Dependencies

- **Next.js 15.5.4** - App Router framework
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 3.x** - Utility-first styling with config file
- **shadcn/ui** - Component library with:
  - `@radix-ui/react-slot` - Component composition
  - `class-variance-authority` - Component variants
  - `clsx` & `tailwind-merge` - Conditional styling
- **Forms & Validation**:
  - `react-hook-form` - Form handling
  - `@hookform/resolvers` - Form validation resolvers
  - `zod` - Schema validation with regex-based phone validation
- **Email System**:
  - `@react-email/components` - React Email components
  - `@react-email/html` - HTML email utilities
  - `@react-email/render` - Email rendering
  - `nodemailer` - Email sending
- **Google Services**:
  - `googleapis` - Google APIs client library
- **Utilities**:
  - `lucide-react` - Icon library
  - `date-fns` - Date manipulation
  - `pdfjs-dist` - PDF handling capabilities
  - `@tailwindcss/forms` - Enhanced form styling
  - `autoprefixer` - CSS vendor prefixing
  - `tailwindcss-animate` - Tailwind CSS animations
- **Firebase**:
  - `firebase` - Client SDK v12
  - `firebase-admin` - Server SDK v13
- **Cal.com Integration**:
  - `@calcom/embed-react` - React embed component with prefill support

### Current Firebase Architecture

**Configuration Management**: Centralized external service validation
- `src/lib/config/ext-env-var.ts` - Fail-fast validation for production credentials
- `src/lib/config/firebase.server.ts` - Server-side config with emulator support  
- `src/lib/config/firebase.client.ts` - Client-side config with emulator support

**Firebase Integration**: Production-ready 9-file structure with emulator support
- `src/lib/firebase/admin.ts` - Admin SDK initialization with emulator configuration
  - **Critical**: NO credentials in emulator mode (prevents authentication errors)
  - Environment variables configure emulator routing automatically
  - Singleton pattern prevents double initialization from Next.js hot reloading
- `src/lib/firebase/client.ts` - Client SDK initialization  
- `src/lib/firebase/auth.ts` - Firebase authentication utilities
- `src/lib/firebase/firestore.ts` - CRUD operations (createClient, getClient, updateClient)
- `src/lib/firebase/server-claims.ts` - Custom claims verification (verifyAttorneyToken)
- `src/lib/firebase/client-claims.ts` - Client claims management
- `src/lib/firebase/storage.ts` - Firebase storage operations

**API Endpoints**: Complete M1 lead capture system with authentication
- `POST /api/clients/create` - **M1 Lead Capture System**: Creates clientId with auto-generated fields and client status as 'lead'
  - **Public submissions**: Consultation requests from website forms
  - **Attorney submissions**: Admin dashboard bookings for clients
  - **Rate limiting**: Max 3 submissions per email per 24 hours (public only)
  - **Google Contacts sync**: One-way sync to Google Contacts during creation
  - **Client lifecycle**: Single `clientId` persists from lead → active client (M1 → M2)
  - **M2 trigger**: Attorney manually converts lead to active client after consultation when client decides to hire
- `GET /api/clients` - List all clients for authenticated attorney
- `GET /api/clients/[id]` - Retrieve specific client by ID
- `PUT /api/clients/[id]` - Update client fields (excludes attorneyId/createdAt, enables M1→M2 conversion)
- `POST /api/logs/client-error` - Client-side error logging endpoint
- `POST /api/webhooks/calcom` - **Cal.com Webhook Integration**: Links bookings to existing clients
  - **Enforces form-first workflow**: Throws error if client doesn't exist by email
  - **Creates case records**: Consultation metadata and client-case relationships
  - **Signature verification**: Production webhook security with development bypass
  - **Comprehensive logging**: All webhook events logged to Firestore for debugging

**Email Infrastructure**: Complete implementation ✅ IMPLEMENTED
- `src/lib/email/transport.ts` - Gmail OAuth2 + Nodemailer transporter
- `src/lib/email/send-email.ts` - Email sending utilities
- `src/components/email/` - React Email templates with @react-email/components
- Preview server: Use `npm run email:preview` for template development

**Google Services Integration**: Complete implementation ✅ IMPLEMENTED
- `src/lib/google/auth.ts` - Service account authentication with Drive, Calendar, Gmail, People APIs

**Error Logging System**: Complete implementation ✅ IMPLEMENTED
- `src/lib/logging/error-handlers.ts` - Error handling utilities
- `src/lib/logging/logger.client.ts` - Client-side logging
- API endpoint for centralized error collection

**Cal.com Integration**: Complete implementation ✅ IMPLEMENTED
- `src/app/api/webhooks/calcom/route.ts` - Comprehensive booking flow handler
- `src/types/external.ts` - Cal.com webhook types and payload structures
- `src/app/consult/page.tsx` - Consultation form with sessionStorage integration
- `src/app/consult/book/page.tsx` - Cal.com embed with prefill functionality
- **Architecture**: Form-first workflow with seamless data transfer
- **Data flow**: Consultation form → sessionStorage → Cal.com prefill → webhook → case creation
- **Prefill system**: Uses `@calcom/embed-react` with sessionStorage to eliminate duplicate data entry
- **Error handling**: Clear messaging for missing clients and comprehensive logging

**Admin Authentication System**: Complete implementation ✅ IMPLEMENTED
- `src/app/admin/login/page.tsx` - Google Workspace authentication with domain restrictions
- `src/app/admin/dashboard/page.tsx` - Attorney dashboard with auth state management
- `src/lib/auth/verify-attorney.ts` - Server-side attorney verification for API routes
- **Domain restriction**: Only `@thelawshop.com` Google Workspace accounts
- **Role verification**: Custom claims with `role: 'attorney'` required
- **Security**: Both client-side and server-side verification with proper error handling

## Future Implementation (Not Yet Built)

### Planned Structure Extensions

```
src/
├── app/
│   └── portal/[uuid]/     # Client-specific portals (not yet built)
```

### Planned Architectural Patterns

**Authentication Duality**: Two completely separate auth systems
- `/admin/*` → Attorney authentication with Google Workspace + custom claims ✅ IMPLEMENTED
- `/portal/[uuid]` → Client-specific portal access (Firebase custom claims)

**Firebase SDK Separation**: Strict server/client boundary enforcement ✅ IMPLEMENTED
- `src/lib/firebase/admin.ts` → Admin SDK for API routes only ✅
- `src/lib/firebase/client.ts` → Client SDK for components only ✅  
- Never mix admin/client imports in same file ✅

**Google Services Integration**: ✅ IMPLEMENTED
- `src/lib/google/auth.ts` → Service account authentication with Drive, Calendar, Gmail, People APIs
- Google Workspace APIs: Drive, Calendar, Gmail, People with OAuth2 scopes

**Email Infrastructure**: ✅ IMPLEMENTED
- `src/lib/email/transport.ts` → Gmail OAuth2 + Nodemailer transporter
- `src/lib/email/send-email.ts` → Email sending utilities
- `src/components/email/` → React Email templates with @react-email/components
- Dual auth: Gmail OAuth2 or service account delegation
- Preview server: Use `npm run email:preview` for template development

**Type System**: ✅ IMPLEMENTED
- `src/types/database.ts` → Database schema types
- `src/types/external.ts` → External API types
- `src/types/inputs.ts` → Form input types
- `src/types/transformations.ts` → Data transformation types
- `src/types/temporary.ts` → Temporary/utility types

## Development Infrastructure

### Current Development Status
- **Backend**: 98% complete - production-ready Firebase, Google APIs, email system, Cal.com integration with prefill, admin authentication
- **Frontend**: 60% complete - law firm homepage with custom branding, admin authentication system, client management interface, seamless consultation booking flow
- **Priority 1**: ✅ COMPLETED - Cal.com integration with prefill and webhook for M1 lead capture
- **Priority 2**: ✅ COMPLETED - Admin authentication system with Google Workspace integration
- **Priority 3**: ✅ COMPLETED - Client list management interface for admin dashboard
- **Priority 4**: ✅ COMPLETED - Seamless consultation form to booking flow with prefill
- **Priority 5**: **NEXT MAJOR IMPLEMENTATION** - Stripe Payment Flow System
  - Payment link generation API (`POST /api/payment-links/create`)
  - Stripe webhook handling for payment success
  - Client status updates (lead → paid)
  - Portal creation automation
- **Priority 6**: Client portal system for document management (`/portal/[uuid]`)

### Import Path Aliases

- `@/*` → `./src/*` (configured in tsconfig.json)

### shadcn/ui Configuration

- **Style**: new-york style variant
- **Base color**: gray
- **CSS variables**: enabled for theming
- **Icon library**: lucide-react
- **RSC**: React Server Components enabled
- **Component aliases**: 
  - `@/components` → React components
  - `@/components/ui` → UI components
  - `@/lib/utils` → Utility functions
  - `@/hooks` → Custom React hooks

## Firebase Emulator Development

### Environment Configuration
- **Emulator mode**: Set `USE_EMULATOR=true` and `FIRESTORE_EMULATOR_HOST=localhost:8080` in `.env.local`
- **Admin SDK**: Automatically detects emulator via environment variables (no `.settings()` calls needed)
- **Credential isolation**: NO service account credentials in emulator mode (prevents authentication errors)
- **Testing**: Use `./scripts/local-dev-emulator.sh` for full emulator development environment
- **Attorney claims**: Custom claims automatically set during emulator startup for `josephleon@thelawshop.com`
- **Claims persistence**: Custom claims persist in emulator data exports but require manual re-setting after fresh starts

## Critical Architecture Constraints

### Firebase SDK Separation (ESSENTIAL)
- **NEVER mix Firebase Admin and Client SDKs** in the same file
- **Admin SDK**: Only in API routes (`src/app/api/`) - use `adminDb`, `adminAuth` from `@/lib/firebase/admin`
- **Client SDK**: Only in components/client code - use `clientDb`, `clientAuth` from `@/lib/firebase/client`
- **Import patterns**: Use pre-configured instances, import functions directly (`import { doc, setDoc } from 'firebase/firestore'`)
- **Runtime constraint**: Middleware cannot import Firebase Admin SDK (Edge Runtime limitation)
- **No abstraction**: Avoid wrapper utilities like `getFirestoreDb()` to prevent shadow APIs
- **Module responsibilities**: `auth.ts` client-only, `admin.ts` API routes only, `firestore.ts` CRUD operations

### Next.js App Router Patterns
- **Server Components by default**: Use 'use client' only for browser APIs or React hooks
- **File boundaries**: Server files (`admin.ts`, `firestore.ts`) never imported by client components
- **Shared type files**: Type definitions for client code cannot import Firebase Admin SDK or server-only modules

### Scale and Environment Constraints
- **Single Firebase project**: Use single project for dev/prod with data clearing strategy - no separate staging environments
- **Single codebase, single domain**: thelawshop.com hosts both public website and private portals
- **Portal limit**: 1,000 portals maximum 
- **Concurrency limit**: 25 concurrent users maximum
- **Data relationships**: Use junction collections for many-to-many client-case relationships

## Quality Assurance

### Pre-commit Workflow
1. Run `npm run type-check` to verify TypeScript compilation
2. Run `npm run lint` to check code style and catch issues
3. Run `npm run format:check` to verify code formatting
4. Run `npm run test:firebase` to validate Firebase integration
5. Run `node scripts/analyze-imports.js` to verify Firebase SDK separation compliance

### Code Quality Tools
- **ESLint**: Next.js configuration with Prettier integration
- **TypeScript**: Strict mode enabled with noEmit for type checking
- **Prettier**: Consistent code formatting across the project

