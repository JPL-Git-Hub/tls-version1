# React Primer for TLS Development

## Core React Categories

**Hooks** = Functions that access React features (always start with "use")
**Components** = Functions that return JSX (UI building blocks)  
**APIs** = Utility functions for specific tasks (context, optimization, lazy loading)

## Hooks Pattern

### Built-in Hooks

**useState - Component memory:**
```typescript
const [count, setCount] = useState(0); // Creates state variable, returns [value, updater]
setCount(5); // Changes state → component re-renders
```

**useEffect - React lifecycle:**
```typescript
useEffect(() => {
  // Runs when component mounts
  const unsubscribe = onAuthStateChanged(clientAuth, setUser); // Subscribe to Firebase
  return () => unsubscribe(); // Cleanup when component unmounts
}, []); // Empty array = run once on mount
```

### Custom Hooks

**Purpose:** Wrap Firebase Client SDK in React state/lifecycle management

**Example - useAuth hook:**
```typescript
// /hooks/useAuth.ts
import { useState, useEffect } from 'react'; // Built-in React hooks
import { onAuthStateChanged } from 'firebase/auth'; // Firebase CLIENT SDK from node_modules
import { clientAuth } from '@/lib/firebase/auth'; // Your TLS Firebase configuration

export function useAuth() {
  const [user, setUser] = useState(null); // Store authenticated user in React state
  const [loading, setLoading] = useState(true); // Track initial auth check status
  
  useEffect(() => { // Run once when component mounts
    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => { 
      // Subscribe to Firebase auth changes
      // Runs immediately (initial check) + whenever auth changes (login/logout)
      setUser(firebaseUser); // Update React state when Firebase changes
      setLoading(false); // Auth check complete
    });
    return () => unsubscribe(); // Stop listening when component unmounts (prevents memory leaks)
  }, []); // Empty dependency array = run once on mount only
  
  return { user, loading }; // Return React state to component
}
```

**What "wraps" means:**
- Takes Firebase Client SDK functions from `node_modules/firebase/auth`
- Adds React state management (`useState`)
- Adds React lifecycle management (`useEffect`)
- Returns React-friendly interface
- Keeps data synchronized between Firebase and React state

**Hook architecture:**
```
Firebase SDK (node_modules) 
  → Your config (/lib/firebase/auth.ts)
  → Custom hook (/hooks/useAuth.ts) 
  → Component uses hook
```

## Component Architecture

### Component Definition

**React component = Function that returns JSX (UI markup)**
```typescript
// /components/ClientPortal.tsx
export function ClientPortal() {
  const { user, loading } = useAuth(); // Hook provides state
  
  if (loading) return <div>Loading...</div>; // State drives UI
  return <div>Welcome {user.name}</div>; // JSX uses state
}
```

### State vs Props

**State** = Data owned by component:
```typescript
const [count, setCount] = useState(0); // Component owns `count`
setCount(5); // Changes state → component re-renders
```

**Props** = Data passed from parent to child:
```typescript
function Parent() {
  return <Child name="John" />; // Parent passes `name` prop
}

function Child({ name }) { // Child receives but cannot modify `name`
  return <div>{name}</div>; // If parent changes `name`, Child re-renders
}
```

**Props flow one direction:** Parent → Child only

### Component Re-renders

**Component updates when:**
- Its own state changes (`setCount(5)`)
- Props from parent change (parent passes new value)
- Parent re-renders (child re-renders too)

**useEffect dependencies:**
```typescript
useEffect(() => {
  console.log(count); // Runs when `count` changes
}, [count]); // Dependency array: only re-run if `count` changed
```

## Form Handling (TLS Stack)

### Form Libraries Installed

**react-hook-form** = Form state management
**@hookform/resolvers** = Validation bridge
**zod** = Schema validation

### Basic Form Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema
const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

function LeadForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema), // Connect zod validation
  });
  
  const onSubmit = async (data) => {
    // Submit to API
    await fetch('/api/clients/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### TLS Form → Database Flow
```
1. User fills form (react-hook-form manages state)
2. User submits (zod validates data)
3. POST /api/clients/create (Next.js API route)
4. Create client in Firestore (Firebase Admin SDK)
5. Auto-create case document
6. Create portal with UUID
7. Return success to component
8. Component shows confirmation
```

## shadcn/ui Components

### Component Library Architecture

**shadcn/ui** = Copy-paste components built on Radix UI primitives
**Radix UI** = Unstyled accessible components
**Tailwind CSS** = Styling system

### Installation Pattern
```bash
npx shadcn@latest add button  # Installs button component + dependencies
npx shadcn@latest add form    # Installs form components + dependencies
```

**shadcn auto-installs:**
- `@radix-ui/react-*` primitives (dialog, dropdown, etc.)
- `class-variance-authority` (styling variants)
- `lucide-react` (icons)

### Using shadcn Components
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function MyForm() {
  return (
    <div>
      <Input placeholder="Enter name" />
      <Button>Submit</Button>
    </div>
  );
}
```

**Key constraint:** Use library components as-is. Don't customize or create variants—use built-in props.

## Event Handlers

### onClick Pattern
```typescript
<button onClick={() => setCount(count + 1)}> // Anonymous function
  {count}
</button>
```

**Breakdown:**
- `onClick=` → React prop expecting a function
- `() =>` → Arrow function (no parameters, no name)
- `setCount(count + 1)` → Function body (runs on click)

**Flow:**
1. User clicks button
2. Browser fires click event  
3. React calls anonymous function
4. Function updates state
5. Component re-renders with new count

## Import System

### Import Statement
```typescript
import { onAuthStateChanged } from 'firebase/auth';
```

**What happens:**
1. TypeScript looks for `firebase/auth` package
2. Finds it in `/node_modules/firebase/auth/`
3. Makes `onAuthStateChanged` function available in your file
4. Now you can call `onAuthStateChanged()` in your code

### TLS Import Patterns

**Firebase SDK (from node_modules):**
```typescript
import { getAuth } from 'firebase/auth'; // FROM node_modules/firebase/auth/
```

**Your TLS configuration:**
```typescript
import { clientAuth } from '@/lib/firebase/auth'; // FROM /lib/firebase/auth.ts
```

**Your components:**
```typescript
import { ClientPortal } from '@/components/ClientPortal'; // FROM /components/ClientPortal.tsx
```

## Browser Execution

### Code Execution Flow
```
Operating System (Windows/macOS)
  ↓
Browser Application (Chrome.exe - C++)
  ↓
JavaScript Engine (V8 - C++)
  ↓
Your JavaScript Code (compiled from TypeScript)
```

**Build process:**
1. TypeScript compiles to JavaScript
2. Next.js bundles JavaScript with Firebase SDK code from node_modules
3. Browser downloads bundled JavaScript
4. Browser's JavaScript engine executes code
5. Firebase SDK makes HTTP requests to Firebase servers
6. React updates UI based on responses

## TLS Lead Form Example

### Complete Architecture

**Components (UI):**
```typescript
<LeadForm>               // Main form wrapper
  <FormInput />          // Name, email, phone fields
  <AddressInput />       // Property address
  <SubmitButton />       // Trigger submission
  <SuccessMessage />     // Confirmation display
</LeadForm>
```

**Hooks (state):**
```typescript
const [formData, setFormData] = useState({}); // Store form values
const [isSubmitting, setIsSubmitting] = useState(false); // Track submission
const [error, setError] = useState(null); // Handle errors
```

**APIs (external):**
```typescript
// Submission flow:
1. react-hook-form + zod → Validate
2. POST /api/clients/create → Firestore client
3. POST /api/case/create → Firestore case  
4. POST /api/portal/create → UUID portal
5. Show success message
```

## Key Terminology

**Hook** = Connects component to React features (state, lifecycle, context)
**Component** = Function returning JSX (UI building blocks)
**State** = Component memory that triggers re-renders when changed
**Props** = Data passed from parent to child (read-only)
**Effect** = Side effects that run during component lifecycle
**JSX** = HTML-like syntax in JavaScript
**Import** = Makes code from other files available
**Anonymous function** = Function without a name (inline arrow functions)
**Event handler** = Function that runs in response to user action
**Re-render** = React updates UI to reflect state changes