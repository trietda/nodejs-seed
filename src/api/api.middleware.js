const multer = require('multer');
const { ValidationError: ModelValidationError, NotFoundError } = require('objection');
const camelcase = require('camelcase');
const { UniqueViolationError, ForeignKeyViolationError } = require('objection-db-errors');
const {
  AuthenticationError, AuthorizationError, HttpError, ValidationError,
} = require('../error');
const { validate } = require('./api.service');

const CONSTRAINT_REGEX = /^([a-z]+)_(.+)_([a-z]+)$/;

const parseTableInitial = (initial) => {
  switch (initial) {
    case 'u':
      return 'user';
    case 'r':
      return 'role';
    case 'rp':
      return 'rolePermission';
    default: {
      logger.warn(`Invalid table initial. Table initial: ${initial}`);
      return initial;
    }
  }
};

const parseForeignKeyColumn = (rawColumnName) => {
  const referredColumn = rawColumnName.replace('_id', '');

  return [camelcase(referredColumn)];
};

const parseNormalColumnName = rawColumnName => [camelcase(rawColumnName)];

const parseUniqueCompoundColumnName = (rawColumnName) => {
  switch (rawColumnName) {
    case 'token_user_id':
      return ['token, user.id'];
    default:
      logger.warn(`Unrecognized compound unique constraint ${rawColumnName}`);
      return [];
  }
};

const parseColumnName = (rawColumnName, rawConstraintName) => {
  switch (rawConstraintName) {
    case 'fk':
      return parseForeignKeyColumn(rawColumnName);
    case 'uqc':
      return parseUniqueCompoundColumnName(rawColumnName);
    case 'uq':
    // fall through
    default:
      return parseNormalColumnName(rawColumnName);
  }
};

const parseConstraint = (constraint) => {
  const regexResult = CONSTRAINT_REGEX.exec(constraint);

  if (!regexResult) {
    logger.warn(`Invalid unique constraint name. Constraint: ${constraint}`);
    return {};
  }

  return {
    table: parseTableInitial(regexResult[1]),
    columns: parseColumnName(regexResult[2], regexResult[3]),
  };
};

const parseConstraintError = (err) => {
  if (err.client !== 'mysql') {
    return {
      constraint: err.constraint,
      column: [err.column],
      table: err.table,
    };
  }

  const { columns, table } = parseConstraint(err.constraint);

  return {
    columns,
    table,
    constraint: err.constraint,
  };
};

const makeReadableColumns = (columns) => {
  if (columns.length > 1) {
    return `combination of ${columns.slice(0, -1).join(',')}, and ${columns.slice(-1)}`;
  }
  return columns[0];
};

const upload = multer({});

module.exports = {
  upload,

  handleValidationError(err, req, res, next) {
    if (!(err instanceof ValidationError)) {
      next(err);
      return;
    }

    res.status(400).json({
      message: 'One or more inputs are invalid',
      detail: err.detail,
    });
  },

  handleModelValidationError(err, req, res, next) {
    if (!(err instanceof ModelValidationError)) {
      next(err);
      return;
    }

    const errorDetail = Object.entries(err.data).reduce((prev, [key, errors]) => ({
      ...prev,
      [key]: errors[0].message,
    }), {});

    res.status(400).json({
      message: 'One or more inputs are invalid',
      detail: errorDetail,
    });
  },

  handleDatabaseError(err, req, res, next) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else if (err instanceof UniqueViolationError) {
      const { columns } = parseConstraintError(err);
      const readableColumns = makeReadableColumns(columns);
      res.status(400).json({ message: `Duplicated ${readableColumns}` });
    } else if (err instanceof ForeignKeyViolationError) {
      const { columns } = parseConstraintError(err);
      const readableColumns = makeReadableColumns(columns);
      res.status(400).json({ message: `Invalid ${readableColumns}` });
    } else {
      next(err);
    }
  },

  handleHttpError(err, req, res, next) {
    if (!(err instanceof HttpError)) {
      next(err);
      return;
    }

    res.status(err.statusCode).json({ message: err.message });
  },

  handleAuthenticateError(err, req, res, next) {
    if (!(err instanceof AuthenticationError)) {
      next(err);
      return;
    }

    const response = { message: err.message || 'Unauthenticated' };

    res.status(401).json(response);
  },

  handleAuthorizationError(err, req, res, next) {
    if (!(err instanceof AuthorizationError)) {
      next(err);
      return;
    }

    const response = { message: err.message || 'Unauthorized' };

    res.status(403).json(response);
  },

  validate(schema, location = 'body') {
    return function validateMiddleware(req, res, next) {
      validate(schema, req[location]);
      next();
    };
  },

  sanitizePagination(req, res, next) {
    const { page = 1, limit = 10 } = req.query;

    req.query = {
      ...req.query,
      page: (+page - 1),
      offset: (+page - 1) * limit,
      limit: +limit,
    };

    next();
  },

  sanitizeSort(sortableFields = [], defaultSort = '') {
    return function sanitizeSortMiddleware(req, res, next) {
      const { sortBy = defaultSort, sort = 'ASC' } = req.query;

      req.query = {
        ...req.query,
        sortBy: sortableFields.includes(sortBy) ? sortBy : defaultSort,
        sort: ['asc'].includes(sort.toLowerCase()) ? 'ASC' : 'DESC',
      };

      next();
    };
  },
};
