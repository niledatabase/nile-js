# Entity form

This provides a generic form for updating entities. By providing `fields`, a form will be generated.

## Usage

```typescript
import { EntityForm, NileProvider, AttributeType } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

const fields = [
  { name: 'dbName', label: 'Database name', required: true },
  { name: 'size', label: 'Size', type: AttributeType.Number },
  {
    name: 'environment',
    label: 'Environment',
    type: AttributeType.Select,
    options: [
      { label: 'Test', value: 'test' },
      { label: 'Development', value: 'dev' },
      { label: 'Production', value: 'prod' },
    ],
  },
];

function App() {
  return (
    <NileProvider basePath={API_URL}>
      <EntityForm
        entityType="myEntity"
        onSuccess={() => alert('success!')}
        fields={customFieldAttributes}
        org="myOrg"
        cancelButton={<Button variant="outlined">Cancel</Button>}
      />
    </NileProvider>
  );
}
```

## Theming

[theming](../../../README.md#UI%20customization)
