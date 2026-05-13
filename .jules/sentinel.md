## 2025-05-10 - [Input Validation]
**Vulnerability:** Missing input validation on habit creation in `src/pages/Manage.tsx`.
**Learning:** Habit names and categories were not strictly validated before being submitted to the database. This could allow excessively long strings or arbitrary categories to be saved, potentially causing UI issues or inconsistent data.
**Prevention:** Add input validation for both length (maxLength: 50) and category (must be in predefined list) on the client side before making the API call. Always validate and sanitize user input.

## 2025-05-10 - [Dependency Cleanup]
**Vulnerability:** Unused dependencies `axios` and `axios-retry` left in the codebase along with dead code related to creating Firestore indexes dynamically.
**Learning:** Having unused dependencies increases the supply chain risk and the overall attack surface of the application. Leaving dead code related to index generation or remote calls is bad security hygiene.
**Prevention:** Regularly prune unused dependencies from `package.json` and remove dead code that isn't actively being utilized. Keep the dependency graph as small as possible.

## 2025-05-13 - [Information Leakage & Stored XSS Defense]
**Vulnerability:** Raw error objects were being logged to `console.error` in `src/lib/firestore.ts`, potentially leaking internal application state or stack traces. Additionally, input sanitization was missing in `src/pages/Manage.tsx` for habit names.
**Learning:** Even though React handles output escaping, it is a good defense-in-depth practice to sanitize user inputs before storing them in the database to prevent Stored XSS. Furthermore, error handling should never leak internal details to the client-side console, as this information can be leveraged by attackers.
**Prevention:** Always log generic error messages to the console instead of the raw exception objects. Implement input sanitization (e.g., stripping `<` and `>`) alongside validation to enforce secure data storage.

## 2025-05-13 - [Information Leakage]
**Vulnerability:** Raw error objects (FirebaseError) were being thrown directly from catch blocks in `src/lib/firestore.ts`, exposing internal database structure and query information to higher-level components which could potentially render them.
**Learning:** While `console.error` logs the error for debugging purposes internally, re-throwing the original error object can expose sensitive backend details. A generic error string must be thrown instead.
**Prevention:** Always log raw errors internally (`console.error('msg', error)`), but throw generic sanitized errors (`throw new Error('Generic msg')`) to caller code interacting with the UI.
