# Instance Table

A list (defaults to a table based on [data grid table in mui](https://mui.com/x/react-data-grid/)) for rendering instances.

The default exports transparently handles request and loading state.

## Usage

```typescript
import { InstanceList, NileProvider } from '@theniledev/react';

function App() {
  return (
    <NileProvider>
      <InstanceList entity="myEntity" org="userOrg" />
    </NileProvider>
  );
}
```

## Customization

See the [InstanceList storybook](https://storybook.thenile.dev/?path=/story/InstanceList--default) for samples on customizing `<InstanceList />` to fit your needs.
If none of the customizations work for a particular usecase, using the underlying [`useInstances`](../../lib/hooks/useInstances) hook offers maximum flexibility.

## Theming

[theming](../../../README.md#UI%20customization)
