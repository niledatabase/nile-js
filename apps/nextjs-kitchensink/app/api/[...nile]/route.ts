import { Handlers } from '@niledatabase/nextjs';

import { handlers } from './nile';

export const { POST, GET, DELETE, PUT } = handlers as Handlers;
