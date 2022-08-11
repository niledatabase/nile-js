import { EntitiesApi, InstanceEvent } from './generated/openapi/src';

export type TimersType = { [key: number]: ReturnType<typeof setTimeout> };
export type EventListenerOptions = { type: string; seq: number };
export type ListenerCallback = (event: InstanceEvent) => Promise<void>;

export interface EventsApiInterface {
  entities: EntitiesApi;
  timers: TimersType;
  on(
    options: EventListenerOptions,
    listener: ListenerCallback,
    refresh?: number
  ): number;
  cancel(timerId: number): void;
}

/**
 * EventsApi - Interface
 * @export
 * @interface EventsApiInterface
 */
export default class EventsApi implements EventsApiInterface {
  static onCounter = 0;
  entities: EntitiesApi;
  timers: TimersType;

  constructor(entities: EntitiesApi) {
    this.entities = entities;
    this.timers = {};
  }

  /**
   * Listen for Nile events
   * @example
   * ```typescript
   * import Nile from '@theniledev/js';
   * const nile = new Nile({ apiUrl: 'http://localhost:8080', workspace: 'myWorkspace' });
   *
   * const listenerOptions = {
   *   type: 'myEntityType',
   *   seq: 0 // from the beginning of time
   * };
   *
   * nile.events.on(listenerOptions, (instanceEvent) => {
   *   console.log(JSON.stringify(instanceEvent, null, 2));
   * });
   * ```
   */
  on(
    options: EventListenerOptions,
    listener: ListenerCallback,
    refresh = 5000
  ): number {
    const id = EventsApi.onCounter++;
    let seq = options.seq;
    const getEvents = async () => {
      const events = await this.entities.instanceEvents({
        type: options.type,
        seq,
      });
      if (events) {
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          if (event) {
            await listener(event);
            if (seq == null || (event?.after?.seq || seq) > seq) {
              seq = event?.after?.seq || seq;
            }
          }
        }
      }
      const timer = setTimeout(getEvents, refresh);
      this.timers[id] = timer;
    };
    const timer = setTimeout(getEvents, 0);
    this.timers[id] = timer;
    return id;
  }

  /**
   * Remove and cancel a running timer
   * @example
   * ```typescript
   * import Nile from '@theniledev/js';
   * const nile = new Nile({ apiUrl: 'http://localhost:8080', workspace: 'myWorkspace' });
   *
   * const listenerOptions = {
   *   type: 'myEntityType',
   *   seq: 0 // from the beginning of time
   * };
   *
   * const timerId = nile.events.on(listenerOptions, (instanceEvent) => {
   *   console.log(JSON.stringify(instanceEvent, null, 2));
   * });
   * nile.events.cancel(timerId);
   * ```
   */
  cancel(timerId: number): void {
    const timer = this.timers[timerId];
    if (timer) {
      clearTimeout(timer);
      delete this.timers[timerId];
    }
  }
}
