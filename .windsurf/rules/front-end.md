---
trigger: model_decision
description: When working on the front-end for hooks or data fetching
---

Data Fetching Library: react-query (TanStack Query) will be the primary library for fetching, caching, synchronizing, and updating server state in Client Components.

Server Components for Data Fetching: For initial data loading in Server Components, fetch data directly within the component (e.g., using async/await).

react-query Usage: Use react-query hooks (e.g., useQuery, useMutation) in Client Components to interact with your Next.js Route Handlers for dynamic data fetching and mutations.

Caching Strategy: Leverage react-query's caching capabilities for Client Components.

Global UI State: For global UI state not covered by react-query (e.g., theme, mobile navigation state), use React Context API, ensuring it's compatible with the App Router (often by using a Client Component as the provider).

Local UI State: Prefer component-level state (useState, useReducer) for local UI concerns within Client Components.

Component Structure:

Organize components logically (e.g., app/_components/shared/, app/_components/admin/, app/_components/client/ or simply components/ at the root or within src/). The underscore prefix for _components is a common convention to indicate these are not route segments.

Clearly differentiate between Server Components and Client Components (using the "use client"; directive).

Routing Mechanism: Utilize Next.js App Router file-system routing (e.g., app/dashboard/page.js, app/admin/users/page.tsx).

Client-Side Route Protection (Middleware & Layouts): Protect client-side routes based on authentication status and user role using Next.js Middleware and checks within Layouts or Page components. Redirect unauthenticated or unauthorized users.

Form Handling:

Use controlled components for forms within Client Components.

Consider using Server Actions for form submissions for progressive enhancement, potentially combined with client-side validation.

Form Validation: Implement client-side validation for better UX in Client Components, but always ensure robust server-side validation in Route Handlers or Server Actions.