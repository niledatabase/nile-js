import { Instance } from '@theniledev/js';
import { StackSummary } from '@pulumi/pulumi/automation';

export class ReconciliationPlan {
  readonly creationSpecs!: Instance[];
  readonly destructionIds!: string[];

  get creationIds(): string[] {
    return this.creationSpecs.map((i: Instance) => i.id);
  }

  constructor(
    instances: { [key: string]: Instance },
    stacks: { [key: string]: StackSummary }
  ) {
    this.destructionIds = Object.keys(stacks).filter(
      (id: string) => id !== null && id !== undefined && !instances[id]
    );
    this.creationSpecs = Object.values(instances).filter(
      (i: Instance) => i.id !== null && i.id !== undefined && !stacks[i.id]
    );
  }
}
