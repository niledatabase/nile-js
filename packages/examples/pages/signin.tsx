import React from 'react';
import { useRouter } from 'next/router';
import { ComponentList } from '../components/ComponentList';
import { LoginForm } from '@theniledev/react';

function SignIn() {
  const router = useRouter();
  const { redirect } = router.query;

  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign in</h2>
      <LoginForm
        handleSuccess={() => {
          if (redirect) {
            router.push(`/${redirect}`);
          }
        }}
      />
      <ComponentList />
    </>
  );
}

export default SignIn;
