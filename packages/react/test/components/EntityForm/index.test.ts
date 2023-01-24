import { processFormData } from '../../../src/components/EntityForm/EntityForm';
import { Attribute, AttributeType } from '../../../src/lib/SimpleForm/types';

describe('instance table', () => {
  let fields: Attribute[];
  beforeEach(() => {
    fields = [
      { name: 'dbName' },
      { name: 'precision', type: AttributeType.Float },
      {
        name: 'cloud',
        type: AttributeType.Checkbox,
        options: [
          { label: 'Amazon', value: 'aws' },
          { label: 'Google', value: 'gcp' },
          { label: 'Microsoft', value: 'azure' },
        ],
      },
      {
        name: 'environment',
        type: AttributeType.Select,
        options: [
          { label: 'Test', value: 'test' },
          { label: 'Development', value: 'dev' },
          { label: 'Production', value: 'prod' },
        ],
      },
      {
        name: 'size',
        type: AttributeType.Number,
      },
    ];
  });

  it('converts the data based on the provided fields', () => {
    const data = {
      dbName: 'some name',
      cloud: 'aws',
      environment: 'test',
      size: '43',
      precision: '4.43',
    };
    const formData = processFormData(data, fields);
    expect(formData).toEqual({
      cloud: 'aws',
      dbName: 'some name',
      environment: 'test',
      size: 43,
      precision: 4.43,
    });
  });

  it('converts works with enums', () => {
    const data = {
      dbName: 'some name',
      cloud: ['aws', 'gcp', 'azure'],
      environment: 'test',
      size: '43',
      precision: '4.43',
    };
    const formData = processFormData(data, fields);
    expect(formData).toEqual({
      cloud: ['aws', 'gcp', 'azure'],
      dbName: 'some name',
      environment: 'test',
      size: 43,
      precision: 4.43,
    });
  });
});
