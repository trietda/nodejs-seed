const roleSchema = require('./role');

module.exports = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    username: { type: 'string' },
    firstName: { type: ['string', 'null'] },
    lastName: { type: ['string', 'null'] },
    email: { type: 'string' },
    status: { type: 'string' },
    lastLogin: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    role: roleSchema,
  },
};
