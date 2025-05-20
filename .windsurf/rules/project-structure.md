---
trigger: model_decision
description: When creating or editing files
---

Directory Adherence (App Router):

All imports should use '@/' imports. This maps to the src folder.

Use the app directory for all routes (pages and API endpoints).

Pages are defined by page.js, page.jsx, or page.tsx files.

Layouts are defined by layout.js (or .tsx).

API endpoints (Route Handlers) are defined by route.js (or .ts) files within app/api/... or other route segments.

Organize components in a dedicated components directory (e.g., app/_components/ or src/components/).

src/ Directory Usage: If using the src/ directory, app, components, lib etc., will be inside src/.

Utility Directory: Use lib/ (or utils/ or server/) for shared helper functions, database connection logic (e.g., lib/db.js, lib/auth.js).

Naming Conventions:

PascalCase for React components (Client and Server) and Mongoose models (e.g., UserDashboard, ClientModel).

page.js/tsx, layout.js/tsx, route.js/ts, loading.js/tsx, error.js/tsx for special Next.js files.

camelCase for functions and variables.

Code Comments: Write clear and concise comments for complex logic, non-obvious code, and function headers (especially for Route Handlers, Server Actions, and core utility functions).

Error Handling (General): Implement try...catch blocks for asynchronous operations. Use error.js files for handling errors within route segments.

User-Friendly Errors: Provide user-friendly error messages or notifications on the client-side.

All names (such as the name of the cookie) should be stored in a constants file (lib/constants). This way, they are not hard coded in multiple locations, which should be avoided.