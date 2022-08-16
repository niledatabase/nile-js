import { parseSchema, JSONSchemaType, flattenSchema } from './';

const payload = {
  type: JSONSchemaType.OBJECT,
  $defs: {
    address: {
      $id: '/schemas/address',
      type: 'object',
      $schema: 'http://json-schema.org/draft-07/schema#',
      required: ['street_address', 'city', 'state'],
      properties: {
        city: {
          type: 'string',
        },
        state: {
          $ref: '#/definitions/state',
        },
        street_address: {
          type: 'string',
        },
      },
      definitions: {
        state: {
          enum: ['CA', 'NY', '... etc ...'],
        },
      },
    },
  },
  required: ['first_name', 'last_name'],
  properties: {
    last_name: {
      type: JSONSchemaType.STRING,
    },
    first_name: {
      type: JSONSchemaType.STRING,
    },
    billing_address: {
      $ref: '/schemas/address',
    },
    shipping_address: {
      $ref: '/schemas/address',
    },
  },
};

describe('instance create', () => {
  it('handles just an object', () => {
    expect(parseSchema({ type: JSONSchemaType.OBJECT })).toEqual({ type: {} });
  });
  it('provides defaults for nested schemas', () => {
    expect(parseSchema(payload)).toEqual({
      billing_address: { city: '', state: '', street_address: '' },
      first_name: '',
      last_name: '',
      shipping_address: { city: '', state: '', street_address: '' },
    });
  });

  it('filters for only required fields', () => {
    expect(parseSchema(payload, false, true)).toEqual({
      first_name: '',
      last_name: '',
    });
  });

  it('parses a schema with nested properties, using types', () => {
    const nest = {
      type: JSONSchemaType.OBJECT,
      required: [
        'first_name',
        'last_name',
        'shipping_address',
        'billing_address',
      ],
      properties: {
        last_name: {
          type: JSONSchemaType.STRING,
        },
        first_name: {
          type: JSONSchemaType.STRING,
        },
        billing_address: {
          type: JSONSchemaType.OBJECT,
          required: ['street_address', 'city', 'state'],
          properties: {
            city: {
              type: JSONSchemaType.STRING,
            },
            street_address: {
              type: JSONSchemaType.STRING,
            },
          },
        },
      },
    };
    expect(parseSchema(nest, true)).toEqual({
      billing_address: { city: 'string', street_address: 'string' },
      first_name: 'string',
      last_name: 'string',
    });
  });
  it('parses a regular schema', () => {
    expect(
      parseSchema({
        type: JSONSchemaType.OBJECT,
        schema: {
          name: JSONSchemaType.STRING,
        },
      })
    ).toEqual({
      name: '',
    });
  });

  it('parses an array schema', () => {
    expect(
      parseSchema({
        type: JSONSchemaType.OBJECT,
        properties: {
          applications: {
            type: JSONSchemaType.ARRAY,
            items: {
              type: JSONSchemaType.OBJECT,
              properties: { prop1: { type: JSONSchemaType.STRING } },
            },
          },
        },
      })
    ).toEqual({ applications: [{ prop1: '' }] });
  });
});
describe('flattenSchema', () => {
  const flatSchema = flattenSchema(payload);
  expect(flatSchema).toEqual({
    'billing_address.city': '',
    'billing_address.state': '',
    'billing_address.street_address': '',
    first_name: '',
    last_name: '',
    'shipping_address.city': '',
    'shipping_address.state': '',
    'shipping_address.street_address': '',
  });
});
