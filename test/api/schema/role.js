const permissionSchema = require('./permission');

module.exports = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    permissions: {
      type: 'array',
      items: permissionSchema,
    },
  },
};
