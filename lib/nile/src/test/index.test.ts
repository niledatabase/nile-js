/* eslint-disable @typescript-eslint/ban-ts-comment */
import Nile from '../index';
import { Requester } from '../requester';
import { NileSignIn } from '../types';

const userPayload = {
  id: 4,
  email: 'bob@squarepants.com',
};
// const strUserPayload = JSON.stringify(userPayload);

jest.mock('../requester');

describe('index', () => {
  it('has the correct number of properties', () => {
    expect(Object.getOwnPropertyNames(Nile.prototype)).toEqual([
      'constructor',
      'setRequesterAuth',
      'signIn',
      'create',
      'read',
      'update',
      'remove',
    ]);
  });

  describe('sign in ', () => {
    let payload: NileSignIn;
    beforeEach(() => {
      payload = { email: userPayload.email, password: 'super secret' };
    });

    it('works', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb({ token: 'password123' });
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();
      const worked = await nile.signIn(payload);
      // expect(nile.authToken).not.toBeNull();
      expect(worked).toEqual(true);
    });

    it('does not work', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: () => void) => {
                      return cb();
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();

      const worked = await nile.signIn(payload);
      expect(worked).toEqual(false);
    });

    it('throws an error', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              throw new Error('No, this is patrick');
            },
          };
        });
      const nile = Nile();
      expect(() => nile.signIn(payload)).toThrow();
    });
  });

  describe('create', () => {
    it('works', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb(userPayload);
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();

      expect(await nile.create('users', userPayload)).toEqual(userPayload);
    });

    it('throws an error', () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              throw new Error('No, this is patrick');
            },
          };
        });
      const nile = Nile();
      expect(() => nile.create('users', userPayload)).toThrow();
    });
  });

  describe('read', () => {
    it('works with a string', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            setToken: jest.fn(),
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb(userPayload);
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();
      expect(await nile.read('user/4')).toEqual(userPayload);
    });

    it('works with params', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            setToken: jest.fn(),
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb(userPayload);
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();
      expect(await nile.read('user', 4)).toEqual(userPayload);
    });

    it('throws an error', () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              throw new Error('No, this is patrick');
            },
          };
        });
      const nile = Nile();
      expect(() => nile.read('users')).toThrow();
    });
  });

  describe('update', () => {
    it('works with an object', async () => {
      const updatedPayload = {
        ...userPayload,
        email: 'squidward@geocities.com',
      };
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            setToken: jest.fn(),
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb(updatedPayload);
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();
      expect(await nile.update('user', updatedPayload)).toEqual(updatedPayload);
    });

    it('throws an error', () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              throw new Error('No, this is patrick');
            },
          };
        });
      const nile = Nile();
      expect(() => nile.update('user', userPayload)).toThrow();
    });
  });

  describe('delete', () => {
    it('works with an object', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            setToken: jest.fn(),
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb(userPayload);
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();
      expect(await nile.remove('user', userPayload)).toEqual(userPayload);
    });

    it('works with a string', async () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            setToken: jest.fn(),
            fetch: () => {
              return {
                then: () => {
                  return {
                    then: (cb: (args: unknown) => void) => {
                      return cb(userPayload);
                    },
                  };
                },
              };
            },
          };
        });
      const nile = Nile();
      expect(await nile.remove('user', 4)).toEqual(userPayload);
    });

    it('throws an error', () => {
      Requester
        // @ts-expect-error
        .mockImplementation(() => {
          return {
            fetch: () => {
              throw new Error('No, this is patrick');
            },
          };
        });
      const nile = Nile();
      expect(() => nile.remove('user', 4)).toThrow();
    });
  });
});
