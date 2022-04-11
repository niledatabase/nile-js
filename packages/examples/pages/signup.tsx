import React from 'react';
import {
  SignUpForm,
  useNile,
  LabelOverride,
  InputOverride,
} from '@theniledev/react';
import { useRouter } from 'next/router';
import { LoginInfo } from '@theniledev/js';

import styles from '../styles/Home.module.css';
import { ComponentList } from '../components/ComponentList';

const EmailLabel = (props: LabelOverride) => {
  return (
    <label {...props} htmlFor="fancyName">
      Not an email
    </label>
  );
};

const EmailInput = (props: InputOverride) => (
  <>
    <label htmlFor="fancyName" />
    <img src="/fancy-name.svg" alt="fancy name" />
    <input {...props} type="email" name="fancyName" placeholder="Email" />
  </>
);

function Signup() {
  const router = useRouter();
  const { invite_code } = router.query;
  const nile = useNile();

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1>🤩 InstaExpense 🤩</h1>
        </div>
        <div>
          <ComponentList />
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.signIn}>
          <h2>Sign up</h2>
          <SignUpForm
            emailLabel={EmailLabel}
            emailInput={EmailInput}
            handleSuccess={async (loginInfo: LoginInfo) => {
              await nile.login(loginInfo);
              if (invite_code) {
                await nile.acceptInvite(Number(invite_code));
              }
              router.push('/users');
            }}
          />
        </div>
      </div>
    </>
  );
}

export default Signup;
