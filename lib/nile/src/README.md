# Nile

All calls, except `login`, should be authenticated. The authentication headers is stored in memory, provided `login` has been called, and the token can be accessed via `nile.authToken`.

All URIs are relative to *https://admin.api.thenile.dev/v0*

| Method                                                       | HTTP request                    | Description                            |
| ------------------------------------------------------------ | ------------------------------- | -------------------------------------- |
| [**acceptInvite**](DefaultApi.md#acceptInvite)               | **POST** /invites/{code}/accept | Accept an invite.                      |
| [**createOrganization**](DefaultApi.md#createOrganization)   | **POST** /orgs                  | Create a new Organization.             |
| [**createUser**](DefaultApi.md#createUser)                   | **POST** /users                 | Create a new User.                     |
| [**deleteOrganization**](DefaultApi.md#deleteOrganization)   | **DELETE** /orgs/{id}           | Delete this Organization.              |
| [**deleteUser**](DefaultApi.md#deleteUser)                   | **DELETE** /users/{id}          | Delete this User.                      |
| [**getAcceptedInvite**](DefaultApi.md#getAcceptedInvite)     | **GET** /accepted_invites/{id}  | Get an accepted invite.                |
| [**getInvite**](DefaultApi.md#getInvite)                     | **GET** /invites/{code}         | Get an invite.                         |
| [**getOrganization**](DefaultApi.md#getOrganization)         | **GET** /orgs/{id}              | Get information for this Organization. |
| [**getUser**](DefaultApi.md#getUser)                         | **GET** /users/{id}             | Get information for this User.         |
| [**listAcceptedInvites**](DefaultApi.md#listAcceptedInvites) | **GET** /accepted_invites       | List all accepted invites.             |
| [**listInvites**](DefaultApi.md#listInvites)                 | **GET** /invites                | List all Invites.                      |
| [**listOrganizations**](DefaultApi.md#listOrganizations)     | **GET** /orgs                   | List all Organizations.                |
| [**listUsers**](DefaultApi.md#listUsers)                     | **GET** /users                  | List all Users.                        |
| [**login**](DefaultApi.md#login)                             | **POST** /                      | Log in to service                      |
| [**updateOrganization**](DefaultApi.md#updateOrganization)   | **PATCH** /orgs/{id}            | Update this Organization.              |
| [**updateUser**](DefaultApi.md#updateUser)                   | **PATCH** /users/{id}           | Update this User.                      |

# **acceptInvite**

> void acceptInvite()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileAcceptInviteRequest = {
  // number | Invite code.
  code: 1,
};

nile
  .acceptInvite(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name     | Type         | Description  | Notes                 |
| -------- | ------------ | ------------ | --------------------- |
| **code** | [**number**] | Invite code. | defaults to undefined |

### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description          | Response headers |
| ----------- | -------------------- | ---------------- |
| **204**     | The accepted invite. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **createOrganization**

> void createOrganization(createOrganizationRequest)

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileCreateOrganizationRequest = {
  // CreateOrganizationRequest
  createOrganizationRequest: {
    name: 'name_example',
  },
};

nile
  .createOrganization(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name                          | Type                          | Description | Notes |
| ----------------------------- | ----------------------------- | ----------- | ----- |
| **createOrganizationRequest** | **CreateOrganizationRequest** |             |

### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                 | Response headers |
| ----------- | --------------------------- | ---------------- |
| **200**     | Created a new Organization. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **createUser**

> void createUser(createUserRequest)

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileCreateUserRequest = {
  // CreateUserRequest
  createUserRequest: {
    email: 'email_example',
    password: 'password_example',
  },
};

nile
  .createUser(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name                  | Type                  | Description | Notes |
| --------------------- | --------------------- | ----------- | ----- |
| **createUserRequest** | **CreateUserRequest** |             |

### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Created a new User. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **deleteOrganization**

> void deleteOrganization()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileDeleteOrganizationRequest = {
  // number | Unique identifier.
  id: 1,
};

nile
  .deleteOrganization(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name   | Type         | Description        | Notes                 |
| ------ | ------------ | ------------------ | --------------------- |
| **id** | [**number**] | Unique identifier. | defaults to undefined |

### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                          | Response headers |
| ----------- | ------------------------------------ | ---------------- |
| **204**     | Successful deletion of Organization. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **deleteUser**

> void deleteUser()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileDeleteUserRequest = {
  // number | Unique identifier.
  id: 1,
};

nile
  .deleteUser(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name   | Type         | Description        | Notes                 |
| ------ | ------------ | ------------------ | --------------------- |
| **id** | [**number**] | Unique identifier. | defaults to undefined |

### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                  | Response headers |
| ----------- | ---------------------------- | ---------------- |
| **204**     | Successful deletion of User. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **getAcceptedInvite**

> AcceptedInvite getAcceptedInvite()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileGetAcceptedInviteRequest = {
  // number | Unique identifier.
  id: 1,
};

nile
  .getAcceptedInvite(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name   | Type         | Description        | Notes                 |
| ------ | ------------ | ------------------ | --------------------- |
| **id** | [**number**] | Unique identifier. | defaults to undefined |

### Return type

**AcceptedInvite**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                  | Response headers |
| ----------- | -------------------------------------------- | ---------------- |
| **200**     | The accepted invite with the specified code. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **getInvite**

> Invite getInvite()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileGetInviteRequest = {
  // number | Invite code.
  code: 1,
};

nile
  .getInvite(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name     | Type         | Description  | Notes                 |
| -------- | ------------ | ------------ | --------------------- |
| **code** | [**number**] | Invite code. | defaults to undefined |

### Return type

**Invite**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | The Invite with the requested invite code. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **getOrganization**

> Organization getOrganization()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileGetOrganizationRequest = {
  // number | Unique identifier.
  id: 1,
};

nile
  .getOrganization(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name   | Type         | Description        | Notes                 |
| ------ | ------------ | ------------------ | --------------------- |
| **id** | [**number**] | Unique identifier. | defaults to undefined |

### Return type

**Organization**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | The Organization with the requested ID. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **getUser**

> User getUser()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileGetUserRequest = {
  // number | Unique identifier.
  id: 1,
};

nile
  .getUser(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name   | Type         | Description        | Notes                 |
| ------ | ------------ | ------------------ | --------------------- |
| **id** | [**number**] | Unique identifier. | defaults to undefined |

### Return type

**User**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | The User with the requested ID. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **listAcceptedInvites**

> Array<AcceptedInvite> listAcceptedInvites()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: any = {};

nile
  .listAcceptedInvites(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

This endpoint does not need any parameter.

### Return type

**Array<AcceptedInvite>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description               | Response headers |
| ----------- | ------------------------- | ---------------- |
| **200**     | List of accepted invites. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **listInvites**

> Array<Invite> listInvites()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileListInvitesRequest = {
  // number | Org ID. (optional)
  orgId: 1,
};

nile
  .listInvites(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name      | Type         | Description | Notes                            |
| --------- | ------------ | ----------- | -------------------------------- |
| **orgId** | [**number**] | Org ID.     | (optional) defaults to undefined |

### Return type

**Array<Invite>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description          | Response headers |
| ----------- | -------------------- | ---------------- |
| **200**     | List of all Invites. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **listOrganizations**

> Array<Organization> listOrganizations()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: any = {};

nile
  .listOrganizations(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

This endpoint does not need any parameter.

### Return type

**Array<Organization>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                | Response headers |
| ----------- | -------------------------- | ---------------- |
| **200**     | List of all Organizations. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **listUsers**

> void | Array<User> listUsers()

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileListUsersRequest = {
  // number | Org ID. (optional)
  orgId: 1,
  // string | User email. (optional)
  email: 'email_example',
};

nile
  .listUsers(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name      | Type         | Description | Notes                            |
| --------- | ------------ | ----------- | -------------------------------- |
| **orgId** | [**number**] | Org ID.     | (optional) defaults to undefined |
| **email** | [**string**] | User email. | (optional) defaults to undefined |

### Return type

**void | Array<User>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                   | Response headers |
| ----------- | ----------------------------------------------------------------------------- | ---------------- |
| **200**     | List of all Users in Organization.                                            | -                |
| **204**     | Returns if called unauthenticated, to check for the availability of an email. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **login**

> InlineResponse200 login(loginInfo)

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileLoginRequest = {
  // LoginInfo
  loginInfo: {
    email: 'email_example',
    password: 'password_example',
  },
};

nile
  .login(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name          | Type          | Description | Notes |
| ------------- | ------------- | ----------- | ----- |
| **loginInfo** | **LoginInfo** |             |

### Return type

**InlineResponse200**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Authenticated token | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **updateOrganization**

> Organization updateOrganization(patchOrganizationRequest)

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileUpdateOrganizationRequest = {
  // number | Unique identifier.
  id: 1,
  // PatchOrganizationRequest
  patchOrganizationRequest: {
    name: 'name_example',
  },
};

nile
  .updateOrganization(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name                         | Type                         | Description        | Notes                 |
| ---------------------------- | ---------------------------- | ------------------ | --------------------- |
| **patchOrganizationRequest** | **PatchOrganizationRequest** |                    |
| **id**                       | [**number**]                 | Unique identifier. | defaults to undefined |

### Return type

**Organization**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description               | Response headers |
| ----------- | ------------------------- | ---------------- |
| **200**     | The updated Organization. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **updateUser**

> User updateUser(patchUserRequest)

### Example

```typescript
import Nile from '@theniledev/js';

nile = Nile({ apiUrl: 'http://localhost:8080' });

let body: NileUpdateUserRequest = {
  // number | Unique identifier.
  id: 1,
  // PatchUserRequest
  patchUserRequest: {
    email: 'email_example',
  },
};

nile
  .updateUser(body)
  .then((data: any) => {
    console.log('API called successfully. Returned data: ' + data);
  })
  .catch((error: any) => console.error(error));
```

### Parameters

| Name                 | Type                 | Description        | Notes                 |
| -------------------- | -------------------- | ------------------ | --------------------- |
| **patchUserRequest** | **PatchUserRequest** |                    |
| **id**               | [**number**]         | Unique identifier. | defaults to undefined |

### Return type

**User**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description       | Response headers |
| ----------- | ----------------- | ---------------- |
| **200**     | The updated User. | -                |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)
