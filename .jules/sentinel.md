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
## 2026-05-14 - [Information Leakage Defense]
**Vulnerability:** Raw error objects (e.g., FirebaseError) were being thrown directly from catch blocks in `src/lib/firebase.ts` or set in React state in `src/hooks/useHabits.ts`, exposing internal database structure and authentication query information to the frontend.
**Learning:** While `console.error` logs the error for debugging purposes internally, re-throwing the original error object or setting it in state can expose sensitive backend details or stack traces to higher-level components which could potentially render them or be intercepted.
**Prevention:** Always log raw errors internally (`console.error('msg', error)`), but throw or use generic sanitized errors (`throw new Error('Generic msg')` or `setError(new Error(...))`) to caller code interacting with the UI.
## 2026-05-15 - [Input Validation Defense]
**Vulnerability:** Weak input validation for Firestore queries in `src/lib/firestore.ts` where string inputs could theoretically be excessively long. Overly strict sanitization in `src/pages/Manage.tsx` could break valid text inputs by erroneously dropping valid characters (like `<` or `>`) that should be handled safely by React's standard output escaping.
**Learning:** Firestore UIDs can be up to 128 characters long, while standard document IDs are typically 20 characters. Any defensive length limits enforced on inputs must accommodate the maximum boundaries defined by the underlying service (Firebase) to avoid critical functional regressions. Furthermore, naive manual regex replacements (e.g., removing angle brackets) for XSS prevention represent a security anti-pattern; it's better to rely on secure defaults (React escaping mechanism) rather than stripping characters on insertion, as this preserves data integrity without introducing XSS risk.
**Prevention:** Apply input validation for length limits reflecting proper service boundaries (e.g., `< 128` characters for `uid`) and prefer relying on React's automatic DOM escaping mechanisms over custom, naive data mangling to prevent stored XSS.
## 2026-05-17 - [Authorization Bypass Defense]
**Vulnerability:** The `/stats` endpoint component `src/pages/Stats.tsx` was missing an authentication check, potentially exposing all user analytics to unauthenticated users.
**Learning:** In React applications utilizing context-based authentication (e.g., `useUser`), it's crucial to verify the presence of an authenticated user on all non-public pages before initiating any data fetching or rendering. Failure to do so can result in unauthorized data exposure.
**Prevention:** Always verify `currentUser` from the user context on protected routes. Implement early returns with an error message (e.g., `<Alert severity="error">Unauthorized access</Alert>`) to explicitly reject unauthenticated attempts before any backend queries are made.

## 2024-05-19 - Prevent sensitive info leakage in production console logs
**Vulnerability:** Information Disclosure
**Learning:** `console.error` calls with raw error objects were being logged directly in `src/lib/firestore.ts`. In production environments, this can expose sensitive internal information (e.g., database schema, query structures, or potentially user details inside Firebase error objects) to users who check the browser console. This breaches the principle of failing securely, as errors should not leak operational details.
**Prevention:** Wrap `console.error` logs with an environment check like `if (import.meta.env.DEV) { console.error(...); }` when handling internal errors, especially those originating from external services or databases. Always assume raw error objects contain sensitive information and sanitize or suppress them in production.

## 2026-05-20 - Prevent sensitive info leakage in production console logs
**Vulnerability:** Information Disclosure
**Learning:** `console.error` calls with raw error objects were being logged directly in multiple `catch` blocks and Promise rejections across the codebase. In production environments, this can expose sensitive internal information (e.g., database schema, query structures, or potentially user details inside Firebase error objects) to users who check the browser console. This breaches the principle of failing securely, as errors should not leak operational details.
**Prevention:** Wrap `console.error` and `console.warn` logs with an environment check like `if (import.meta.env.DEV) { console.error(...); }` when handling internal errors, especially those originating from external services or databases. Always assume raw error objects contain sensitive information and sanitize or suppress them in production.
## 2026-05-21 - [Missing Authorization Check in HealthCheck Component]
**Vulnerability:** The HealthCheck component was fetching data from the database using `getDocs` inside a `useEffect` and rendering health status without verifying if the user was authenticated.
**Learning:** React components that trigger database operations or show system status must ensure that the user session is authenticated. Unauthenticated rendering might leak system state or cause permission errors.
**Prevention:** Ensure components correctly use authentication hooks like `useUser()` and have early returns in both `useEffect` (for data fetches) and the component render path.

## 2026-05-22 - Prevent sensitive info leakage in production console logs
**Vulnerability:** Information Disclosure
**Learning:** `console.error`, `console.warn`, and `console.info` calls were being used in the codebase without checking the environment, particularly for service worker registration, audio loading, fallback database queries, and indexing operations. In production environments, this could leak operational details to users who check the browser console. This breaches the principle of failing securely, as errors should not leak operational details.
**Prevention:** Wrap `console.error`, `console.warn`, and `console.info` logs with an environment check like `if (import.meta.env.DEV) { console.error(...); }` when handling internal errors or logging state that isn't necessary for production users.

## 2026-05-23 - [Missing Security Headers]
**Vulnerability:** Missing security headers in `netlify.toml` leaves the application vulnerable to clickjacking, MIME-type sniffing, and cross-site scripting (XSS).
**Learning:** Even static/SPA sites built on platforms like Netlify require explicit HTTP security headers for defense-in-depth. Without them, browsers lack instructions on how to handle framing, MIME types, or script execution boundaries.
**Prevention:** Always define a `[[headers]]` block in `netlify.toml` (or equivalent configuration) configuring standard security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.) for all routes.

## 2026-05-24 - [Insecure Content Security Policy (CSP)]
**Vulnerability:** The application's Content Security Policy (CSP), specified in both `index.html` and `netlify.toml`, incorrectly included the `'unsafe-eval'` directive in its `script-src` definition.
**Learning:** Permitting `'unsafe-eval'` in a CSP significantly undermines its effectiveness against Cross-Site Scripting (XSS) attacks by allowing execution of code from strings via functions like `eval()`, `setTimeout()`, and `setInterval()`. For a compiled production React application, this directive is rarely necessary and introduces severe risk.
**Prevention:** Always omit `'unsafe-eval'` from production Content Security Policies. Modern frameworks like React (when compiled) do not require it. When configuring CSP in multiple places (e.g., dynamically in HTML and statically in server configs), ensure all definitions are consistently secure.
## 2026-05-26 - [Insecure Direct Object Reference Defense]
**Vulnerability:** The `deleteHabit` function in `src/lib/firestore.ts` lacked authorization checks and relied solely on the client sending a document ID to delete. An attacker could bypass the UI and manually invoke the API to delete another user's habits (IDOR vulnerability).
**Learning:** Client-side UI checks are insufficient for authorization. Any mutation operation directed to the backend or database (even via Firebase client SDKs) must verify ownership. Specifically, `deleteHabit` must verify that the habit document being mutated belongs to the authenticated user.
**Prevention:** Enforce server-side security rules or, when managing logic in client-side wrapper layers, always fetch the document and assert ownership (`if (habitSnap.data().user_id !== userId) throw new Error('Unauthorized');`) before performing destructive actions like updates or deletes.

## 2026-05-27 - [Insecure Direct Object Reference Defense]
**Vulnerability:** The `logHabitCompletion` function in `src/lib/firestore.ts` lacked authorization checks and relied solely on the client sending a habit ID to create a completion log. An attacker could bypass the UI and manually invoke the API to log completions for another user's habits (IDOR vulnerability), which would then incorrectly appear in the victim's analytics since logs were fetched only by `habit_id`.
**Learning:** Client-side UI checks are insufficient for authorization. Any mutation operation directed to the backend or database (even via Firebase client SDKs) must verify ownership. Specifically, `logHabitCompletion` must verify that the habit document being mutated/logged for belongs to the authenticated user.
**Prevention:** Enforce server-side security rules or, when managing logic in client-side wrapper layers, always fetch the parent document and assert ownership (`if (habitSnap.data().user_id !== userId) throw new Error('Unauthorized');`) before performing mutating actions like updates, deletes, or adding child records.
## 2026-05-28 - [Insecure Direct Object Reference Defense in getAnalytics]
**Vulnerability:** The `getAnalytics` function in `src/lib/firestore.ts` lacked authorization checks and relied solely on the client calling it to get analytics data. It fetched all the data under the `analytics` collection, leaking information to users calling this endpoint (IDOR/data exposure vulnerability).
**Learning:** For queries in Firebase/Firestore retrieving user-specific content (such as analytics data), queries must be filtered using `where('user_id', '==', userId)` to ensure a user only receives the data that they own. This prevents an authenticated user from retrieving another user's analytics.
**Prevention:** Enforce server-side security rules or, when managing logic in client-side wrapper layers, always supply and require `userId` parameter and apply a query filter (`where('user_id', '==', userId)`) so it only retrieves data belonging to the current user. Also, perform input validation for `userId` to ensure it is within limits.
## 2026-05-29 - [Insecure Direct Object Reference Defense in getHabitLogs]
**Vulnerability:** The `getHabitLogs` function in `src/lib/firestore.ts` lacked authorization checks and relied solely on the client passing a `habitId` to retrieve habit logs. An attacker could bypass the UI and manually invoke this function to retrieve log history for another user's habits (IDOR vulnerability).
**Learning:** For queries retrieving user-specific context, relying on secondary identifiers (like `habitId`) is insufficient for authorization if the backend rules aren't strictly enforced per query or if the client fetches on their behalf. In Firebase, always enforce ownership by requiring `userId` and applying `where('user_id', '==', userId)` or filtering properly in fallback execution.
**Prevention:** Always require a user identifier (`userId`) for queries fetching logs or sub-resources and enforce query constraints (`where('user_id', '==', userId)`) alongside application logic filters to prevent authenticated users from retrieving sensitive data that doesn't belong to them.
