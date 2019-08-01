const { mixin } = require('objection');
const BaseModel = require('./baseModel');
const UuidMixin = require('./mixin/uuidMixin');

const slugify = (value) => {
  return value.toLowerCase().split(' ').join('_');
};

module.exports = class Role extends mixin(BaseModel, [UuidMixin()]) {
  static get tableName() {
    return 'role';
  }

  static get relationMappings() {
    return {
      permissions: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: 'permission',
        join: {
          from: 'role.id',
          through: {
            from: 'rolePermission.roleId',
            to: 'rolePermission.permissionId',
          },
          to: 'permission.id',
        },
      },
      users: {
        relate: BaseModel.HasManyRelation,
        modelClass: 'user',
        join: {
          from: 'role.id',
          through: 'user.roleId',
        },
      },
    };
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
        name: {
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9]+)(_[a-zA-Z0-9_]+)*$',
          errorMessage: {
            pattern: 'can only contain alpha numeric characters separated with underscore (_) and cannot begin with number',
          },
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

  $formatJson(value) {
    const superJson = super.$formatJson(value);

    return {
      ...superJson,
      name: superJson.name && slugify(superJson.name),
    };
  }
};
