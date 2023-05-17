## Connect to Nile

Built on top of nextjs, this implements a REST API for `@theniledev/react` components to use.

## Getting Started

Copy `.env.local.example` to `.env.local` and update it with the appropriate workspace and database.

Then, run the `yarn setup`. This will create `circuits`, `pit_stop_times` in your database, add some tenants, and a user for those tenants to log in to. see `setup.mjs` for more information

```bash
npm run setup
# or
yarn setup
# or
pnpm setup
```

After that, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
