// A place for common schemas

/**
 *
 * @swagger
 * components:
 *   schemas:
 *     CreateBasicUserRequest:
 *       required:
 *       - email
 *       - password
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         name:
 *           type: string
 *         givenName:
 *           type: string
 *         familyName:
 *           type: string
 *         picture:
 *           type: string
 *         newTenantName:
 *           type: string
 *     AssociateUserRequest:
 *       type: object
 *       required:
 *       - email
 *       properties:
 *         email:
 *           type: string
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         givenName:
 *           type: string
 *         familyName:
 *           type: string
 *         picture:
 *           type: string
 *     CreateTenantRequest:
 *       required:
 *         - name
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         id:
 *           type: string
 *     Tenant:
 *       required:
 *         - id
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         tenants:
 *           uniqueItems: true
 *           type: array
 *           items:
 *             type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         givenName:
 *           type: string
 *         familyName:
 *           type: string
 *         picture:
 *           type: string
 *         created:
 *           type: string
 *           format: date-time
 *         updated:
 *           type: string
 *           format: date-time
 *     TenantUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         givenName:
 *           type: string
 *         familyName:
 *           type: string
 *         picture:
 *           type: string
 *         created:
 *           type: string
 *           format: date-time
 *         updated:
 *           type: string
 *           format: date-time
 *     APIError:
 *       required:
 *         - errorCode
 *         - message
 *         - statusCode
 *       type: object
 *       properties:
 *         errorCode:
 *           type: string
 *           enum:
 *             - internal_error
 *             - bad_request
 *             - unsupported_operation
 *             - entity_not_found
 *             - duplicate_entity
 *             - invalid_credentials
 *             - unknown_oidc_provider
 *             - unknown_oidc_party
 *             - provider_already_exists
 *             - provider_config_error
 *             - provider_mismatch
 *             - provider_update_error
 *             - provider_disabled
 *             - session_state_missing
 *             - session_state_mismatch
 *             - oidc_code_missing
 *             - tenant_not_found
 *             - constraint_violation
 *             - sql_exception
 *             - db_creation_failure
 *             - db_status_failure
 *             - db_initialization_failure
 *             - db_config_missing
 *             - unauthorized_workspace_access
 *             - email_send_failure
 *             - jdbc_exception
 *             - oidc_exception
 *             - region_mismatch
 *             - credential_creation_failure
 *             - credential_propagation_failure
 *         message:
 *           type: string
 *         statusCode:
 *           type: integer
 *           format: int32
 */
