module.exports = (itemSchema, hasCount = false) => {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      results: {
        type: 'array',
        items: itemSchema,
      },
    },
  };

  if (hasCount) {
    schema.properties.total = { type: 'number' };
  }

  return schema;
};
