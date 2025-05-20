---
trigger: model_decision
description: When interacting with the database
---

Database Choice: MongoDB will be the database of choice.

ODM Usage: Mongoose will be used as the Object Data Modeler (ODM) for all interactions with MongoDB.

Schema Definition: Define Mongoose schemas for all data models (e.g., User, Client, Workflow, Exception).

Data Access Layer (Route Handlers): All database access and data manipulation logic must occur through Mongoose models within Next.js Route Handlers (e.g., app/api/some/route.js or app/api/some/route.ts).

API Route Structure (Route Handlers): Structure Route Handlers logically within the app/api/ directory, mirroring the application's domain (e.g., app/api/admin/clients/route.js, app/api/client/workflows/route.js, app/api/auth/login/route.js).

Route Handler Responsibilities:

Receive requests from the client (using the Request object).

Validate input data.

Perform business logic (often involving Mongoose models).

Handle authentication and authorization.

Send back appropriate Response objects with clear status codes (e.g., NextResponse.json()).

API Error Handling: Implement consistent error handling in Route Handlers. Return meaningful error messages and status codes.

Mongoose Validations: Utilize Mongoose schema validations (e.g., required, enum, min, max, match) to enforce data integrity.

Data Sanitization: Perform necessary data sanitization to prevent common security vulnerabilities.

Types: Types should be stored within the model file for centralized access on the backend. On the front-end, each hook should also export a type that outlines the type of data the hook is returning. This is because the data a hook returns does not necessarily match the model.