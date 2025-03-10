<p align="center">
  <img width="1434" alt="Screen Shot 2024-09-18 at 9 20 04 AM" src="https://github.com/user-attachments/assets/20585883-5cdc-4f15-93d3-dc150e87bc11">
</p>

---

# Nile's Javascript SDK

Nile's Javascript SDK provides a seamless way to build multi-tenant B2B applications with built-in tenant isolation and user management. Built on top of Nile's Postgres platform, it offers:

- 🔐 Tenant virtualization and isolation out of the box
- 👥 Built-in user management and authentication with drop-in customizable components
- 🔍 Simple and powerful database querying capabilities

**Nile is a Postgres platform that decouples storage from compute, virtualizes tenants, and supports vertical and horizontal scaling globally to ship B2B applications fast while being safe with limitless scale.** All B2B applications are multi-tenant. A tenant/customer is primarily a company, an organization, or a workspace in your product that contains a group of users. A B2B application provides services to multiple tenants. Tenant is the basic building block of all B2B applications.

## Using Nile-JS

### Install dependencies

```bash
npm install @niledatabase/server @niledatabase/react
```

### Instantiate Nile Server SDK

```typescript
import { Nile } from "@niledatabase/server";
export const nile = await Nile();
```

### Call Nile APIs

```typescript
const tenant = await nile.api.tenants.createTenant(tenantName);
if (tenant instanceof Response) {
  const err = await tenant.text()
  console.log("ERROR creating tenant: ", tenant, err);
  return { message: "Error creating tenant" };
}
nile.tenant_id = tenant.id
// Get tenant name doesn't need any input parameters 
// because it uses the tenant ID and user token from the context
const checkTenant = await tenantNile.api.tenants.getTenant();
```

### Query the database

```typescript
  const todos = await nile.db
    .query("select * from todos order by title")
    .catch((e: Error) => {
      console.error(e);
    }); // no need for where clause if you previously set Nile context
```

### Drop in some auth components

```typescript
import { DiscordSignInButton } from '@niledatabase/react';

function App() {
  return (
    <div>
      <DiscordSignInButton callbackUrl="/" />
    </div>
  );
}
```

## Packages

The core of the SDK is in two packages:

- **[Server](./packages/server/README.md)** - This package includes the configuration classes, methods and types for all Nile APIs (user management, tenant management, authentication), as well as a powerful query interface for working with your Nile database.
- **[React](./packages/react/README.md)** - This package includes the drop-in UI components and convenient hooks for authentication, user management and tenant management.

## Learn more

- You can learn more about Nile and the SDK in [https://thenile.dev/docs]
- You can find detailed code examples in [our main repo](https://github.com/niledatabase/niledatabase)
- Nile SDK interacts with APIs in Nile Auth service. You can learn more about it in the [repository](https://github.com/niledatabase/nile-auth) and the [docs](https://thenile.dev/docs/auth)
