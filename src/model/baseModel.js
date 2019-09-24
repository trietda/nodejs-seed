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

  $parseDatabaseJson(json) {
    const superJson = super.$parseDatabaseJson(json);

    Object.entries(this.constructor.jsonSchema.properties)
      .forEach((name, prop) => {
        if (prop.format === 'date-time') {
          superJson[name] = superJson[name] && new Date(superJson[name]);
        }
      });

    return json;
  }

  $formatDatabaseJson(json) {
    const superJson = super.$formatDatabaseJson(json);

    Object.entries(this.constructor.jsonSchema.properties)
      .forEach(([name, prop]) => {
        if (prop.format === 'date-time') {
          const date = parseISO(superJson[name]);
          superJson[name] = superJson[name] && format(date, 'yyyy-MM-dd HH:mm:ss');
        }
      });

    return json;
  }

  $parseJson(json, opt) {
    const superJson = super.$parseJson(json, opt);

    delete superJson.createdAt;
    delete superJson.updatedAt;

    return superJson;
  }

  $beforeValidate(jsonSchema, json, opt) {
    super.$beforeValidate(jsonSchema, json, opt);

    Object.entries(this.constructor.jsonSchema.properties)
      .forEach(([name, prop]) => {
        if (prop.format === 'date-time') {
          json[name] = json[name] && json[name].toISOString();
        }
      });

    return jsonSchema;
  }

  async $beforeInsert(queryContext) {
    super.$beforeInsert(queryContext);

    this.createdAt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.updatedAt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  async $beforeUpdate(queryContext) {
    super.$beforeUpdate(queryContext);

    this.updatedAt = format(new Date(), 'yyyy-MM-MM HH:mm:ss');
  }
};
