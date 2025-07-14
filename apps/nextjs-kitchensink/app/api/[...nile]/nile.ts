import { Nile } from '@niledatabase/server';
import { nextJs } from '@niledatabase/nextjs';

export const nile = Nile({
  debug: true,
  extensions: [nextJs],
});
export const { handlers } = nile;
