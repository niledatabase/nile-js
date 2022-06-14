# Client API

## Methods

### acceptInvite

🏭 **organizations.acceptInvite**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

Accept an invite

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
  // number
  code: 56,
};

nile.organizations
  .acceptInvite(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### createDeveloper

💻 **developers.createDeveloper**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // CreateUserRequest
  createUserRequest: {
    email: "",
    password: "",
  },
};

nile.developers
  .createDeveloper(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### createEntity

✨ **entities.createEntity**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Entity`](#entity)\>

Create Entity

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  entity: {
    // a JSON Schema
    name: "greeting",
    schema: {
      properties: {
        salutation: {
          type: "string",
        },
      },
    },
  },
};

nile.entities
  .createEntity(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### createInstance

⚡ **entities.createInstance**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Instance`](#instance)\>

Create a new Instance

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
  // string
  type: "greeting",
  // object
  body: {
    salutation: "hello world",
  },
};

nile
  .createInstance(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### createOrganization

🏭 **organizations.createOrganization**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Organization`](#organization)\>

Create a new Organization

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  createOrganizationRequest: {
    name: "name",
  },
};

nile.organizations
  .createOrganization(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### createUser

🤪 **users.createUser**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // CreateUserRequest (optional)
  createUserRequest: {
    // string
    email: "email",
    // string
    password: "password",
  },
};

nile.users
  .createUser(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### deleteInstance

⚡ **entities.deleteInstance**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
  // string
  type: type_example,
  // number
  id: 56,
};

nile.entities
  .deleteInstance()
  .then((data) => {
    console.log("API called successfully");
  })
  .catch((error: any) => console.error(error));
```

---

### deleteOrganization

🏭 **organizations.deleteOrganization**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

Delete an organization by id

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  id: 56,
};

nile.organizations
  .deleteOrganization(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### deleteUser

🤪 **users.deleteUser**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

Delete a user

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  id: 56,
};

nile.users
  .deleteUser(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### getEntity

✨ **.entities.getEntity**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Entity`](#entity)\>

Get Entity

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // string
  type: "salutaiton",
};

nile.entities
  .getEntity(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### getOpenAPI

✨ **entities.getOpenAPI**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

Get an openapi description of an entity

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // string
  type: "salutation",
};

nile.entities
  .getEntityOpenApi(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### getInstance

⚡ **entities.getInstance**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Instance`](#instance)\>

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
  // string
  type: "salutation",
  // number
  id: 56,
};

nile.entities
  .getInstance(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### me

🤪 **users.me**(`initOverrides?`): `Promise`<`void` \| [`User`](#user)\>

Get information about current authenticated user

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

let body: any = {};

nile.users
  .me(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### getOrganization

🏭 **organizations.getOrganization**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Organization`](#organization)\>

Get an organization by id

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  id: 56,
};

nile.organizations
  .getOrganization(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### getUser

🤪 **users.getUser**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`User`](#user)\>

Get a user by id

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  id: 56,
};

nile.users
  .getUser(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### listEntities

✨ **entities.listEntities**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Entity`](#entity)[]\>

List all Entities

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
};

nile.entities
  .listEntities(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### listInstances

⚡ **entities.listInstances**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Instance`](#instance)[]\>

List of all instances

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
  // string
  type: "salutations",
};

nile.entities
  .listInstances(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### listInvites

🏭 **organizations.listInvites**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Invite`](#invite)[]\>

List all Invites

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
};

nile.organizations
  .listInvites(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### listOrganizations

🏭 **organizations.listOrganizations**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Organization`](#organization)[]\>

List all Organizations

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
};

nile.organizations
  .listOrganizations(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### listUsers

🤪 **listUsers**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`User`](#user)[]\>

List all users for an org

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
};

nile.users
  .listUsers(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### listWorkspaces

🖥️ **workspaces.listWorkspaces**(`initOverrides?`): `Promise`<`void` \| [`Organization`](#organization)[]\>

List all workspaces

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

let body: any = {};

nile.workspaces
  .listWorkspaces(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### createWorkspace

️🖥️ **createWorkspace**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Organization](#organization)\>

Create a workspace

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  reateOrganizationRequest: {
    name: "myWorkspace",
  },
};

nile.workspaces
  .createWorkspace(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### loginDeveloper

💻 **developers.loginDeveloper**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Token`](#token)\>

login a developer to nile

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  loginInfo: {
    // string
    email: "email",
    // string
    password: "password",
  },
};

nile.developers
  .loginDeveloper(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### loginUser

🤪 **users.loginUser**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Token`](#token)\>

login a user to nile

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  loginInfo: {
    // string
    email: "email",
    // string
    password: "password",
  },
};

nile.users
  .loginUser(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### updateInstance

⚡ **entities.updateInstance**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Instance`](#instance)\>

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  org: 56,
  // string
  type: "salutation",
  // number
  id: 56,
  patchInstanceRequest: {
    greeting: "good morning",
  },
};

nile.entities
  .updateInstance(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### updateEntity

✨ **entities.updateEntity**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Entity`](#entity)\>

Update an Entity

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // string
  type: "salutation",
  patchEntityRequest: {
    properties: {
      bow: {
        type: "boolean",
      },
    },
  },
};

nile.entities
  .updateEntity(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### updateOrganization

🏭 **organizations.updateOrganization**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| [`Organization`](#organization)\>

Update an organization

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  // number
  id: 56,
  patchOrganizationRequest: {
    name: "name",
  },
};

nile.organizations
  .updateOrganization(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### validateDeveloper

💻 **developers.validateDeveloper**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

validate a developer token

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  token: { token: "token" },
};

nile.developers
  .validateDeveloperToken(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

### validateUser

🤪 **users.validateUser**(`requestParameters`, `initOverrides?`): `Promise`<`void` \| `object`\>

validate a user token

**`example`**

```typescript
import Nile from "@theniledev/js";

const nile = new Nile({
  apiUrl: "http://localhost:8080",
  workspace: "myWorkspace",
});

const body = {
  // string (optional override)
  // workspace: "myWorkspace",
  token: { token: "token" },
};

nile.users
  .validateUserToken(body)
  .then((data) => {
    console.log("API called successfully. Returned data: " + data);
  })
  .catch((error: any) => console.error(error));
```

---

## Properties

### authToken

The auth token is set when a developer or user logs in. It is used to authenticate all API calls.

- **authToken**: `string`

## Interfaces

### Entity

#### Properties

- **name**: `string`

- **schema**: `object`

### Instance

#### Properties

- **id**: `number`

- **type**: `string`

- **properties**: `object`

### Invite

#### Properties

- **code**: `number`

- **inviter**: `number`

- **org**: `number`

- **status**: `Active`

### Organization

#### Properties

- **id**: `number`

- **name**: `string`

- **type**: `organization` | `workspace`

### User

#### Properties

- **email**: `string`

- **id**: `number`

- **type**: `developer` | `user`

### Token

#### Properties

- **token**: `string`
