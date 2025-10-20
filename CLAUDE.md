# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. 

Claude Code or CC should employ the following incremental Implementation Approach:
- **Single deliverable focus** - Complete one clear objective per response
- **Build on existing foundation** - Reference and extend previously created components
- **Follow established patterns** - Use existing codebase patterns and conventions
- **Minimal scope changes** - Avoid expanding beyond the specific request

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
- `./scripts/local-dev-emulator.sh` - Start development with Firebase emulators
- `./scripts/local-dev-real.sh` - Start development with production Firebase
- `./scripts/clean-firestore.sh` - Clean Firestore data for testing

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
│   │   └── logs/                     # Error logging endpoints
│   │       └── client-error/
│   │           └── route.ts          # POST /api/logs/client-error
│   ├── components-test/              # Component showcase/testing page
│   │   └── page.tsx
│   ├── consult/                      # Consultation pages
│   │   └── page.tsx                  # Consultation form page
│   ├── document-management-system-test/ # Document management testing page
│   │   └── page.tsx
│   ├── favicon.ico                   # Default favicon
│   ├── globals.css                   # Tailwind CSS 3.x + shadcn/ui styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/                       # React components
│   ├── email/                        # React Email templates
│   │   ├── base-template.tsx         # Base email template
│   │   ├── consultation-confirmation.tsx # Consultation confirmation
│   │   └── welcome.tsx               # Welcome email template
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
  - `zod` - Schema validation
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

### Current Firebase Architecture

**Configuration Management**: Centralized external service validation
- `src/lib/config/ext-env-var.ts` - Fail-fast validation for production credentials
- `src/lib/config/firebase.server.ts` - Server-side config with emulator support  
- `src/lib/config/firebase.client.ts` - Client-side config with emulator support

**Firebase Integration**: Production-ready 9-file structure
- `src/lib/firebase/admin.ts` - Admin SDK initialization with verifyIdToken()
- `src/lib/firebase/client.ts` - Client SDK initialization  
- `src/lib/firebase/auth.ts` - Firebase authentication utilities
- `src/lib/firebase/firestore.ts` - CRUD operations (createClient, getClient, updateClient)
- `src/lib/firebase/server-claims.ts` - Custom claims verification (verifyAttorneyToken)
- `src/lib/firebase/client-claims.ts` - Client claims management
- `src/lib/firebase/storage.ts` - Firebase storage operations

**API Endpoints**: Complete system with authentication
- `POST /api/clients/create` - Create new client with auto-generated fields
- `GET /api/clients` - List all clients for authenticated attorney
- `GET /api/clients/[id]` - Retrieve specific client by ID
- `PUT /api/clients/[id]` - Update client fields (excludes attorneyId/createdAt)
- `POST /api/logs/client-error` - Client-side error logging endpoint

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

## Future Implementation (Not Yet Built)

### Planned Structure Extensions

```
src/
├── app/
│   ├── admin/             # Attorney admin interface  
│   └── portal/[uuid]/     # Client-specific portals
```

### Planned Architectural Patterns

**Authentication Duality**: Two completely separate auth systems
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

### Code Quality Tools
- **ESLint**: Next.js configuration with Prettier integration
- **TypeScript**: Strict mode enabled with noEmit for type checking
- **Prettier**: Consistent code formatting across the project

