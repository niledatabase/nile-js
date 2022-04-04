import React from 'react';
import { useRouter } from 'next/router';
import { ComponentList } from '../components/ComponentList';
import { NileProvider, LoginForm } from '@theniledev/react';

function SignIn() {
  const router = useRouter();
  const { redirect } = router.query;

  return (
    <NileProvider apiUrl="http://localhost:8080">
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
    </NileProvider>
  );
}

export default SignIn;
