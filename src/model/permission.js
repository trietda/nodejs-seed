const { mixin } = require('objection');
const BaseModel = require('./baseModel');
const UuidMixin = require('./mixin/uuidMixin');

module.exports = class Permission extends mixin(BaseModel, [UuidMixin()]) {
  static get tableName() {
    return 'permission';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
        },
        name: { type: 'string' },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    };
  }

  $formatJson(json) {
    const superJson = super.$formatJson(json);
    return {
      id: superJson.id,
      name: superJson.name,
    };
  }
};
