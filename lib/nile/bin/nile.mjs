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
  .command('rebuild <url>')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-u, --user', 'The email address to use for authentication.')
  .option('-l, --local', 'Build from locally served OpenAPI spec.')
  .describe('Rebuilds the the SDK after entities have been updated.')
  .example('rebuild http://localhost:8080 -u webmasater@geocities.com')
  .action((url, opts) => {
    const user = opts.user || opts.u;
    const local = opts.local || opts.l;
    if (!user && !local) {
      console.log('The user param is required.');
      return;
    }
    const run = async () => {
      const password = !local ? await handlePassword('password:') : '';
      await rebuild(url, opts, password);
    };

    run();
  });

async function rebuild(url, opts, password) {
  const verbose = opts.verbose || opts.v;
  const user = opts.user || opts.u;
  const local = opts.local || opts.l;

  const headers = {};
  if (verbose) {
    console.log('logging in to', url);
  }

  if (!local) {
    headers.Authorization = `Bearer ${tokenRes.token}`;
    const tokenRes = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: String(user), password: String(password) }),
    }).then((res) => res.json());

    if (!tokenRes.token) {
      if (verbose) {
        console.log(tokenRes);
      }

      console.log('Invalid credentials');
      return;
    }

    if (verbose) {
      console.log('token retrieved', String(tokenRes.token));
      console.log('fetching from ', url);
    }
  }

  console.log('fetching latest spec...');
  const response = await fetch(`${url}/openapi.yaml`, {
    headers,
  });

  const text = await response.text();

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

  console.log('building SDK...');

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
