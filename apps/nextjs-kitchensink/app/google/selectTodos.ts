import { nile } from '../api/[...nile]/nile';

export default async function selectTodos() {
  const loggedIn = await nile.auth.getSession();
  return loggedIn ? await nile.db.query('select * from todos2') : { rows: [] };
  /* 
  then display with something like  
  https://ui.shadcn.com/docs/components/data-table
  <DataTable data={todos.rows} columns={columns} />
  */
}
