# Nexus Admin API Structure

This document outlines the API structure for the Nexus Admin application, focusing on user management and role-based access control.

## User Management API Endpoints

### Admin Users

**Endpoint:** `/api/admin/users`

- **GET**: Fetch all admin users
  - Access: Admin users only
  - Query parameters:
    - `limit`: Maximum number of users to return
    - `skip`: Number of users to skip (for pagination)
  - Returns: List of admin users with sensitive information removed

- **POST**: Create a new admin user
  - Access: Admin users only
  - Required fields:
    - `name`: User's full name
    - `email`: User's email address
    - `password`: User's password
  - Optional fields:
    - `phone`: User's phone number
  - Returns: The created admin user with sensitive information removed

### Solutions Engineers

**Endpoint:** `/api/admin/solutions-engineers`

- **GET**: Fetch all solutions engineers
  - Access: Admin users only
  - Query parameters:
    - `limit`: Maximum number of users to return
    - `skip`: Number of users to skip (for pagination)
  - Returns: List of solutions engineers with sensitive information removed

- **POST**: Create a new solutions engineer
  - Access: Admin users only
  - Required fields:
    - `name`: User's full name
    - `email`: User's email address
    - `password`: User's password
    - `costRate`: Hourly cost rate
    - `billRate`: Hourly billable rate
  - Optional fields:
    - `phone`: User's phone number
    - `assignedClientIds`: Array of client IDs to assign to the SE
  - Returns: The created solutions engineer with sensitive information removed

### Client Users

**Endpoint:** `/api/client/[clientId]/users`

- **GET**: Fetch all users for a specific client
  - Access:
    - Admin users (all clients)
    - Solutions Engineers (only their assigned clients)
    - Client Admins (only their own client)
  - Query parameters:
    - `limit`: Maximum number of users to return
    - `skip`: Number of users to skip (for pagination)
  - Returns: List of client users with sensitive information removed

- **POST**: Create a new client user
  - Access:
    - Admin users (all clients)
    - Solutions Engineers (only their assigned clients)
    - Client Admins (only their own client)
  - Required fields:
    - `name`: User's full name
    - `email`: User's email address
    - `password`: User's password
  - Optional fields:
    - `phone`: User's phone number
    - `departmentId`: Department ID
    - `notifyByEmailForExceptions`: Boolean for email notifications
    - `notifyBySmsForExceptions`: Boolean for SMS notifications
    - `hasBillingAccess`: Boolean for billing access
    - `isClientAdmin`: Boolean for client admin privileges
    - `clientUserNotes`: Additional notes
  - Returns: The created client user with sensitive information removed

## Clients API Endpoint

**Endpoint:** `/api/clients`

- **GET**: Fetch clients based on user role
  - Access:
    - Admin users: All clients
    - Solutions Engineers: Only their assigned clients
    - Client Users: Only their own client
  - Query parameters:
    - `limit`: Maximum number of clients to return
    - `skip`: Number of clients to skip (for pagination)
  - Returns: List of clients

## Authentication and Authorization

All API endpoints use NextAuth for authentication. The session adapter ensures that user roles and permissions are properly enforced across the application.

### Permission Checks

The following permission checks are implemented:

- `isAdmin`: Checks if a user has admin permissions
- `isSolutionsEngineer`: Checks if a user has solutions engineer permissions
- `isClientAdmin`: Checks if a user has client admin permissions
- `checkSEClientAccess`: Checks if a solutions engineer has access to a specific client
- `checkClientUserAccess`: Checks if a client user has access to a specific client
- `canManageClientUsers`: Checks if a user can manage client users for a specific client
- `clientExists`: Checks if a client exists

## Frontend Integration

The frontend components use React Query for data fetching and state management. The API endpoints are used as follows:

- `UsersList` component: Uses `/api/admin/users` and `/api/admin/solutions-engineers` endpoints to fetch users based on the active tab
- `AddUserModal` component: Uses the appropriate endpoint based on the user type being created
- Client selection: Uses the `/api/clients` endpoint to fetch available clients for assignment to solutions engineers
