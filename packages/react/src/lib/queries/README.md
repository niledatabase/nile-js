## Queries

Because the preferred requesting framework is react-query, and it's challenging some times to keep track of the query keys used for cacheing, the `Queries` object exported here simply creates unique cache keys based on the API.

### Usage

```typescript
import { useNile, Queries } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';

function DataFetcher() {
  const nile = useNile();

  const { data: organization, isFetching: isOrgFetching } = useQuery(
    Queries.GetOrganization(org),
    () => nile.organizations.getOrganization({ org: String(org) })
  );

  const { data: entityData, isFetching: isEntityFetching } = useQuery(
    Queries.GetEntity(entity),
    () => {
      return nile.entities.getEntity({ type: String(entity) });
    }
  );

  const { data: instances, isFetching: isInstancesFetching } = useQuery(
    Queries.ListInstances(entity, org),
    () =>
      nile.entities.listInstances({
        type: String(entity),
        org: String(org),
      })
  );
}
```
