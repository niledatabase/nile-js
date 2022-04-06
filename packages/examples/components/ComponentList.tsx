import Link from 'next/link';
import { Button } from './Button';
import styles from '../styles/Home.module.css';

export function ComponentList() {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <Link href="/org" passHref>
          <span>
            <Button node={null}>org</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/signup" passHref>
          <span>
            <Button node={null}>Sign up</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/signin" passHref>
          <span>
            <Button node={null}>Sign in</Button>
          </span>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/editor" passHref>
          <span>
            <Button node={null}>Editor</Button>
          </span>
        </Link>
      </div>
    </div>
  );
}
