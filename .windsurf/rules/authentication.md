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

# Authentication Rules

## API Authentication

All API routes must follow these authentication guidelines:

1. **Use the central authentication utility**
   - Always use the `getAuthUser` function from `@/lib/auth/apiAuth.ts` to authenticate requests
   - Never implement custom authentication logic in individual API routes

2. **Consistent authentication pattern**
   ```typescript
   // 1. Connect to the database
   await dbConnect();

   // 2. Authenticate the request
   const user = await getAuthUser(request);

   // 3. Return 401 if not authenticated
   if (!user) {
     return unauthorizedResponse();
   }

   // 4. Check for required roles if needed
   if (!hasRequiredRole(user, ['ADMIN'])) {
     return forbiddenResponse('Specific error message');
   }
   ```

3. **Role-based access control**
   - Always check for appropriate roles before allowing access to protected resources
   - Use the `hasRequiredRole` helper to verify user permissions
   - Return appropriate error messages that don't leak sensitive information

4. **Error handling**
   - Use the provided helper functions for consistent error responses:
     - `unauthorizedResponse()` for 401 errors (not authenticated)
     - `forbiddenResponse()` for 403 errors (authenticated but not authorized)

5. **Authentication priority**
   - JWT token authentication is the primary method
   - NextAuth session is used as a fallback

6. **Security considerations**
   - Never expose sensitive user information in responses
   - Always sanitize user objects before returning them (remove passwordHash, passwordSalt)
   - Use appropriate HTTP status codes for different error conditions
