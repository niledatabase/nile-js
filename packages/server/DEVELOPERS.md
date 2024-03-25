# @niledatabase/server

Consolidates the API and DB for working with Nile.

### Adding an endpoint:

#### Add the openapi spec

1. Find or add to `src` the name of the base property eg `src/tenants`
1. Add a new folder with new method eg `src/tenants/createTenantUser`
1. Add an `openapi/paths` folder under the method folder and insert a JSON openapi spec. [This helps with conversion](https://onlineyamltools.com/convert-yaml-to-json)
1. If there are common schemas or responses, add them to `src/openapi` and reference them accordingly
1. Update `/openapi/index.json` with any modifications, including the file you added/changed
1. `yarn build` to be sure it works.

#### Add new function to the sdk

1. Add the method (using the method name) and a function for obtaining URL to the base index file with types eg`src/tenants/index` (this should be a lot of copy paste)
1. Add a test under the method folder to be sure it goes to the correct url.
