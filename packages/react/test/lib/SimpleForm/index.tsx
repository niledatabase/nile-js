import { getAttributeDefault } from '../../../src/lib/SimpleForm';
import { Attribute, AttributeType } from '../../../src/lib/SimpleForm/types';

describe('simple form', () => {
  it('maps default values for checkbox', () => {
    const attribute: Attribute = {
      name: 'cloud',
      type: AttributeType.Checkbox,
      defaultValue: 'gcp',
    };
    expect(getAttributeDefault(attribute)).toEqual(['gcp']);
  });
  it('maps default values for not a checkbox', () => {
    const attribute: Attribute = {
      name: 'cloud',
      type: AttributeType.Select,
      defaultValue: 'gcp',
    };
    expect(getAttributeDefault(attribute)).toEqual('gcp');
  });
});
