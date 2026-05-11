## 2025-05-10 - [Input Validation]
**Vulnerability:** Missing input validation on habit creation in `src/pages/Manage.tsx`.
**Learning:** Habit names and categories were not strictly validated before being submitted to the database. This could allow excessively long strings or arbitrary categories to be saved, potentially causing UI issues or inconsistent data.
**Prevention:** Add input validation for both length (maxLength: 50) and category (must be in predefined list) on the client side before making the API call. Always validate and sanitize user input.

## 2025-05-10 - [Dependency Cleanup]
**Vulnerability:** Unused dependencies `axios` and `axios-retry` left in the codebase along with dead code related to creating Firestore indexes dynamically.
**Learning:** Having unused dependencies increases the supply chain risk and the overall attack surface of the application. Leaving dead code related to index generation or remote calls is bad security hygiene.
**Prevention:** Regularly prune unused dependencies from `package.json` and remove dead code that isn't actively being utilized. Keep the dependency graph as small as possible.
