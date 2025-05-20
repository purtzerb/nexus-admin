---
trigger: model_decision
description: When hanlding actions associated with authentication or when requiring authentication
---

Authentication Method: A basic, custom token-based authentication system will be implemented.

Token Issuance: Upon successful login (e.g., via a Route Handler like app/api/auth/login/route.js), a secure, HttpOnly cookie containing a JSON Web Token (JWT) will be issued.

JWT Content: The JWT will store essential, non-sensitive user information, including userId and role.

Token Verification: All protected Route Handlers must verify the JWT from the cookie.

Centralized Verification (Middleware): Utilize Next.js Middleware (middleware.js or middleware.ts at the root or in app/) to centralize token verification for API routes (Route Handlers) and protect pages.

Role-Based Access Control (RBAC): The role stored in the JWT will be used for authorization.

API Role Checks: Route Handlers will check the user's role to ensure permission for the requested action or data.

Frontend Role-Based UI: Frontend components (Server Components or Client Components) will conditionally render UI elements or redirect based on the user's role.

User Roles & Views:

ADMIN: Full access to Admin view (e.g., routes under app/admin/...). Sees all clients, manages all users.

SOLUTIONS_ENGINEER (SE): Access to Admin view (e.g., routes under app/admin/...) filtered to assigned clients. Cannot manage other ADMIN or SOLUTIONS_ENGINEER users. Can manage CLIENT_USERs for their assigned clients.

CLIENT_USER: Access to Client view (e.g., routes under app/client/...) for their specific client.

Logout Functionality: Implement a logout Route Handler (e.g., app/api/auth/logout/route.js) that clears the authentication cookie.

Authentication source: If a user documents contains a passwordHash/passwordSalt fields, this will be the hashed password of a user combined with the salt. If these fields exist, we should authenticate against them. If these fields do not exist, we should interact with [Post] https://app.usebraintrust.com/api/user/login/ (email, password) in order to authenticate the user.