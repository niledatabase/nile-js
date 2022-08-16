import React from 'react';
import { useRouter } from 'next/router';
import { LoginForm } from '@theniledev/react';

import { ComponentList } from '../components/ComponentList';

function SignIn() {
  const router = useRouter();
  const { redirect } = router.query;

  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign in</h2>
      <LoginForm
        onSuccess={() => {
          if (redirect) {
            router.push(`/${redirect}`);
          } else {
            router.push('/users');
          }
        }}
      />
      <ComponentList />
    </>
  );
}

export default SignIn;
