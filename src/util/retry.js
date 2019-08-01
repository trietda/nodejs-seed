const { RetryError } = require('../error');

module.exports = (action, options = {}) => {
  const {
    maxRetry = 3,
  } = options;

  let tryNo = 0;
  let errors = [];

  return async function retry() {
    try {
      return await action();
    } catch (err) {
      errors.push(err);

      if (tryNo === maxRetry - 1) {
        throw new RetryError(errors);
      }

      tryNo += 1;

      return await retry();
    }
  };
};
