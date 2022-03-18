import { NileConfig, NileSignIn, EntityType, AuthResponse } from './NileConfig';
import { Requester } from './requester';

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
   * @param entity @type {EntityType} maps to urls in the api
   * @param payload @type {any} the maps to the payload types TODO
   * @returns {Promise<EntityType>} the created entity
   */
  create(entity: EntityType, payload: unknown): Promise<JSON> {
    return this.requester
      .fetch('POST', entity, payload)
      .then((res: Response) => {
        return res.json();
      });
  }

  /**
   *
   * @param entity maps to the urls in the api
   * @returns {Promise<EntityType>} the created entity
   */
  read(entity: EntityType): Promise<JSON> {
    this.requester.setToken(this.authToken);
    return this.requester.fetch('GET', entity).then((res: Response) => {
      return res.json();
    });
  }
}

export default Nile;
