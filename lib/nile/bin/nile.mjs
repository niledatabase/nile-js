#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import readline from 'readline';

import fetch from 'node-fetch';
import sade from 'sade';

const prog = sade('nile');

const stdin = process.stdin;
stdin.setEncoding('utf-8');

let rootDir = process.cwd();
if (!rootDir.endsWith('/lib/nile')) {
  rootDir = path.join(process.cwd(), 'node_modules/@theniledev/js');
}
const specDir = path.join(rootDir, 'spec');
const apiFile = path.join(specDir, 'api.yaml');

const handlePassword = (query) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const stdin = process.openStdin();
    process.stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine();
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(query);
          break;
      }
    });
    rl.question(query, (value) => {
      rl.history = rl.history.slice(1);
      rl.close();
      resolve(value);
    });
  });

prog
  .command('rebuild')
  .option('-u, --user', 'Your email address for Nile.')
  .option('-p, --password', 'Provide a password for authentication.')
  .option(
    '-a, --api',
    'the FQDN of the nile instance eg. https://prod.thenile.dev'
  )
  .option('-v, --verbose', 'Enable verbose output')
  .describe(
    'Rebuilds the nile-js SDK after entities have been updated. Based on your authentication method, it will generate based on your own unique entities.'
  )
  .example('rebuild')
  .example('$NILE_TOKEN rebuild')
  .example('rebuild -u webmasater@geocities.com -p')
  .example('rebuild -u webmasater@geocities.com -a https://dev.thenile.dev -p')
  .action((opts) => {
    const pass = opts?.password || opts?.p;
    const run = async () => {
      const password = pass ? await handlePassword('password:') : '';
      if (!process.env.NILE_TOKEN && !password) {
        console.log('Authentication method required.');
        return;
      }
      await rebuild(opts, process.env.NILE_TOKEN, password);
    };

    run();
  });

async function rebuild(opts, token, password) {
  const verbose = opts?.verbose || opts?.v;
  const user = opts?.user || opts?.u;
  const url = opts?.api || opts?.a || 'https://prod.thenile.dev';

  const headers = {};

  if (verbose) {
    console.log('logging in to', url);
  }

  if (user && password) {
    const tokenRes = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: String(user), password: String(password) }),
    }).then((res) => res.json());

    headers.Authorization = `Bearer ${tokenRes.token}`;

    if (!tokenRes.token) {
      if (verbose) {
        console.log(tokenRes);
      }

      console.log('Unable to fetch spec. Invalid credentials.');
      return;
    }

    if (verbose) {
      console.log('token retrieved', String(tokenRes.token));
      console.log('fetching from ', url);
    }
  }

  if (user && !token) {
    console.log('Auth token is required');
    return;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('fetching latest spec...');

  const baseSpec = await fetch(`${url}/openapi.yaml`, {
    headers,
  });

  const text = await baseSpec.text();

  if (verbose) {
    console.log('spec to be loaded:', text);
  }

  if (!fs.existsSync(specDir)) {
    if (verbose) {
      console.log('creating spec directory', specDir);
    }
    fs.mkdirSync(specDir);
  }

  if (verbose) {
    console.log('writing api.yaml');
  }

  fs.writeFileSync(apiFile, text);

  console.log('building SDK... (this may take a while)');

  if (verbose) {
    console.log('running npm install in', rootDir);
  }

  exec('npm install', { cwd: rootDir }, async (err, stdout) => {
    if (verbose) {
      console.log(stdout);
    }

    if (err) {
      console.error(err);
      if (!verbose) {
        console.log(
          'for additional information, add --verbose to the command.'
        );
      }
      return;
    }

    console.log('generating updated javascript SDK...');

    exec('npm run build', { cwd: rootDir }, (err, stdout) => {
      if (verbose) {
        console.log(stdout);
      }
      if (err) {
        console.error(err);
        console.log(
          'for additional information, add --verbose to the command.'
        );
        return;
      }
      console.log('done!');
    });
  });
}
prog.parse(process.argv);
