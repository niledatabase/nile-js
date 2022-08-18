import { Instance } from '@theniledev/js';

import { ReconciliationPlan } from '../../src';

describe('ReconciliationPlan', () => {
  function someInstances(ids: string[]): Instance[] {
    return ids.map((id: string) => {
      return { id, type: 'Thing', properties: {} };
    });
  }

  describe('instantiation', () => {
    it('is empty with empty inputs', () => {
      const plan = new ReconciliationPlan([], []);
      expect(plan.destructionIds).toEqual([]);
      expect(plan.creationSpecs).toEqual([]);
      expect(plan.creationIds).toEqual([]);
    });

    it('identifies instance ids for destruction', () => {
      const extantIds = ['A', 'B', 'C'];
      const instances = someInstances(['B', 'C', 'D']);
      const plan = new ReconciliationPlan(instances, extantIds);
      expect(plan.destructionIds).toEqual(['A']);
    });

    it('identifies instances for creation', () => {
      const extantIds = ['A', 'B', 'C'];
      const instances = someInstances(['B', 'C', 'D']);
      const plan = new ReconciliationPlan(instances, extantIds);
      expect(plan.creationSpecs.length).toEqual(1);
      expect(plan.creationSpecs[0]).toEqual(instances[2]);
      expect(plan.creationIds[0]).toEqual('D');
    });
  });
});
