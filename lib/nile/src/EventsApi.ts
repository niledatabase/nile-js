import { EntitiesApi, InstanceEvent } from './generated/openapi/src';

export class EventsApi {
  static onCounter = 0;
  entities: EntitiesApi;
  timers: { [key: number]: ReturnType<typeof setTimeout> };

  constructor(entities: EntitiesApi) {
    this.entities = entities;
    this.timers = {};
  }

  on(
    options: { type: string; seq: number },
    listener: (event: InstanceEvent) => Promise<void>,
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

  cancel(id: number): void {
    const timer = this.timers[id];
    if (timer) {
      clearTimeout(timer);
      delete this.timers[id];
    }
  }
}
