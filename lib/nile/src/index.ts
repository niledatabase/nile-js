import {
  NileConfig,
  NileSignIn,
  CreateableEntities,
  AuthResponse,
  UpdatableEntities,
  APIResponse,
} from './NileConfig';
import { Requester } from './requester';

const convertToJSON = (res: Response) => {
  if (res.ok === true) {
    try {
      return res.json();
    } catch (e) {
      console.error(e);
    }
  }
  // error of some kind
  return res;
};
class Nile {
  /**
   * @type {string} URI to use for requests
   */
  apiUrl: string;

  /**
   * @type {string} token for authorization
   */
  authToken: string | null;

  /**
   * @type {Requester} class to make requests
   */
  requester: Requester;

  /**
   * Creates a new instance of Nile
   * @param [config] @type {NileConfig}
   */
  constructor(config?: NileConfig) {
    this.apiUrl = config?.apiUrl ?? '/';
    this.authToken = null;
    this.requester = new Requester(this.apiUrl);
  }

  /**
   * TODO this will go away when we have cookies
   */
  setRequesterAuth() {
    if (!this.requester.authToken) {
      this.requester.setToken(this.authToken);
    }
  }

  /**
   *
   * @param payload @type {NileSignIn} sign in payload for a user
   * @returns {Promise<boolean>} auth token for use later
   */
  signIn(payload: NileSignIn): Promise<boolean> {
    return this.create('login', payload).then(res => {
      const { token } = ((res as unknown) as AuthResponse) ?? {};
      if (token) {
        this.authToken = token;
        return true;
      }
      return false;
    });
  }

  /**
   *
   * @param entity @type {CreateableEntities} maps to urls in the api
   * @param payload @type {unknown} the maps to the payload types TODO
   * @returns {Promise<EntityType>} the created entity
   */
  create(entity: CreateableEntities, payload: unknown): Promise<APIResponse> {
    return this.requester.fetch('POST', entity, payload).then(convertToJSON);
  }

  /**
   *
   * @param entity @type {CreateableEntities | UpdatableEntities} maps to the urls in the api
   * @returns {Promise<EntityType>} the created entity
   */
  read(entity: CreateableEntities | UpdatableEntities): Promise<APIResponse> {
    this.setRequesterAuth();
    return this.requester.fetch('GET', entity).then(convertToJSON);
  }

  /**
   *
   * @param entity @type {UpdatableEntities} maps to the urls in the api
   * @param payload @type {unknown} the maps to the payload types TODO
   * @returns {Promise<EntityType>} the updated entity
   */
  update(entity: UpdatableEntities, payload: unknown): Promise<APIResponse> {
    this.setRequesterAuth();
    const { id } = payload as { id: string };
    return this.requester
      .fetch('POST', `${entity}/${String(id)}`, payload)
      .then(convertToJSON);
  }
}

export default Nile;
