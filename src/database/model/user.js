const bcrypt = require('bcrypt');
const { mixin } = require('objection');
const BaseModel = require('./baseModel');
const UuidMixin = require('./mixin/uuidMixin');

module.exports = class User extends mixin(BaseModel, [UuidMixin()]) {
  static get status() {
    return {
      active: 'active',
      disabled: 'disabled',
      archived: 'archived',
    };
  }

  static get tableName() {
    return 'user';
  }

  static get jsonAttributes() {
    return [];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'username', 'password'],
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
        },
        email: {
          type: 'string',
          format: 'email',
          errorMessage: {
            format: 'should be a valid email',
          },
        },
        username: {
          type: 'string',
          minLength: 5,
        },
        password: {
          type: 'string',
          minLength: 6,
        },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        roleId: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
        },
        status: {
          type: 'string',
          enum: Object.values(User.status),
        },
        lastLogin: {
          type: 'string',
          format: 'date-time',
        },
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
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'role',
        join: {
          from: 'user.roleId',
          to: 'role.id',
        },
      },
    };
  }

  $formatJson(json) {
    const superJson = super.$formatJson(json);

    const result = { ...superJson };

    delete result.password;

    return result;
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    await this.hashPassword();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    if (this.password) {
      await this.hashPassword();
    }
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
};
