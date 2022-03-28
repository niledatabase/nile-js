import type { NextPage } from 'next';
import { NileProvider } from '@theniledev/react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ComponentList } from '../components/ComponentList';

const Home: NextPage = () => {
  return (
    <NileProvider apiUrl='http://localhost:8080'>
      <div className={styles.container}>
        <Head>
          <title>nile js testing</title>
          <meta
            name="description"
            content="amalgamation of code for lib testing"
          />
          <link rel="icon" href="favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Components</h1>
          <ComponentList />
        </main>

        <footer className={styles.footer}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <span className={styles.logo}>
              <img src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            </span>
          </a>
        </footer>
      </div>
    </NileProvider>
  );
};

export default Home;
