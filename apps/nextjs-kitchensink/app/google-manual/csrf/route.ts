import { nile } from '../localizedNile';

export async function GET() {
  return await nile.auth.getCsrf(true);
}
