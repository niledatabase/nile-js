# Instance Table

A table (based on [data grid table in mui](https://mui.com/x/react-data-grid/)) for rendering instances.

The default exports transparently handles request and loading state. If you need finer grained control, you could `InstanceTable` directly, but it may make more sense to implement your own wrapper around the react-data-grid table.

## Usage

```typescript
import { InstanceTable, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function App() {
  return (
    <NileProvider basePath={API_URL}>
      <InstanceTable entity="myEntity" org="userOrg" />
    </NileProvider>
  );
}
```

## Customization

See the [InstanceTable storybook](https://react-storybook-ten.vercel.app/?path=/story/instancetable--default) for samples on customizing `<InstanceTable />` to fit your needs.

## Theming

[theming](../../../README.md#UI%20customization)
