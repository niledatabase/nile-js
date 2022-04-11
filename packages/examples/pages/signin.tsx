import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { LoginForm } from '@theniledev/react';

import { ComponentList } from '../components/ComponentList';
import styles from '../styles/Home.module.css';

function SignIn() {
  const router = useRouter();
  const { redirect } = router.query;
  const [showComponentList, setShowComponentList] = React.useState(false);
  const toggleList = useCallback(() => {
    setShowComponentList(!showComponentList);
  }, [showComponentList]);
  return (
    <>
      <div className={styles.header}>
        <div>
          <h1>🤩 InstaExpense 🤩</h1>
        </div>
        {showComponentList && <ComponentList />}
        <div onClick={toggleList}>{`${
          showComponentList ? 'hide' : 'show'
        } list`}</div>
      </div>
      <div className={styles.main}>
        <div className={styles.signIn}>
          <h2>Sign in</h2>
          <LoginForm
            handleSuccess={() => {
              if (redirect) {
                router.push(`/${redirect}`);
              } else {
                router.push('/users');
              }
            }}
          />
        </div>
      </div>
    </>
  );
}

export default SignIn;
