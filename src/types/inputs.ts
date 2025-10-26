// This file intentionally contains no code.
//
// Validation architecture decision: Keep validation inline vs centralized schemas.
//
// Current approach is correct for this scale:
// - One form: No reuse benefit from centralization
// - Different API needs: Form uses Zod, API uses lightweight checks  
// - Simple validation: Regex and basic checks, not complex business rules
//
// When to add centralized schemas:
// 1. Multiple forms sharing validation rules
// 2. API/form parity requirements (server validates with identical rules)
// 3. Complex validation logic too heavy for inline code
//
// Current state:
// - Consultation form: Inline Zod schema (no import overhead)
// - API route: Runtime checks (no Zod parsing cost)  
// - Transformations: Pure functions (assume valid upstream input)
//
// This follows the "avoid premature abstraction" principle.
// Add schemas here only when actual reuse or maintainability issues arise.