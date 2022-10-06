# Instance Table

A list (defaults to a table based on [data grid table in mui](https://mui.com/x/react-data-grid/)) for rendering instances.

The default exports transparently handles request and loading state.

## Usage

```typescript
import { InstanceList, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function App() {
  return (
    <NileProvider basePath={API_URL}>
      <InstanceList entity="myEntity" org="userOrg" />
    </NileProvider>
  );
}
```

## Customization

See the [InstanceList storybook](https://react-storybook-ten.vercel.app/?path=/story/InstanceList--default) for samples on customizing `<InstanceList />` to fit your needs.

If you need full control over rendering, you can pass a `Component` prop. `<InstanceList />` will do the data fetching, and pass props back to you.

```typescript
import { InstanceList, NileProvider, ComponentProps } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function HandleEverything(props: ComponentProps) {
  return <>{JSON.stringify(props)}</>;
}

function App() {
  return (
    <NileProvider basePath={API_URL}>
      <InstanceList
        entity="myEntity"
        org="userOrg"
        Component={HandleEverything}
      />
    </NileProvider>
  );
}
```

## Theming

[theming](../../../README.md#UI%20customization)
