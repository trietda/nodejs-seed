const BaseModel = require('./baseModel');

module.exports = class BlacklistToken extends BaseModel {
  static get tableName() {
    return 'blacklist_token';
  }

  static get idColumn() {
    return 'tokenId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        tokenId: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
        },
      },
    };
  }
};
