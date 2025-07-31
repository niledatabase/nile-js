<p align="center">
  <img width="1434" alt="Screen Shot 2024-09-18 at 9 20 04 AM" src="https://github.com/user-attachments/assets/20585883-5cdc-4f15-93d3-dc150e87bc11">
</p>

---

# Nile's Client SDK

This package (`@niledatabase/client`) is part of [Nile's Javascript SDK](https://github.com/niledatabase/nile-js/tree/main).

Nile's React package provides:

- 🎨 UI components for authentication, user management, and tenant management (customizable with Tailwind CSS)
- 🪝 React hooks for authentication, user management, and tenant management functionality

You can browse all the components and explore their properties in [Nile's documentation](https://www.thenile.dev/docs/auth/components/signin) or in [Storybook](https://storybook.thenile.dev).

The components and hooks are designed to work best and provide a secure user experience when used with the generated routes provided by [Nile's Server-Side SDK](https://www.npmjs.com/package/@niledatabase/server).

**Nile is a Postgres platform that decouples storage from compute, virtualizes tenants, and supports vertical and horizontal scaling globally to ship B2B applications fast while being safe with limitless scale.** All B2B applications are multi-tenant. A tenant/customer is primarily a company, an organization, or a workspace in your product that contains a group of users. A B2B application provides services to multiple tenants. Tenant is the basic building block of all B2B applications.

## Usage

### Installation

```bash
npm install @niledatabase/client
```

### Social Login (SSO)

Nile-Auth supports multiple social providers. You configure and enable them in [Nile console](https://console.thenile.dev), and then simply drop-in the components. For example, for Discord authentication:

## Learn more

- You can learn more about Nile and the SDK in [https://thenile.dev/docs]
- You can find detailed code examples in [our main repo](https://github.com/niledatabase/niledatabase)
- Nile SDK interacts with APIs in Nile Auth service. You can learn more about it in the [repository](https://github.com/niledatabase/nile-auth) and the [docs](https://thenile.dev/docs/auth)
