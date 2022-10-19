# @theniledev/react

## Storybook

[Storybook](https://storybook.thenile.dev)

## Usage

In the root of your react application, add a Nile provider. This will add a [QueryClientProvider](https://tanstack.com/query/v4/docs/quick-start) and a [CssVarsProvider](https://mui.com/joy-ui/getting-started/usage/) to your application.

```typescript
import { NileProvider } from '@theniledev/react';
const API_URL = 'https://localhost:8080'; // location of nile instance

function App() {
  return (
    <NileProvider basePath={API_URL}>
      <div>Welcome to my great app</div>
    </NileProvider>
  );
}
```

Once added, there is a hook and components available for use. It is recommended to place the `<NileProvider />` as high up in your render tree as possible, since it contains both stying and request wrappers.

## Dependencies

### React query

The components of this library use [react-query](https://react-query.tanstack.com/) to request data. The `<QueryClientProvider />` used can be customized via the optional `QueryProvider` prop of the `<NileProvider />`.

```typescript
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function MyQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function App() {
  return (
    <NileProvider basePath={API_URL} QueryProvider={MyQueryProvider}>
      <div>Welcome to my great app</div>
    </NileProvider>
  );
}
```

### @mui/joy

Out of the box [mui joy](https://mui.com/joy-ui/getting-started/overview/) is available for use. No set up is required, simply add the dependencies to your code, then use components and functions provided by those libraries.

A custom theme can be given to the `NileProvider`, which will theme all components:

```typescript
function App() {
  return (
    <NileProvider basePath={API_URL} theme={theme}>
      <div>Welcome to my great app</div>
    </NileProvider>
  );
}
```

### useNile

A method exposing the `@theniledev/js` instance created in `<NileProvider />`. The methods on the instance can be found in [the client src readme](../../lib/nile/src/README.md), or found in the auto-complete of visual studio code.

### Making requests

[react-query](https://react-query.tanstack.com/) should be used used to handle loading, error, and cacheing of data.

```typescript
import React, { useEffect } from 'react';
import { useNile, Queries } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';

export default function UserTable() {
  const nile = useNile();
  const [users, setUsers] = useState();
  const { data: users = [] } = useQuery(Queries.ListUsers, () => nile.users.listUsers());
  // with multiple requests
  // const [{ data: users = [] }, { data: invites = [] }] = useQueries([
  //   { queryKey: Queries.ListUsers, queryFn: () => nile.users.listUsers({}) },
  //   { queryKey: Queries.ListInvites, queryFn: () => nile.organizations.listInvites({}) },
  // ]);

  return (
    users.map((user) => {
      return <div id={user.id}>{`Email: ${user.email}`</div>;
    })
  );
}
```

### UI customization

For theming and display, A combination of [mui joy](https://mui.com/joy-ui/getting-started/overview/) and [material ui](https://mui.com/material-ui/getting-started/overview/) is used. As joy approaches feature parity with material, it will be removed from this codebase. For now, there are helper functions in the theme to support both, with the theming function preferring mui joy settings and colors over material.

For details on theming, see their [theming documentation](https://mui.com/joy-ui/customization/approaches/). You can pass a custom `theme` object to the `NileProvider` and it will merge it with the combined material and joy themes in the `<NileProvider />`.

```typescript
import { NileProvider } from '@theniledev/react';
import { extendTheme } from '@mui/joy/styles';
const customTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: '#0078D4',
          solidHoverBg: '#106EBE',
          solidActiveBg: '#005A9E',
          solidDisabledBg: '#F3F2F1',
          solidDisabledColor: '#A19F9D',
        },
      },
    },
  },
});

const API_URL = 'https://localhost:8080'; // location of nile instance

function App() {
  return (
    <NileProvider basePath={API_URL} theme={customTheme}>
      <div>Welcome to my great app</div>
    </NileProvider>
  );
}
```

## Available components

[EntityForm](./src/components/EntityForm/README.md)

[InstanceList](./src/components/InstanceList/README.md)

[LoginForm](./src/components/LoginForm/README.md)

[Metrics](./src/components/Metrics/README.md)

[OrganizationForm](./src/components/OrganizationForm/README.md)

[SignUpForm](./src/components/SignUpForm/README.md)
