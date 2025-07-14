import { nextJs } from '@niledatabase/nextjs';
import { Server } from '@niledatabase/server';

// make a brand new server for nile since this is a special case where we are doing everything.
// Normally, just handle routes as routes, but anything is possible
export const nile = new Server({
  debug: true,
  routePrefix: '/google-manual',
  // we also need to tell nile-auth about the origin of our FE, so it goes to the right place.
  origin: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000',
  extensions: [nextJs],
});
