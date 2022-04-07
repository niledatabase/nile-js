#!/bin/bash

# personalize the open api docs for use with the actual interface
sed  -i  ''  -e  "/import \* as fs from 'fs';/,1 d" ./src/generated/openapi/DefaultApi.md
sed  -i  ''  -e  "s/Nile.DefaultApi/Nile/" ./src/generated/openapi/DefaultApi.md
sed  -i  ''  -e  "s/const apiInstance/const nile/" ./src/generated/openapi/DefaultApi.md
sed  -i  ''  -e  "s/apiInstance\./nile\./" ./src/generated/openapi/DefaultApi.md

cp ./src/generated/openapi/DefaultApi.md ./src/README.md