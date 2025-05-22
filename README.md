## Install Dependencies
I had an issue with swagger docs, so the legacy dependencies is needed for now.
npm i --legacy-peer-deps

## Run Docker
npm run db:up

## Seed Database
npm run db:seed

## Start Application
npm run dev

## Database Seeding
You can view the script for seeding within scripts/setup.js. You can add more users, or modify the existing users there. This script is meant to add initial users to the database, allow you to login with an admin account. Once you are logged in with an admin account, you can create other users

## Authentication
I have implemented 2 types of authentication:
1. Usebraintrust API Authentication
  - This is if you want to use your braintrust email/password for authentication.
    For these users, you only want to add an email to the user record. If no passwordHash exists on the record, then it attempts to login via usebraintrust API and pass the password entered to this API endpoint. If this succeeds, then we consider that user authenticated.
2. Internal Authentication
  - This is if you want to add an internal password for authentication outside of the braintrust ecosystem. A passwordHash and passwordSalt is generated when you create users with a password. When loggin in as these users, it will not hit the braintrust API.





Assumptions:
- I believe only admin users should be able to create admin users and SE users. So the users page is only visible to admin users
- Because I need to test normal users, and you also need to be able to test normal users, there are two flows for authentication:
  - We can set a password within this system, outside of the usebraintrust api
  - If you add a user without a password, then it will try to authenticate via the usebraintrust API and pass the password entered to this API endpoint. If this succeeds, then we consider that user authenticated.
- Workflow information such as executions, exceptions, nodes have api routes for external modifications. I believe these are external to the admin app, but will be communicated to the admin app via the external API routes. View the external API routes at /api-docs.
- Client users are able to create/update/delete other client users



Functionality:
- Client credientials are not legitimately validated due to time constraints. We automatically validate them, but have stubbed out functions for proper validation in the future.
- SE hours within client/billing is not implemented. I hardcoded this. I am not sure where we would input/receive this information from.
- client/billing storage used is not implemented. I hardcoded this. I am not sure where we would input/receive this information from.
- client/billing "Billing Actions" is not implemented. I did not hook up any payment mechanisms due to time constraints and I do not have information to hook it up for real billing.
- I am not sure how credits work. Within the admin application, I added the ability to apply credit to clients in $. But it seems like within client/billing it should be credits that are not dollars, but some other type. Not sure exactly how you want to implement credits, so I applied it in dollars with the idea they could be discounted from their invoices.
- Client and admin messaging pages are not implemented.



TODO:
-[X] Finish out client pages
-[] Go through admin flows and restrict SE abilities as appropriate
-[]