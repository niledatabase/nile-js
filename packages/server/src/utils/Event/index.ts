type BusValues = undefined | null | string;
type EventFn = (params: BusValues) => void;
enum Events {
  User = 'userId',
  Tenant = 'tenantId',
  Token = 'token',
  EvictPool = 'EvictPool',
}
class Eventer {
  private events: { [key: string]: EventFn[] } = {};

  // Publish event and notify all subscribers
  publish(eventName: string, value: BusValues) {
    const callbackList = this.events[eventName];
    if (callbackList) {
      for (const callback of callbackList) {
        callback(value);
      }
    }
  }

  // Subscribe to events
  subscribe(eventName: string, callback: EventFn) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // Unsubscribe from an event
  unsubscribe(eventName: string, callback: EventFn) {
    const callbackList = this.events[eventName];

    if (!callbackList) {
      return; // Early exit if no event exists
    }

    const index = callbackList.indexOf(callback);
    if (index !== -1) {
      callbackList.splice(index, 1); // Remove the callback
    }

    // If there are no more listeners, clean up the event
    if (callbackList.length === 0) {
      delete this.events[eventName];
    }
  }
}

// tenantId manager
const eventer = new Eventer();

export const updateTenantId = (tenantId: BusValues) => {
  eventer.publish(Events.Tenant, tenantId);
};

export const watchTenantId = (cb: EventFn) =>
  eventer.subscribe(Events.Tenant, cb);

export const updateUserId = (userId: BusValues) => {
  eventer.publish(Events.User, userId);
};

export const watchUserId = (cb: EventFn) => eventer.subscribe(Events.User, cb);

export const updateToken = (val: BusValues) => {
  eventer.publish(Events.Token, val);
};

export const watchToken = (cb: EventFn) => eventer.subscribe(Events.Token, cb);

export const watchEvictPool = (cb: EventFn) =>
  eventer.subscribe(Events.EvictPool, cb);

export const evictPool = (val: BusValues) => {
  eventer.publish(Events.EvictPool, val);
};
