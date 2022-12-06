# Organization creation form

A form for a name of an organization.

## Usage

```typescript
import { OrganizationForm, NileProvider } from '@theniledev/react';

function App() {
  return (
    <NileProvider>
      <h1>🤩 My Great App🤩</h1>
      <h2>Create an organization</h2>
      <OrganizationForm
        onSuccess={(data) => {
          console.log('the created org:', data);
        }}
      />
    </NileProvider>
  );
}
```

## Theming

[theming](../../../README.md#UI%20customization)
