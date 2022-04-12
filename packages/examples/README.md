# @theniledev/examples

# @theniledev/examples

A sandbox app for testing out the react sdk and client libraries. Feel free to use this as a starting point for your own projects.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## pages/signin

Renders `import { LoginForm } from @theniledev/react` and redirects to the `/users` endpoint, or a `redirect` query parameter, if provided.

## pages/signup

Renders `import { SignUpForm } from @theniledev/react` and alerts that a user has signed up.

## pages/org

Shows all orgs.
Renders a bespoke sign in form that submits directly to the nile api, then requests a list of users and displays them once returned.

## pages/users

Renders invite logic. Requests a list of users, and shows the current user's invite code. Allows the current user to submit an invite code so they can be added to a different users organization. Displays a list of users that have been invited to the current user's organization. Also has a convinience method for signin out for easy testing.

## Getting Started

In the **root directory**, build the dependencies of this package. This will output files that will be picked up by the development server. If any modifications are made to `@theniledev/js` or `@theniledev/react`, this command will need re-rerun.
TODO: fix this. nile developers will not feel this pain... but employees will.

```bash
yarn build
```

Within this directory, start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

This application is deployed on vercel. To see the current running application, without API integration, go to [TODO]()
