type BusValues = undefined | null | string;
type EventFn = (params: BusValues) => void;
enum Events {
  User = 'userId',
  Tenant = 'tenantId',
  Token = 'token',
  EvictPool = 'EvictPool',
}
class Eventer {
  events: { [key: string]: EventFn[] };
  constructor() {
    this.events = {};
  }
  publish(eventName: string, value: BusValues) {
    // Get all the callback functions of the current event
    const callbackList = this.events[eventName];

    // execute each callback function
    if (callbackList) {
      for (const callback of callbackList) {
        callback(value);
      }
    }
  }
  // Subscribe to events
  subscribe(eventName: string, callback: EventFn) {
    // initialize this event
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    // store the callback function of the subscriber
    this.events[eventName].push(callback);
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
