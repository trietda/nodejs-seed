const { AjvValidator } = require('objection');
const ajvErrors = require('ajv-errors');
const { Model, mixin } = require('objection');
const { format, parseISO } = require('date-fns');
const { DBErrors } = require('objection-db-errors');

module.exports = class BaseModel extends mixin(Model, [DBErrors]) {
  static get modelPaths() {
    return [__dirname];
  }

  static createValidator() {
    return new AjvValidator({
      onCreateAjv(ajv) {
        ajvErrors(ajv);
      },
      options: {
        jsonPointers: true,
      },
    });
  }

  static createNotFoundError(queryContext) {
    return new this.NotFoundError({
      ...queryContext,
      tableName: this.tableName,
    });
  }

  static pickJsonSchemaProperties() {
    return true;
  }

  $formatDatabaseJson(json) {
    const superJson = super.$formatDatabaseJson(json);

    Object.entries(this.constructor.jsonSchema.properties)
      .forEach(([name, prop]) => {
        if (prop.format === 'date-time') {
          const date = superJson[name] instanceof Date
            ? superJson[name]
            : parseISO(superJson[name]);
          superJson[name] = superJson[name] && format(date, 'yyyy-MM-dd HH:mm:ss');
        }
      });

    return superJson;
  }

  $beforeValidate(jsonSchema, json, opt) {
    super.$beforeValidate(jsonSchema, json, opt);

    Object.entries(this.constructor.jsonSchema.properties)
      .forEach(([name, prop]) => {
        if (prop.format === 'date-time') {
          // eslint-disable-next-line no-param-reassign
          json[name] = json[name] && (json[name] instanceof Date
            ? json[name].toISOString()
            : json[name]);
        }
      });

    return jsonSchema;
  }

  $afterValidate(json, opt) {
    super.$afterValidate(json, opt);

    Object.entries(this.constructor.jsonSchema.properties)
      .forEach(([name, prop]) => {
        if (prop.format === 'date-time') {
          // eslint-disable-next-line no-param-reassign
          json[name] = json[name] && new Date(json[name]);
        }
      });
  }

  async $beforeInsert(queryContext) {
    super.$beforeInsert(queryContext);

    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.updatedAt) {
      this.updatedAt = new Date();
    }
  }

  async $beforeUpdate(queryContext) {
    super.$beforeUpdate(queryContext);

    this.updatedAt = new Date();
  }
};
