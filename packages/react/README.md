<p align="center">
  <img width="1434" alt="Screen Shot 2024-09-18 at 9 20 04 AM" src="https://github.com/user-attachments/assets/20585883-5cdc-4f15-93d3-dc150e87bc11">
</p>

---

# Nile's React SDK

This package (`@niledatabase/react`) is part of [Nile's Javascript SDK](https://github.com/niledatabase/nile-js/tree/main).

Nile's React package provides:

- 🎨 UI components for authentication, user management, and tenant management (customizable with Tailwind CSS)
- 🪝 React hooks for authentication, user management, and tenant management functionality

You can browse all the components and explore their properties in [Nile's documentation](https://www.thenile.dev/docs/auth/components/signin) or in [Storybook](https://storybook.thenile.dev). 

The components and hooks are designed to work best and provide a secure user experience when used with the generated routes provided by [Nile's Server-Side SDK](https://www.npmjs.com/package/@niledatabase/server).

**Nile is a Postgres platform that decouples storage from compute, virtualizes tenants, and supports vertical and horizontal scaling globally to ship B2B applications fast while being safe with limitless scale.** All B2B applications are multi-tenant. A tenant/customer is primarily a company, an organization, or a workspace in your product that contains a group of users. A B2B application provides services to multiple tenants. Tenant is the basic building block of all B2B applications.

## Usage

### Installation

```bash
npm install @niledatabase/react
```

### Signup / User Info page

This example uses several components to build a one-page signup / user profile example.

- `<SignedIn>` component renders for authenticated users while `<SignedOut>` renders for un-authenticated users.
- `<SignUpForm>` component shows a standard email/password signup.
- `<UserInfo />` component shows information about currently authenticated user - their image, email, name, etc.
- `<TenantSelector>` component shows the current tenant, allows to switch between tenants and to create new tenants.
- `<SignOutButton />` component expires the current session

```tsx
import {
SignOutButton,
SignUpForm,
SignedIn,
SignedOut,
TenantSelector,
UserInfo,
} from "@niledatabase/react";
import "@niledatabase/react/styles.css";

export default function SignUpPage() {
return (
    <div className="flex flex-col items-center justify-center min-h-screen">
    <SignedIn className="flex flex-col gap-4">
        <UserInfo />
        <TenantSelector className="py-6 mb-10" />
        <SignOutButton />
    </SignedIn>
    <SignedOut>
        <SignUpForm createTenant />
    </SignedOut>
    </div>
);
}
```

### Social Login (SSO)

Nile-Auth supports multiple social providers. You configure and enable them in [Nile console](https://console.thenile.dev), and then simply drop-in the components. For example, for Discord authentication:

```tsx
import { DiscordSignInButton } from '@niledatabase/react';

function App() {
  return (
    <div>
      <DiscordSignInButton callbackUrl="/" />
    </div>
  );
}
```

### Customizing the components

Nile’s react package includes a CSS file that you can use to provide a nice default style to the components:

```ts
import "@niledatabase/react/styles.css";
```

Nile Auth components use CSS variables for theming. This means that you can override the colors and other styles by setting the CSS variables. We support the same CSS variables that [Shadcn uses](https://ui.shadcn.com/docs/theming#list-of-variables). You can modify them in your `global.css` file.

For "spot changes", you can use the `className` prop of a component to customize it individually:

```tsx
<SignOutButton className="bg-red-500" />
```

## Learn more

- You can learn more about Nile and the SDK in [https://thenile.dev/docs]
- You can find detailed code examples in [our main repo](https://github.com/niledatabase/niledatabase)
- Nile SDK interacts with APIs in Nile Auth service. You can learn more about it in the [repository](https://github.com/niledatabase/nile-auth) and the [docs](https://thenile.dev/docs/auth)