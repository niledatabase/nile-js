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
            <Button>Sign Up</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/signin" passHref>
          <span>
            <Button>Sign In</Button>
          </span>
        </Link>
      </div>
    </div>
  );
}
