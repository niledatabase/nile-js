import React from 'react';
import Link from 'next/link';

import styles from '../styles/Home.module.css';

import { Button } from './Button';

export function ComponentList() {
  return (
    <div className={styles.grid}>
      <Link href="/org" passHref>
        <span>
          <Button node={null}>org</Button>
        </span>
      </Link>
      <Link href="/signup" passHref>
        <span>
          <Button node={null}>Sign up</Button>
        </span>
      </Link>
      <Link href="/signin" passHref>
        <span>
          <Button node={null}>Sign in</Button>
        </span>
      </Link>
      <Link href="/editor" passHref>
        <span>
          <Button node={null}>Editor</Button>
        </span>
      </Link>
    </div>
  );
}
