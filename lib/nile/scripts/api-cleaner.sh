#!/bin/bash

# remove login override
sed  -i -e '1,/async login/ s/async login/async delete-nile-base-login/g' ./src/generated/openapi/src/apis/DefaultApi.ts
sed -i -e '/async delete-nile-base-login/,/}/d' ./src/generated/openapi/src/apis/DefaultApi.ts
