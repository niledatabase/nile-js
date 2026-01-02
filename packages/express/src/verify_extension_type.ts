import { Extension } from '@niledatabase/server';

import { express } from './index';

// Verify express satisfies Extension interface
export const ext: Extension = express;
