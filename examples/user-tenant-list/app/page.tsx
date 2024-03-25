import styles from './page.module.css';

import SignUpForm from '@/nile/ui/SignUpForm';

export default function Home() {
  return (
    <main className={styles.main}>
      <SignUpForm />
    </main>
  );
}
