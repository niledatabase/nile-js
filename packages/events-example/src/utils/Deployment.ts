import { Instance } from '@theniledev/js';

export interface Deployment {
  identifyRemoteObjects(): Promise<string[]>;
  destroyObject(id: string): Promise<boolean>;
  createObject(spec: Instance): Promise<boolean>;
}
