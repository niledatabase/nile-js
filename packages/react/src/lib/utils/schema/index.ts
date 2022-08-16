export enum JSONSchemaType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  NULL = 'null',
}

const setSchemaType = (
  type: JSONSchemaType | undefined,
  returnType: boolean
) => {
  switch (type) {
    case JSONSchemaType.STRING:
      return returnType ? JSONSchemaType.STRING : '';
    case JSONSchemaType.NUMBER:
    case JSONSchemaType.INTEGER:
      return returnType ? JSONSchemaType.NUMBER : 0;
    case JSONSchemaType.BOOLEAN:
      return returnType ? JSONSchemaType.BOOLEAN : true;
    case JSONSchemaType.NULL:
      return returnType ? JSONSchemaType.NULL : null;
    case JSONSchemaType.OBJECT:
      return returnType ? JSONSchemaType.OBJECT : {};
    case JSONSchemaType.ARRAY:
      return returnType ? JSONSchemaType.ARRAY : [];
    default:
      return null;
  }
};

type SchemaProperties = {
  [key: string]: {
    type?: JSONSchemaType;
    $ref?: string;
    properties?: SchemaProperties;
  };
};
export type JSONSchema = {
  properties?: {
    [key: string]: {
      type?: JSONSchemaType;
      $ref?: string;
      properties?: SchemaProperties;
      items?: { type: JSONSchemaType; properties: SchemaProperties };
    };
  };
  schema?: {
    [key: string]: JSONSchemaType;
  };
  $defs?: { [s: string]: unknown };
  type?: JSONSchemaType;
  required?: string[];
};

export type ParsedSchema = { [key: string]: JSONSchemaType | JSONSchemaType[] };

export const parseSchema = (
  schema: JSONSchema,
  returnType = false,
  onlyRequired = false
): ParsedSchema => {
  if (schema.schema) {
    return Object.keys(schema.schema).reduce((accum: ParsedSchema, key) => {
      const type = schema.schema && schema.schema[key];
      accum[key] = setSchemaType(type, returnType) as JSONSchemaType;
      return accum;
    }, {});
  }
  if (schema && schema.properties) {
    return Object.keys(schema.properties).reduce((accum: ParsedSchema, key) => {
      const property =
        (schema && schema.properties && schema.properties[key]) ?? {};

      if (onlyRequired) {
        if (!schema.required?.includes(key)) {
          return accum;
        }
      }
      const { type, $ref, items } = property;
      if (type === JSONSchemaType.OBJECT) {
        const parsed = parseSchema(property, returnType);
        accum[key] = parsed as unknown as JSONSchemaType;
      } else if (type === JSONSchemaType.ARRAY) {
        if (items) {
          const arrayItems = parseSchema(items, returnType);
          if (arrayItems) {
            accum[key] = [arrayItems as unknown as JSONSchemaType];
          } else {
            if (property.items) {
              const { type } = property.items;
              accum[key] = [setSchemaType(type, returnType) as JSONSchemaType];
            }
          }
        }
      } else {
        accum[key] = setSchemaType(type, returnType) as JSONSchemaType;
        if ($ref) {
          if ($ref.startsWith('#')) {
            accum[key] = '' as JSONSchemaType;
          } else if ($ref.startsWith('/schemas')) {
            const def =
              schema.$defs &&
              Object.values(schema.$defs).find((value) => {
                const val = value as { [key: string]: unknown };
                if (val) {
                  return val?.$id === $ref || val?.id === $ref;
                }
                return null;
              });
            const parsed = parseSchema(def as JSONSchema, returnType);
            accum[key] = parsed as unknown as JSONSchemaType;
          }
        }
      }
      return accum;
    }, {});
  }
  return { type: setSchemaType(schema.type, returnType) as JSONSchemaType };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flatten = (obj: any, ignoreArrays: boolean) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function recurse(cur: any, prop: any) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      if (ignoreArrays) {
        result[prop] = cur;
      } else {
        let i = 0;
        const l = cur.length;
        for (; i < l; i++) recurse(cur[i], prop ? prop + '.' + i : '' + i);
        if (l == 0) result[prop] = [];
      }
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty) result[prop] = {};
    }
  }
  recurse(obj, '');
  return result;
};

export const flattenSchema = (schema: JSONSchema, ignoreArrays = false) => {
  const baseSchema = parseSchema(schema);
  return flatten(baseSchema, ignoreArrays);
};
