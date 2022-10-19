## useFetch

This hook can be used on conjunction with other backend services configured to work with Nile. All it does is ensure `credentials` are set to `include` to be sure cookies HTTP-only cookies are passed to the secondary service.

### Usage

```typescript
import { Stack, Button } from '@mui/joy';
import { useNile, useFetch } from '@thenile.dev/react';

function CustomComponent() {
  const nile = useNile();
  const fetch = useFetch();

  const fetchFromBackend = React.useCallback(() => {
    async function doRequest() {
      try {
        const myResult = await fetch('https://my.backend.service');
        console.log(myResult);
      } catch (e) {
        console.error(e.message);
      }
    }
    doRequest();
  }, []);

  const fetchFromNile = React.useCallback(() => {
    async function doRequest() {
      try {
        const myResult = await nile.users.listUsers();
        console.log(myResult);
      } catch (e) {
        console.error(e.message);
      }
    }
    doRequest();
  }, []);

  return (
    <Stack>
      <Button onClick={fetchFromBackend}>Do Request from backend</Button>;
      <Button onClick={fetchFromNile}>Do Request from Nile</Button>;
    </Stack>
  );
}
```

## Handling CORS

In order for `useFetch` and `useNile` to work well together, the secondary web server needs set up to handle CORS. This allows for cookies to be shared transparently between your domain and Nile. Below is an example (in nextjs) for using Nile as the source of truth for authentication on a secondary server:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import Nile from '@theniledev/js';

// Initialize Nile
const nile = Nile({
  basePath: 'https://prod.thenile.dev',
  workspace: 'myWorkspace',
});

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  origin: ['https://mysupercoolsite.com'], // **important** the `origin` here needs to match the `origin` CORS header on `https://prod.thenile.dev`
  methods: ['POST', 'GET', 'HEAD'],
  credentials: true, // be sure to accept credentials passed by the HTTP-only cookie
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the middleware
  await runMiddleware(req, res, cors);
  const { token } = req.cookies;

  if (typeof token === 'string') {
    try {
      await nile.developers.validateDeveloper({
        token: { token },
      });
      // nile.authToken = token; // use the valid token on the server's client to make requests to nile, if necessary
      console.log('[INFO]', 'Token has been validated');
      // request for policies you would like to enforce
    } catch (e) {
      console.log('[ERROR]', e.message);
      // developer does not have permission to the workspace
      res.status(403).send();
    }
  }
  // Rest of the API logic
  res.json({ message: 'Hello Everyone!' });
}
```
