# Organization creation form

A form for a name of an organization.

## Usage

```typescript
import { OrganizationForm, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function App() {
  return (
    <NileProvider basePath={API_URL}>
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
