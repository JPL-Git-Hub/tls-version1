# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TODO: Development Dependencies

- **Install concurrently before local server + internet connection**: `npm install --save-dev concurrently` - Required to run Next.js dev server and ngrok tunnel simultaneously for webhook testing and external access

## Development Commands

### Core Development

- `npm run dev` - Start development server with module warning suppression
- `npm run build` - Production build with strict TypeScript/ESLint enforcement
- `npm run type-check` - TypeScript compilation check without emit
- `npm run lint` - ESLint validation (zero warnings/errors enforced)
- `npm run format` - Prettier code formatting
- `npm run format:check` - Check code formatting without changes

### Development Workflow

Always run these commands before committing:

1. `npm run type-check` - Ensure zero TypeScript errors
2. `npm run lint` - Ensure zero ESLint warnings/errors
3. `npm run format:check` - Verify code formatting

## Architecture Overview

### Current Project Structure (Actual Current State)

```
src/
├── app/                   # Next.js 15 App Router
│   ├── components-test/   # Component showcase/testing page
│   │   └── page.tsx
│   ├── favicon.ico        # Default favicon
│   ├── globals.css        # Tailwind CSS 3.x + shadcn/ui styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # shadcn/ui components
│   └── ui/               # Reusable UI components
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── select.tsx
└── lib/                  # Utilities
    └── utils.ts          # shadcn/ui utility functions
```

### Missing Structure (To Be Built)

```
src/
├── app/
│   ├── admin/             # ❌ Attorney-only admin interface (/login auth)
│   ├── portal/[uuid]/     # ❌ Client-specific portals (separate auth)
│   └── api/               # ❌ Server-side API endpoints
├── lib/                   # ❌ Core business logic and services
│   ├── firebase/          # ❌ Firebase integrations (admin/client separation)
│   ├── google/            # ❌ Google Workspace APIs (Drive, Groups)
│   ├── logging/           # ❌ Structured error logging system
│   └── config/            # ❌ Environment and service configuration
├── types/                 # ❌ TypeScript type definitions
└── components/            # ✅ React components (shadcn/ui based) - PARTIALLY IMPLEMENTED
    └── ui/                # ✅ Core UI components available
```

### Essential Dependencies Installed

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

### Key Architectural Patterns (For Future Implementation)

**Authentication Duality**: Two completely separate auth systems

- `/login` → Attorney authentication via Google Groups API (`tls-attorneys@thelawshop.com`)
- `/portal/[uuid]` → Client-specific portal access (Firebase custom claims)

**Firebase SDK Separation**: Strict server/client boundary enforcement

- `src/lib/firebase/admin.ts` → Admin SDK for API routes only
- `src/lib/firebase/client.ts` → Client SDK for components only
- Never mix admin/client imports in same file

**Google Services Integration**:

- `src/lib/google/groups.ts` → Attorney authorization with 15-min caching
- `src/lib/google/drive.ts` → Document management integration
- `src/lib/google/auth.ts` → Service account authentication

**Structured Error Handling**: All errors use predefined patterns from `logger.server.ts`

- Firebase errors → `logFirebaseError()`
- Portal errors → `logPortalError()`
- API errors → `logApiError()`
- Development errors auto-written to `error.log`

### Import Path Aliases

- `@/*` → `./src/*` (configured in tsconfig.json)

### shadcn/ui Configuration

- **Style**: new-york style variant
- **Base color**: gray
- **CSS variables**: enabled for theming
- **Icon library**: lucide-react
- **Component aliases**: 
  - `@/components/ui` → UI components
  - `@/lib/utils` → Utility functions

# Development Guidelines for Claude Code

## Core Development Constraints

- **Schema modifications**: Never add/modify data objects in schemas.ts without explicit permission
- **Authentication boundaries**: Maintain strict admin/client separation per auth flow patterns
- **Authentication Route Separation**: `/login` (attorney-only) and `/portal/[uuid]` (client-specific) must remain separate - never combine attorney and client authentication systems to prevent privilege escalation
- **File structure**: Follow server/client module separation - no cross-contamination

## Code Quality Standards

- **TypeScript**: Zero compilation errors enforced across all files
- **ESLint**: Next.js strict rules with zero warnings/errors
- **Error Handling**: Structured JSON logging with error codes and remediation guidance
- **Type Safety**: Zero `any` types, proper error handling with type guards
- **Schema Compliance**: Reference actual field names from `schemas.ts`, not assumptions

## UI Design and Styling Standards

### Component Library

- **All Areas**: shadcn/ui + Tailwind CSS 3.x
- **Icons**: lucide-react (shadcn's icon library)
- **Forms**: react-hook-form + zod (unchanged)

### Styling Constraints

- **EXCLUSIVE use**: Tailwind utility classes for all styling - no custom CSS
- **NO component customization**: Never modify library components or create custom variants
- **Component respect**: Use library built-in props over className overrides when possible
- **Mobile-first responsive**: Design with Tailwind breakpoint prefixes (sm:, md:, lg:, xl:, 2xl:)
- **Form consistency**: react-hook-form + @hookform/resolvers + zod across all areas

## Technical Debt Prevention

- **Root cause resolution**: Fix import paths, environment loading, and module resolution - never duplicate code
- **Single source of truth**: Use existing schemas, collections, and Firebase modules - never hardcode or recreate
- **Reject shortcuts**: All code must import from established patterns or properly extend them
- **Right tool for the job**: Use service tools over REST hacks
- **Error handling scope**: Declare variables outside try-catch blocks when error handlers need access for logging/context
- **State management**: React built-ins + Firebase only - no Redux, Zustand, or external state libraries
- **Data fetching**: Native fetch API + Firebase SDK only - no Axios, SWR, or HTTP client libraries
- **Auth constraint**: Firebase Auth with custom useAuth hook - prevents other auth libraries

## Scale Constraints

- **Single codebase, single domain**: thelawshop.com hosts both public website and private portals
- **Portal limit**: 1,000 portals maximum affects database design and query optimization
- **Concurrency limit**: 10 concurrent users maximum affects performance and caching strategies
- **Attorney Authorization Pattern**: TLS uses Google Groups API for dynamic attorney authorization via `googleGroups.isAuthorizedAttorney(email)` checking `tls-attorneys@thelawshop.com` membership. Includes 15-minute caching, superadmin override for `josephleon@thelawshop.com`, and environment variable fallback. Use existing Google Groups service instead of creating new authorization systems.

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

## Error Handling Constraints

- **Required pattern**: Use predefined ERROR_DEFINITIONS from `@/lib/logging/logger.server.ts`
- **Service functions**: `logFirebaseError`, `logPortalError`, `logFormError`, `logApiError`, `logAuthError`
- **Forbidden**: Manual `console.error` or `JSON.stringify` patterns (except within `logger.client.ts` for browser error visibility)
- **Development**: Automatic error.log file writing for CC debugging
- **Startup errors**: Fail-fast configuration validation, crash immediately on config problems
- **Runtime errors**: Service boundary error wrapping for all external service calls
- **No graceful degradation**: Force immediate problem resolution, never mask errors
- **Complete debugging context**: All errors must include complete debugging context for troubleshooting
- **Service boundary wrapping**: All external service calls (Firebase, Stripe, Cal.com) must use structured error wrapping

## TypeScript Interface Patterns

- **Never duplicate interfaces** - derive from existing schema types using utility types (`Omit`, `Pick`, `Partial`)
- **Use schema-derived types** - `Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>` instead of duplicate interface definitions
- **Form-to-schema alignment** - all form submissions must map cleanly to database schema without field mismatches

## Incremental Implementation Approach

- **Single deliverable focus** - Complete one clear objective per response
- **Build on existing foundation** - Reference and extend previously created components
- **Follow established patterns** - Use existing codebase patterns and conventions
- **Minimal scope changes** - Avoid expanding beyond the specific request
