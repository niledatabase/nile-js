## useInstances

A hook for wrapping up and automatically refreshing data.

### example

```typescript
import { useInstances } from '@theniledev/react';

const SomeComponent = () => {
  // get `myEntity`, refresh every 4s, refetch data when the button is clicked
  const { refetch, data } = useInstances('myOrg', 'myEntity', {
    refershInterval: 4000,
  });

  return (
    <Button
      onClick={() => {
        // do some submit logic
        refetch();
      }}
    >
      Create new
    </Button>
  );
};
```
