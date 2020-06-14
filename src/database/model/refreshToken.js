const { v4: Uuid } = require('uuid');
const { Model } = require('objection');
const BaseModel = require('./baseModel');

module.exports = class RefreshToken extends BaseModel {
  static get tableName() {
    return 'refreshToken';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
        },
        token: { type: 'string' },
        userId: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
        },
        metadata: { type: 'object' },
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

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'User',
        join: {
          from: 'refreshToken.userId',
          to: 'user.id',
        },
      },
    };
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);

    this.id = Uuid();
    this.token = Uuid();
  }
};
