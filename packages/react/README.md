# @theniledev/react

## Usage

In the root of your react application, add a Nile provider.

```typescript
import { NileProvider } from '@theniledev/react';
const API_URL = 'https://localhost:8080'; // location of nile instance

function App() {
  return (
    <NileProvider apiUrl={API_URL}>
      <div>Welcome to my great app</div>
    </NileProvider>
  );
}
```

Once added, there is a hook and components available for use.

### useNile

A method exposing the `@theniledev/js` instance created in `<NileProvider />`. The methods on the instance can be found in [the client src readme](../../lib/nile/src/README.md), or found in the auto-complete of visual studio code.

```typescript
import React, { useEffect } from 'react';
import { useNile, useNileFetch } from '@theniledev/react';

export default function UserTable() {
  const nile = useNile();
  const [users, setUsers] = useState();
  const [, users] = useNileFetch(() => nile.listUsers());

  return (
    users &&
    users.map((user) => {
      return <div id={user.id}>{`Email: ${user.email}`</div>;
    })
  );
}
```

## Available components

[LoginForm](./src/components/LoginForm/README.md)

[SignUpForm](./src/components/SignUpForm/README.md)
