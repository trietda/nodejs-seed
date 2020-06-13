const { v4: Uuid } = require('uuid');

module.exports = ({ idField = 'id' } = {}) => function UuidMixin(Model) {
  return class extends Model {
    $parseJson(json, opt) {
      const superJson = super.$parseJson(json, opt);

      let id;
      if (opt.patch) {
        id = superJson[idField] || (opt.old && opt.old[idField]);
      } else {
        id = superJson[idField] || Uuid();
      }

      return {
        ...superJson,
        [idField]: id,
      };
    }
  };
};
