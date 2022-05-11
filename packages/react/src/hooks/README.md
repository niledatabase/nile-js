# hooks

## useNileFetch

This hook is a wrapper around the basic fetch functions of the SDK to reduce boilerplate. It also handles cancellation on in the event of unmount.

### usage

Each argument passed to the hook will correspond to the payload array. Because the default fetch function returns a promise which executes the network request, a callable function needs to be passed to the hook, unless the cancellable functions are used.

```
const [isLoading, fetched] = useNileFetch(() => nile.listUsers());
```

In this case, `fetched` contains the results of the requests made to the nile backend.

```
const [isLoading, fetched] = useNileFetch(() => [nile.getMe(), nile.listOrganizations(), ...]);
```

If an array is provided in the callback function, `fetched` is an array of the requests made to the nile backend.

### cancellation

It is possible to cancel requests via an `AbortController`. If the `[method]Raw` version of the function is passed to the hook, they will be handled automatically. This is especially useful if there are multiple requests for a given component that may take time to resolve.

```typescript
const [, payloads] = useNileFetch([
  nile.listOrganizationsRaw(),
  nile.listUsersRaw({}),
  nile.getEntityOpenAPIRaw({
    type: 'mySweetEntity',
  }),
]);
// payloads[0] - organizations
// payloads[1] - users
// payloads[2] - mySweetEntities
```

### examples

```typescript
import { useNile, useNileFetch } from '@theniledev/react';

function MyNileComponent() {
  const nile = useNile();
  const [isLoading, orgs] = useNileFetch(() => nile.listOrganizations());
  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <>{orgs && orgs.map((org) => <div key={org.id}>{org.orgName}</div>)}</>
  );
}
```

```typescript
import { useNile, useNileFetch } from '@theniledev/react';

function MyNileComponent() {
  const nile = useNile();
  const [isLoading, orgs] = useNileFetch(nile.listOrganizationsRaw());
  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <>{orgs && orgs.map((org) => <div key={org.id}>{org.orgName}</div>)}</>
  );
}
```

```typescript
import { User, Organization } from '@theniledev/js';
import { useNile, useNileFetch } from '@theniledev/react';

function MyNileComponent() {
  const nile = useNile();
  const [isLoading, [currentUser, orgs]] = useNileFetch<[User, Organization[]]>(
    () => [nile.getMe(), nile.listOrganizations()]
  );
  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <>
      {currentUser && <div>Welcome, {currentUser.email} !</div>}
      {orgs && orgs.map((org) => <div key={org.id}>{org.orgName}</div>)}
    </>
  );
}
```
