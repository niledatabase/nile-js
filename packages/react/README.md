# @theniledev/react

## Storybook

[Storybook](link-to-story-book)

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

Once added, there is a hook and components available for use.

### useNile

A method exposing the `@theniledev/js` instance created in `<NileProvider />`. The methods on the instance can be found in [the client src readme](../../lib/nile/src/README.md), or found in the auto-complete of visual studio code.

### Making requests

[react-query](https://react-query.tanstack.com/) should be used used to handle loading, error, and cacheing of data.

```typescript
import React, { useEffect } from 'react';
import { useNile } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';

export default function UserTable() {
  const nile = useNile();
  const [users, setUsers] = useState();
  const { data: users = [] } = useQuery(['ListUsers'], () => nile.listUsers());
  // with multiple requests
  // const [{ data: users = [] }, { data: invites = [] }] = useQueries([
  //   { queryKey: ['users'], queryFn: () => nile.listUsers({}) },
  //   { queryKey: ['invites'], queryFn: () => nile.listInvites({}) },
  // ]);

  return (
    users.map((user) => {
      return <div id={user.id}>{`Email: ${user.email}`</div>;
    })
  );
}
```

### UI customization

For theming and display, [mui joy](https://mui.com/joy-ui/getting-started/overview/) is used.

For details on theming, see their [theming documentation](https://mui.com/joy-ui/customization/approaches/). You can pass a custom `theme` object to the `NileProvider` and it will pass the custom theme to Mui Joy.

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

[LoginForm](./src/components/LoginForm/README.md)

[SignUpForm](./src/components/SignUpForm/README.md)
