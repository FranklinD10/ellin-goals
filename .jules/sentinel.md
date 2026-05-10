## 2025-05-10 - [Input Validation]
**Vulnerability:** Missing input validation on habit creation in `src/pages/Manage.tsx`.
**Learning:** Habit names and categories were not strictly validated before being submitted to the database. This could allow excessively long strings or arbitrary categories to be saved, potentially causing UI issues or inconsistent data.
**Prevention:** Add input validation for both length (maxLength: 50) and category (must be in predefined list) on the client side before making the API call. Always validate and sanitize user input.
