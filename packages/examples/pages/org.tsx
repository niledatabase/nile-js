import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNile, LoginForm } from '@theniledev/react';

import { ComponentList } from '../components/ComponentList';

const Orgs = React.memo(() => {
  const nile = useNile();
  const { isLoading, data: orgs } = useQuery(['organizations'], () =>
    nile.organizations.listOrganizations()
  );
  return (
    <>
      <form>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            <h1>🤩 InstaExpense 🤩</h1>
            <pre>{JSON.stringify(orgs, null, 2)}</pre>
          </>
        )}
      </form>
      <ComponentList />
    </>
  );
});

Orgs.displayName = 'orgs';

function Org() {
  const [success, setSuccess] = React.useState(false);

  if (success) {
    return <Orgs />;
  }

  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <LoginForm
        onSuccess={() => {
          setSuccess(true);
        }}
      />
      <ComponentList />
    </>
  );
}

export default Org;
