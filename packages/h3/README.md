# @niledatabase/h3

Nile integration for H3 applications.

## Usage

This extension provides a "zero-config" experience for H3. By passing your `App` instance to the extension, it automatically registers a global middleware that:

1.  Wraps every request in a Nile context (via `AsyncLocalStorage`).
2.  Injects the `nile` singleton into `event.context`.

### Setup

```typescript
import { createApp } from "h3";
import Nile from "@niledatabase/server";
import { h3 } from "@niledatabase/h3";

const app = createApp();

const nile = await Nile({
  extensions: [h3(app)], // Pass the app instance here
});
```

### Accessing Nile in Handlers

You can access the `nile` instance directly from the event context without importing it.

```typescript
app.use("/me", eventHandler(async (event) => {
  // Access nile from the event context
  // It is fully typed and ready to use
  const user = await event.context.nile.users.getSelf();
  return user;
}));
```

### Context Propagation

Because the middleware wraps the request context, you can also use singleton exports (if you have them) or other functions that rely on `nile.getInstance()`, and they will correctly pick up the current tenant/user context automatically.
