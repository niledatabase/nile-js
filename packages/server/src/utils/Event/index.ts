type BusValues = undefined | null | string;
type EventFn = (params: BusValues) => void;
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
const tenantEvent = new Eventer();
export const updateTenantId = (tenantId: BusValues) => {
  tenantEvent.publish('tenantId', tenantId);
};

export const watchTenantId = (cb: EventFn) =>
  tenantEvent.subscribe('tenantId', cb);
