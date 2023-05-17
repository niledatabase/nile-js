import fs from 'node:fs';

import Server from '@theniledev/server';

// get the env vars
const envVars = await fs.readFileSync('.env.local', { encoding: 'utf-8' });
const config = envVars
  .split('\n')
  .filter(Boolean)
  .reduce((next, item) => {
    const [name, val] = item.split('=');
    if (val && !val.includes('#')) {
      next[name] = val;
    }
    return next;
  }, {});

// config for setting up API and DB communication
const serverConfig = {
  workspace: config.NEXT_PUBLIC_WORKSPACE,
  database: config.NEXT_PUBLIC_DATABASE,
  api: {
    basePath: 'https://dev.khnum.thenile.dev',
    token: config.NILE_TOKEN,
  },
  db: {
    connection: {
      user: config.NILE_USER,
      password: config.NILE_PASSWORD,
    },
  },
};
const nile = new Server.default(serverConfig);
const { db, api } = nile;

// main function to seed the data for example
(async function run() {
  // create and seed circuits
  await db.schema.createTable('circuits', (t) => {
    t.increments().primary();
    t.string('name');
  });
  const circuitIds = await db
    .insert(circuits)
    .into('circuits')
    .returning(['id']);

  await db.schema.createTable('pit_stop_times', (t) => {
    t.increments();
    t.float('start');
    t.float('end');
    t.integer('circuit_id');
    t.uuid('tenant_id');
    t.primary(['id', 'tenant_id']); // must be constrained with any tenant table
    t.foreign('circuit_id').references('circuits.id');
    t.foreign('tenant_id').references('tenants.id');
  });

  // loop over the teams, add the principal so they can login, and some pit stop times
  for (const { name, email } of teams) {
    // create tenants based off of teams
    const [{ id }] = await db
      .insert({ name })
      .into('tenants')
      .returning(['id']);

    nile.tenantId = id;

    //allow team principals to log in
    await api.users.createTenantUser({
      email,
      password: email,
    });

    // seed stop times for the races
    const stopTimes = makePitStopTimes(circuitIds, nile.tenantId);
    await db.insert(stopTimes).into('pit_stop_times');
  }

  process.exit(0);
})();

const teams = [
  { name: 'Red Bull', email: 'Christian@Horner.com' },
  { name: 'Ferarri', email: 'Frédéric@Vasseur.com' },
  { name: 'Mercedes', email: 'Toto@Wolff.com' },
  { name: 'Alpine', email: 'Otmar@Szafnauer.com' },
  { name: 'Alfa Romeo', email: 'Andreas@Seidl.com' },
  { name: 'Aston Martin', email: 'Mike@Krack.com' },
  { name: 'Haas', email: 'Guenther@Steiner.com' },
  { name: 'AlphaTauri', email: 'Franz@Tost.com' },
  { name: 'Williams', email: 'James@Vowles.com' },
  { name: 'Mercedes', email: 'Andrea@Stella.com' },
];
const circuits = [
  { name: 'Bahrain' },
  { name: 'Saudi Arabia' },
  { name: 'Australia' },
  { name: 'Azerbaijan' },
  { name: 'Miami' },
  { name: 'Monaco' },
  { name: 'Barcelona' },
  { name: 'Canada' },
  { name: 'Spielberg' },
  { name: 'Silverstone' },
  { name: 'Hungaroring' },
  { name: 'Spa' },
  { name: 'Zandvoort' },
  { name: 'Monza' },
  { name: 'Singapore' },
  { name: 'Japan' },
  { name: 'Qatar' },
  { name: 'Austin' },
  { name: 'Mexico' },
  { name: 'Brazil' },
  { name: 'Vegas' },
  { name: 'Abu Dhabi' },
];

function makePitStopTimes(circuitIds, tenant_id) {
  return circuitIds.flatMap(({ id: circuit_id }) => {
    const numberOfStops = Math.floor(Math.random() * (4 - 1) + 1);
    let startTime = Math.random() * (7200000 - 2000) + 2000;

    return new Array(numberOfStops).fill(null).flatMap(() => {
      const stopTime = Math.random() * (5000 - 1800) + 1800;

      const vals = {
        start: parseFloat(parseFloat(startTime).toFixed(2)),
        end: parseFloat(parseFloat(startTime + stopTime).toFixed(2)),
        circuit_id,
        tenant_id,
      };
      startTime =
        Math.random() * (7200000 - startTime + stopTime) + startTime + stopTime;
      return vals;
    });
  });
}
