# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. 

Claude Code or CC should employ the following incremental Implementation Approach:
- **Single deliverable focus** - Complete one clear objective per response
- **Build on existing foundation** - Reference and extend previously created components
- **Follow established patterns** - Use existing codebase patterns and conventions
- **Minimal scope changes** - Avoid expanding beyond the specific request

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

### Firebase Testing
- `npm run test:firebase` - Run Firebase connection and operation tests

## Current Implementation

### Project Structure

```
src/
├── app/                              # Next.js 15 App Router
│   ├── api/                          # Server-side API endpoints
│   │   └── clients/                  # Client CRUD operations
│   │       ├── create/
│   │       │   └── route.ts          # POST /api/clients/create
│   │       ├── [id]/
│   │       │   └── route.ts          # GET/PUT /api/clients/[id]
│   │       └── route.ts              # GET /api/clients
│   ├── components-test/              # Component showcase/testing page
│   │   └── page.tsx
│   ├── document-management-system-test/ # Document management testing page
│   │   └── page.tsx
│   ├── favicon.ico                   # Default favicon
│   ├── globals.css                   # Tailwind CSS 3.x + shadcn/ui styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/                       # shadcn/ui components
│   └── ui/                          # Complete UI component library
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
│   │   ├── ext-env-var.ts         # External service validation
│   │   ├── firebase.client.ts     # Client-side Firebase config
│   │   └── firebase.server.ts     # Server-side Firebase config
│   ├── firebase/                   # Firebase integrations
│   │   ├── admin.ts               # Admin SDK for API routes
│   │   ├── client.ts              # Client SDK for components
│   │   ├── firestore.ts           # CRUD operations
│   │   └── server-claims.ts       # Custom claims verification
│   └── utils.ts                   # shadcn/ui utility functions
└── types/                          # TypeScript type definitions
    └── database.ts                 # Database schema types
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
- **Utilities**:
  - `lucide-react` - Icon library
  - `date-fns` - Date manipulation
  - `pdfjs-dist` - PDF handling capabilities
  - `@tailwindcss/forms` - Enhanced form styling
- **Firebase**:
  - `firebase` - Client SDK v10
  - `firebase-admin` - Server SDK v12

### Current Firebase Architecture

**Configuration Management**: Centralized external service validation
- `src/lib/config/ext-env-var.ts` - Fail-fast validation for production credentials
- `src/lib/config/firebase.server.ts` - Server-side config with emulator support  
- `src/lib/config/firebase.client.ts` - Client-side config with emulator support

**Firebase Integration**: Production-ready 7-file structure
- `src/lib/firebase/admin.ts` - Admin SDK initialization with verifyIdToken()
- `src/lib/firebase/client.ts` - Client SDK initialization  
- `src/lib/firebase/firestore.ts` - CRUD operations (createClient, getClient, updateClient)
- `src/lib/firebase/server-claims.ts` - Custom claims verification (verifyAttorneyToken)

**Client API**: Complete CRUD operations with attorney authentication
- `POST /api/clients/create` - Create new client with auto-generated fields
- `GET /api/clients` - List all clients for authenticated attorney
- `GET /api/clients/[id]` - Retrieve specific client by ID
- `PUT /api/clients/[id]` - Update client fields (excludes attorneyId/createdAt)

## Future Implementation (Not Yet Built)

### Planned Structure Extensions

```
src/
├── app/
│   ├── admin/             # Attorney admin interface  
│   ├── portal/[uuid]/     # Client-specific portals
│   └── api/
│       └── portals/       # Portal management endpoints
├── lib/                   
│   ├── google/            # Google Workspace APIs
│   └── email/             # Email infrastructure
```

### Planned Architectural Patterns

**Authentication Duality**: Two completely separate auth systems
- `/portal/[uuid]` → Client-specific portal access (Firebase custom claims)

**Firebase SDK Separation**: Strict server/client boundary enforcement ✅ IMPLEMENTED

- `src/lib/firebase/admin.ts` → Admin SDK for API routes only ✅
- `src/lib/firebase/client.ts` → Client SDK for components only ✅  
- Never mix admin/client imports in same file ✅

**Google Services Integration**:

- `src/lib/google/auth.ts` → Service account authentication with Drive, Calendar, Gmail, People APIs
- Google Workspace APIs: Drive, Calendar, Gmail, People with OAuth2 scopes

**Email Infrastructure**:

- `src/lib/email/transport.ts` → Gmail OAuth2 + Nodemailer transporter
- `src/lib/email/send-email.ts` → Email sending utilities
- `src/components/email/` → React Email templates with @react-email/components
- Dual auth: Gmail OAuth2 or service account delegation
- Preview server: Use `npm run email:preview` for template development

**Type System**:

- `src/types/database.ts` → Database schema types
- `src/types/external.ts` → External API types
- `src/types/inputs.ts` → Form input types
- `src/types/transformations.ts` → Data transformation types
- `src/types/temporary.ts` → Temporary/utility types

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

## Scale Constraints

- **Single codebase, single domain**: thelawshop.com hosts both public website and private portals
- **Portal limit**: 1,000 portals maximum 
- **Concurrency limit**: 25 concurrent users maximum 

## Firebase Architecture Constraints

- **Single Firebase project**: Use single project for dev/prod with data clearing strategy - no separate staging environments
- **Admin files**: Admin SDK syntax only - never mix client SDK patterns
- **Client files**: Client SDK syntax only - never mix admin SDK patterns
- **Server/client separation**: Admin credentials stay in API routes, client credentials in components
- **Import patterns**: Use `adminDb`, `clientAuth` instances from established modules
- **SDK imports**: Import functions directly (`import { doc, setDoc } from 'firebase/firestore'`)
- **No abstraction**: Avoid wrapper utilities like `getFirestoreDb()` to prevent shadow APIs
- **Runtime limits**: Middleware cannot import Firebase Admin SDK (Edge Runtime constraint)
- **File boundaries**: Server files (`admin.ts`, `firestore.ts`) never imported by client components
- **Module responsibilities**: `auth.ts` client-only, `admin.ts` API routes only, `firestore.ts` CRUD operations
- **Data relationships**: Use junction collections for many-to-many client-case relationships
- **Shared type files**: Type definitions for client code cannot import Firebase Admin SDK or server-only modules
- **Route pages**: Server components by default - use 'use client' only for React hooks or browser APIs

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

