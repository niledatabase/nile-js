// Define a map of event names to value types
type EventMap = {
  [Events.User]: string | null | undefined;
  [Events.Tenant]: string | null | undefined;
  [Events.Token]: string | null | undefined;
  [Events.EvictPool]: string | null | undefined;
  [Events.Headers]: Headers | null | undefined;
};

// Generic EventFn now uses the EventMap
type EventFn<K extends keyof EventMap = keyof EventMap> = (
  params: EventMap[K]
) => void;

enum Events {
  User = 'userId',
  Tenant = 'tenantId',
  Token = 'token',
  EvictPool = 'EvictPool',
  Headers = 'headers',
}

class Eventer<E extends Record<string, unknown>> {
  private events: { [K in keyof E]?: Array<(value: E[K]) => void> } = {};

  publish<K extends keyof E>(eventName: K, value: E[K]) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      for (const callback of callbacks) {
        callback(value);
      }
    }
  }

  subscribe<K extends keyof E>(eventName: K, callback: (value: E[K]) => void) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  unsubscribe<K extends keyof E>(
    eventName: K,
    callback: (value: E[K]) => void
  ) {
    const callbacks = this.events[eventName];
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      delete this.events[eventName];
    }
  }
}

const eventers = new WeakMap<object, Eventer<EventMap>>();

function eventer(owner: object) {
  let events = eventers.get(owner);
  if (!events) {
    events = new Eventer<EventMap>();
    eventers.set(owner, events);
  }
  return events;
}

export const updateTenantId = (
  tenantId: EventMap[Events.Tenant],
  owner: object
) => {
  eventer(owner).publish(Events.Tenant, tenantId);
};
export const watchTenantId = (cb: EventFn<Events.Tenant>, owner: object) =>
  eventer(owner).subscribe(Events.Tenant, cb);

export const updateUserId = (userId: EventMap[Events.User], owner: object) => {
  eventer(owner).publish(Events.User, userId);
};
export const watchUserId = (cb: EventFn<Events.User>, owner: object) =>
  eventer(owner).subscribe(Events.User, cb);

export const updateToken = (token: EventMap[Events.Token], owner: object) => {
  eventer(owner).publish(Events.Token, token);
};

export const evictPool = (val: EventMap[Events.EvictPool], owner: object) => {
  eventer(owner).publish(Events.EvictPool, val);
};
export const watchEvictPool = (cb: EventFn<Events.EvictPool>, owner: object) =>
  eventer(owner).subscribe(Events.EvictPool, cb);

export const updateHeaders = (val: EventMap[Events.Headers], owner: object) => {
  eventer(owner).publish(Events.Headers, val);
};
export const watchHeaders = (cb: EventFn<Events.Headers>, owner: object) =>
  eventer(owner).subscribe(Events.Headers, cb);
