#!/bin/bash

# remove login override
sed -i -e '/public login/,/}/d' ./src/generated/openapi/types/PromiseAPI.ts
