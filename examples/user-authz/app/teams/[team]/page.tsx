import Link from 'next/link';
import { cookies } from 'next/headers';

import TeamDashboard from '@/nile/ui/TeamDashboard';
import { db, api } from '@/nile/Server';

// in this example, team name will map to tenant (imagine name uniqueness is enforced in the tenant table)
async function get(team: string) {
  const name = team.split('-').join(' ');
  await db.raw('RESET nile.user_id');
  await db.raw('RESET nile.tenant_id');
  const [tenant] = (
    await db.raw(`SELECT *
                    from tenants
                    where name ILIKE '${name}'`)
  ).rows;
  // TODO: Use `/me` endpoint
  const tokenVal = cookies().get('token').value;
  const decodedTokenVal = JSON.parse(
    Buffer.from(tokenVal.split('.')[1], 'base64').toString()
  );
  const userId = api.users.uuid.decode(decodedTokenVal.sub);
  await db.raw(`SET nile.tenant_id = '${tenant.id}'`);
  try {
    await db.raw(`SET nile.user_id = '${userId}'`);
  } catch (e) {
    if (e.code === '28000') {
      return { error: `unauthorized to access tenant ${name}` };
    } else {
      return { error: 'internal error' };
    }
  }
  /*
  Also need to figure out RESET auto-magic with Knex to prevent connection pooling contamination
  1. Log in as a user (cookies etc are set)
  2. Set nile.tenantId (not done in knex, works for REST). Have to additional work to get other ORMs (i.e: Prisma) to work
  3. Set nile.userId to 1. (not done for either)
  4. Use db.withTenantId().withUserId() (or dbWithAuth, w/e). Have to do some more work to figure UX here
  5. Query via db, or dbWithAuth
   */
  // import db, dbWithAuth
  const rawStops = await db
    .with('averages', (qb) => {
      qb.select(db.raw('AVG("end" - start) AS avg_duration')).from(
        'pit_stop_times'
      );
    })
    .select('c.tenant_id')
    .select('name')
    .select(db.raw('("end" - start) / 1000 AS pit_duration'))
    .select(
      db.raw(`
      CASE
        WHEN ("end" - start) < averages.avg_duration THEN 'good'
        ELSE 'bad'
      END AS result
    `)
    )
    .from('pit_stop_times')
    .join('circuits AS c', function () {
      this.on('pit_stop_times.circuit_id', '=', 'c.id').andOn(
        'pit_stop_times.tenant_id',
        '=',
        'c.tenant_id'
      );
    })
    .crossJoin(db.raw('averages'))
    .where(db.raw(`pit_stop_times.tenant_id = '${tenant.id}'`));

  const pitStops = rawStops.reduce((all, next) => {
    const { name, ...remaining } = next;
    if (!all[name]) {
      all[name] = [remaining];
    } else {
      all[name].push(remaining);
    }
    return all;
  }, {});
  return { pitStops, teamName: tenant.name };
}

type Params = { params: { team: string } };

export default async function Dashboard({ params: { team } }: Params) {
  const { pitStops, teamName, error } = await get(team);
  return (
    <div>
      <div
        style={{
          padding: '30px',
        }}
      >
        <button
          style={{
            borderRadius: '6px',
            padding: '20px 36px',
            border: 'none',
            backgroundColor: '#f9913d',
            color: 'white',
          }}
        >
          <Link href="/">Back to login</Link>
        </button>
      </div>
      <TeamDashboard pitStops={pitStops} teamName={teamName} error={error} />
    </div>
  );
}
