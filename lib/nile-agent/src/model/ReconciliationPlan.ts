import { Instance } from '@theniledev/js';

export class ReconciliationPlan {
  readonly creationSpecs!: Instance[];
  readonly destructionIds!: string[];

  get creationIds(): string[] {
    return this.creationSpecs.map((i: Instance) => i.id);
  }

  constructor(instances: Instance[], extantIds: string[]) {
    const instanceIds = instances.map((i) => i.id);
    this.destructionIds = extantIds.filter(
      (id: string) =>
        id !== null && id !== undefined && !instanceIds.includes(id)
    );
    this.creationSpecs = Object.values(instances).filter(
      (i: Instance) =>
        i.id !== null && i.id !== undefined && !extantIds.includes(i.id)
    );
  }
}
