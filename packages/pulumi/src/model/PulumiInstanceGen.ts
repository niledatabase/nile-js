import { Instance } from '@theniledev/js';
import { PulumiFn } from '@pulumi/pulumi/automation';

export interface PulumiInstanceGen {
  (instance?: Instance): PulumiFn;
}
