import Link from 'next/link';
import { Button } from './Button';
import styles from '../styles/Home.module.css';

export function ComponentList() {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <Link href="/org" passHref>
          <span>
            <Button>org</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/signup" passHref>
          <span>
            <Button>Sign up</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/signin" passHref>
          <span>
            <Button>Sign in</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/editor" passHref>
          <span>
            <Button>Editor</Button>
          </span>
        </Link>
      </div>
    </div>
  );
}
