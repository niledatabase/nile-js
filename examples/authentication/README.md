## Login and Sign up

Built on top of nextjs, this implements a secure login example with a sign up page

## Getting Started

Copy `.env.local.example` to `.env.local` and update it with the appropriate workspace and database.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Nile server

In `app/api` there are `login` and `sign-up` routes. These are simple wrappers around `@theniledev/server`, which handle making REST requests to the Nile backend.

## Nile UI

In `nile/iu` there are `LoginForm`, `SignUpForm`. They are client side components and work with `@theniledev/react` and `@theniledev/browser` to communicate to the example server.
