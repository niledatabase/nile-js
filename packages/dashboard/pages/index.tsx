import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { Button } from "../components/Button";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>nile-js testing</title>
        <meta
          name="description"
          content="amalgamation of code for lib testing"
        />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Components</h1>
        <Link href="/signin" passHref>
          <Button>Sign In</Button>
        </Link>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <img src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
