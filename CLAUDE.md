# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. 

Claude Code or CC should employ the following incremental Implementation Approach:
- **Single deliverable focus** - Complete one clear objective per response
- **Build on existing foundation** - Reference and extend previously created components
- **Follow established patterns** - Use existing codebase patterns and conventions
- **Minimal scope changes** - Avoid expanding beyond the specific request

## Current Implementation

### Project Structure

```
src/
├── app/                              # Next.js 15 App Router
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
└── lib/                            # Utilities
    └── utils.ts                    # shadcn/ui utility functions
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

## Future Implementation (Not Yet Built)

### One Potential Structure

```
src/
├── app/
│   ├── admin/             # Attorney admin interface
│   ├── portal/[uuid]/     # Client-specific portals
│   └── api/               # Server-side API endpoints
├── lib/                   
│   ├── firebase/          # Firebase integrations (
│   ├── google/            # Google Workspace APIs
```

### Planned Architectural Patterns

**Authentication Duality**: Two completely separate auth systems
- `/portal/[uuid]` → Client-specific portal access (Firebase custom claims)

**Firebase SDK Separation**: Strict server/client boundary enforcement

- `src/lib/firebase/admin.ts` → Admin SDK for API routes only
- `src/lib/firebase/client.ts` → Client SDK for components only
- Never mix admin/client imports in same file

**Google Services Integration**:

- `src/lib/google/auth.ts` → Service account authentication with Drive, Calendar, Gmail, People APIs
- Google Workspace APIs: Drive, Calendar, Gmail, People with OAuth2 scopes

**Email Infrastructure**:

- `src/lib/email/transport.ts` → Gmail OAuth2 + Nodemailer transporter
- `src/lib/email/send-email.ts` → Email sending utilities
- `src/components/email/` → React Email templates
- Dual auth: Gmail OAuth2 or service account delegation

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

