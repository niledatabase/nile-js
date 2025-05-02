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

const eventer = new Eventer<EventMap>();

export const updateTenantId = (tenantId: EventMap[Events.Tenant]) => {
  eventer.publish(Events.Tenant, tenantId);
};
export const watchTenantId = (cb: EventFn<Events.Tenant>) =>
  eventer.subscribe(Events.Tenant, cb);

export const updateUserId = (userId: EventMap[Events.User]) => {
  eventer.publish(Events.User, userId);
};
export const watchUserId = (cb: EventFn<Events.User>) =>
  eventer.subscribe(Events.User, cb);

export const updateToken = (token: EventMap[Events.Token]) => {
  eventer.publish(Events.Token, token);
};

export const evictPool = (val: EventMap[Events.EvictPool]) => {
  eventer.publish(Events.EvictPool, val);
};
export const watchEvictPool = (cb: EventFn<Events.EvictPool>) =>
  eventer.subscribe(Events.EvictPool, cb);

export const updateHeaders = (val: EventMap[Events.Headers]) => {
  eventer.publish(Events.Headers, val);
};
export const watchHeaders = (cb: EventFn<Events.Headers>) =>
  eventer.subscribe(Events.Headers, cb);
