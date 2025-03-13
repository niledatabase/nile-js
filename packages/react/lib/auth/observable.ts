import isEqual from 'lodash/isEqual';

import { Listener } from './types';

export function createObservableObject<T = Record<string, unknown>>(
  obj: T,
  listenerKeys = ['loading', 'session'],
  eventName = 'objectChange'
) {
  const eventTarget = new EventTarget();
  const listeners = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: ProxyHandler<any> = {
    set(target, key, value) {
      const prev = target[key];
      target[key] = value;
      if (isEqual(prev, value)) return true;

      // only fire on these two for now
      if (listenerKeys.includes(String(key))) {
        eventTarget.dispatchEvent(
          new CustomEvent(eventName, {
            detail: { key, prev, next: value },
          })
        );
      }
      return true;
    },
  };

  return {
    proxy: new Proxy(obj, handler),
    eventTarget,
    addListener(callback: Listener) {
      if (listeners.has(callback)) {
        return;
      }
      const wrappedCallback = (e: Event) => callback((e as CustomEvent).detail);
      listeners.set(callback, wrappedCallback);

      eventTarget.addEventListener(eventName, wrappedCallback);
    },
    removeListener(callback: Listener) {
      const wrappedCallback = listeners.get(callback);
      if (wrappedCallback) {
        eventTarget.removeEventListener(eventName, wrappedCallback);
        listeners.delete(callback);
      }
    },
  };
}
