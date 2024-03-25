import Server from '@niledatabase/server';
import Link from 'next/link';

import TeamDashboard from '@/nile/ui/TeamDashboard';

const { db } = new Server({
  workspace: String(process.env.NILE_WORKSPACE),
  database: String(process.env.NILE_DATABASE),
  db: {
    connection: {
      user: process.env.NILE_USER,
      password: process.env.NILE_PASSWORD,
    },
  },
});

// in this example, team name will map to tenant (imagine name uniqueness is enforced in the tenant table)
async function get(team: string) {
  const name = team.split('-').join(' ');
  const [tenant] = await db('tenants').whereILike('name', name);
  const rawStops = await db
    .with('averages', (qb) => {
      qb.select(db.raw('AVG("end" - start) AS avg_duration')).from(
        'pit_stop_times'
      );
    })
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
    .join('circuits AS c', 'pit_stop_times.circuit_id', 'c.id')
    .crossJoin(db.raw('averages'))
    .where('tenant_id', tenant.id);

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
  const { pitStops, teamName } = await get(team);
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
      <TeamDashboard pitStops={pitStops} teamName={teamName} />
    </div>
  );
}
