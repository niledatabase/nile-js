import { Configuration } from './generated/openapi/configuration';
import { CreateOrganizationRequest } from './generated/openapi/models/CreateOrganizationRequest';
import { CreateUserRequest } from './generated/openapi/models/CreateUserRequest';
import { Invite } from './generated/openapi/models/Invite';
import { LoginInfo } from './generated/openapi/models/LoginInfo';
import { Organization } from './generated/openapi/models/Organization';
import { PatchOrganizationRequest } from './generated/openapi/models/PatchOrganizationRequest';
import { PatchUserRequest } from './generated/openapi/models/PatchUserRequest';
import { User } from './generated/openapi/models/User';
import { PromiseDefaultApi } from './generated/openapi/types/PromiseAPI';
import { ObservableDefaultApi } from './generated/openapi/types/ObservableAPI';
import {
  DefaultApiRequestFactory,
  DefaultApiResponseProcessor,
} from './generated/openapi/apis/DefaultApi';
import { RequestContext } from './generated/openapi/http/http';
import { AuthMethods } from './generated/openapi/auth/auth';
import { Token } from './generated/openapi/models/Token';

export default class NileApi
  extends PromiseDefaultApi
  implements PromiseDefaultApi
{
  private _api: ObservableDefaultApi;
  private _config: Configuration;
  authToken: string;
  public constructor(
    configuration: Configuration,
    requestFactory?: DefaultApiRequestFactory,
    responseProcessor?: DefaultApiResponseProcessor
  ) {
    super(configuration, requestFactory, responseProcessor);
    this._api = new ObservableDefaultApi(
      configuration,
      requestFactory,
      responseProcessor
    );
    this._config = configuration;
    this.authToken = '';
  }

  private applyOptions(_options?: Configuration) {
    const authentication: AuthMethods = {
      default: {
        getName: (): string => 'Bearer Authentication',
        applySecurityAuthentication: (requestContext: RequestContext): void => {
          requestContext.setHeaderParam(
            'Authorization',
            `Bearer ${this.authToken}`
          );
        },
      },
    };
    return { ..._options, ...this._config, authMethods: authentication };
  }

  /**
   * Accept an invite.
   * @param code Invite code.
   */
  public acceptInvite(code: number, _options?: Configuration): Promise<void> {
    const result = this._api.acceptInvite(code, this.applyOptions(_options));
    return result.toPromise();
  }

  /**
   * Create a new Organization.
   * @param createOrganizationRequest
   */
  public createOrganization(
    createOrganizationRequest: CreateOrganizationRequest,
    _options?: Configuration
  ): Promise<void> {
    const result = this._api.createOrganization(
      createOrganizationRequest,
      this.applyOptions(_options)
    );
    return result.toPromise();
  }

  /**
   * Create a new User.
   * @param createUserRequest
   */
  public createUser(
    createUserRequest: CreateUserRequest,
    _options?: Configuration
  ): Promise<void> {
    const result = this._api.createUser(
      createUserRequest,
      this.applyOptions(_options)
    );
    return result.toPromise();
  }

  /**
   * Delete this Organization.
   * @param id Unique identifier.
   */
  public deleteOrganization(
    id: number,
    _options?: Configuration
  ): Promise<void> {
    const result = this._api.deleteOrganization(
      id,
      this.applyOptions(_options)
    );
    return result.toPromise();
  }

  /**
   * Delete this User.
   * @param id Unique identifier.
   */
  public deleteUser(id: number, _options?: Configuration): Promise<void> {
    const result = this._api.deleteUser(id, this.applyOptions(_options));
    return result.toPromise();
  }

  /**
   * Get information for this Organization.
   * @param id Unique identifier.
   */
  public getOrganization(
    id: number,
    _options?: Configuration
  ): Promise<Organization> {
    const result = this._api.getOrganization(id, this.applyOptions(_options));
    return result.toPromise();
  }

  /**
   * Get information for this User.
   * @param id Unique identifier.
   */
  public getUser(id: number, _options?: Configuration): Promise<User> {
    const result = this._api.getUser(id, this.applyOptions(_options));
    return result.toPromise();
  }
  /**
   * List all Invites.
   * @param orgId Org ID.
   */

  public listInvites(
    orgId?: number,
    _options?: Configuration
  ): Promise<Invite[]> {
    const result = this._api.listInvites(orgId, this.applyOptions(_options));
    return result.toPromise();
  }

  /**
   * List all Organizations.
   */
  public listOrganizations(_options?: Configuration): Promise<Organization[]> {
    const result = this._api.listOrganizations(this.applyOptions(_options));
    return result.toPromise();
  }

  /**
   * List all Users.
   * @param orgId Org ID.
   * @param email User email.
   */
  public listUsers(
    orgId?: number,
    email?: string,
    _options?: Configuration
  ): Promise<void | User[]> {
    const result = this._api.listUsers(
      orgId,
      email,
      this.applyOptions(_options)
    );
    return result.toPromise();
  }

  /**
   * Log in to service
   * Saves an auth token for later calls
   * @param loginInfo
   */
  public async login(
    loginInfo: LoginInfo,
    _options?: Configuration
  ): Promise<Token> {
    const result = this._api.login(loginInfo, this.applyOptions(_options));
    const res = await result.toPromise();
    const { token } = (res as unknown as { token: string }) ?? {};
    if (token) {
      this.authToken = token;
    }
    return res;
  }

  /**
   * Update this Organization.
   * @param id Unique identifier.
   * @param patchOrganizationRequest
   */
  public updateOrganization(
    id: number,
    patchOrganizationRequest: PatchOrganizationRequest,
    _options?: Configuration
  ): Promise<Organization> {
    const result = this._api.updateOrganization(
      id,
      patchOrganizationRequest,
      this.applyOptions(_options)
    );
    return result.toPromise();
  }

  /**
   * Update this User.
   * @param id Unique identifier.
   * @param patchUserRequest
   */
  public updateUser(
    id: number,
    patchUserRequest: PatchUserRequest,
    _options?: Configuration
  ): Promise<User> {
    const result = this._api.updateUser(
      id,
      patchUserRequest,
      this.applyOptions(_options)
    );
    return result.toPromise();
  }

  /**
   * Validate a token
   * @param token
   */
  public validate(token: Token, _options?: Configuration): Promise<void> {
    const result = this._api.validate(token, this.applyOptions(_options));
    return result.toPromise();
  }
}
