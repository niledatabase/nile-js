#!/bin/bash

# remove login override

declare -a arr=(
  "EntitiesApi"
  "OrganizationsApi" 
  "UsersApi"
  "WorkspacesApi" 
  "DevelopersApi"
  "AccessApi"
)

for i in "${arr[@]}"
do
  sed -i -e 's/workspace: string;/workspace?: string;/' ./src/generated/openapi/src/apis/$i.ts
done

sed -i -e 's/listOrganizations(requestParameters:/listOrganizations(requestParameters?:/' ./src/generated/openapi/src/apis/OrganizationsApi.ts
sed -i -e 's/listEntities(requestParameters:/listEntities(requestParameters?:/' ./src/generated/openapi/src/apis/EntitiesApi.ts
sed -i -e 's/listUsers(requestParameters:/listUsers(requestParameters?:/' ./src/generated/openapi/src/apis/UsersApi.ts