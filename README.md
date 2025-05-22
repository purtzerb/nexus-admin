This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





Assumptions:
- I believe only admin users should be able to create admin users and SE users. So the users page is only visible to admin users
- Because I need to test normal users, and you also need to be able to test normal users, there are two flows for authentication:
  - We can set a password within this system, outside of the usebraintrust api
  - If you add a user without a password, then it will try to authenticate via the usebraintrust API and pass the password entered to this API endpoint. If this succeeds, then we consider that user authenticated.
- Workflow information such as executions, exceptions, nodes have api routes for external modifications. I believe these are external to the admin app, but will be communicated to the admin app via the external API routes. View the external API routes at /api-docs.



Functionality:
- Client credientials are not legitimately validated due to time constraints. We automatically validate them, but have stubbed out functions for proper validation in the future.
- SE hours within client/billing is not implemented. I hardcoded this. I am not sure where we would input/receive this information from.
- client/billing storage used is not implemented. I hardcoded this. I am not sure where we would input/receive this information from.
- client/billing "Billing Actions" is not implemented. I did not hook up any payment mechanisms due to time constraints and I do not have information to hook it up for real billing.
- I am not sure how credits work. Within the admin application, I added the ability to apply credit to clients in $. But it seems like within client/billing it should be credits that are not dollars, but some other type. Not sure exactly how you want to implement credits, so I applied it in dollars with the idea they could be discounted from their invoices.