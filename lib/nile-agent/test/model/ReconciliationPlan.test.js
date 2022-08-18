"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ReconciliationPlan_1 = tslib_1.__importDefault(require("../../src/model/ReconciliationPlan"));
describe('ReconciliationPlan', () => {
    function someInstances(ids) {
        return ids.map((id) => {
            return { id, type: 'Thing', properties: {} };
        });
    }
    describe('instantiation', () => {
        it('is empty with empty inputs', () => {
            const plan = new ReconciliationPlan_1.default([], []);
            expect(plan.destructionIds).toEqual([]);
            expect(plan.creationSpecs).toEqual([]);
            expect(plan.creationIds).toEqual([]);
        });
        it('identifies instance ids for destruction', () => {
            const extantIds = ['A', 'B', 'C'];
            const instances = someInstances(['B', 'C', 'D']);
            const plan = new ReconciliationPlan_1.default(instances, extantIds);
            expect(plan.destructionIds).toEqual(['A']);
        });
        it('identifies instances for creation', () => {
            const extantIds = ['A', 'B', 'C'];
            const instances = someInstances(['B', 'C', 'D']);
            const plan = new ReconciliationPlan_1.default(instances, extantIds);
            expect(plan.creationSpecs.length).toEqual(1);
            expect(plan.creationSpecs[0]).toEqual(instances[2]);
            expect(plan.creationIds[0]).toEqual('D');
        });
    });
});
//# sourceMappingURL=ReconciliationPlan.test.js.map