const { BreakError, TimeoutError } = require('../error');

const witTimeout = async (promise, timeout) => {
  const timeoutPromise = new Promise((resolve, reject) => [
    setTimeout(() => reject(new TimeoutError(timeout)), timeout),
  ]);

  return Promise.race([
    timeoutPromise,
    promise,
  ]);
};

module.exports = (action, options = {}) => {
  const {
    maxRetry = 3,
    timeout = 2000,
    breakTimeout = 10000,
  } = options;

  let isBreak = false;
  let retry = 0;

  return async () => {
    if (isBreak) {
      throw new BreakError(this.lastError);
    }

    try {
      const result = await witTimeout(action(), timeout);

      retry = 0;

      return result;
    } catch (err) {
      if (retry === maxRetry - 1) {
        isBreak = true;

        setTimeout(() => {
          isBreak = false;
        }, breakTimeout);
      }

      retry += 1;

      throw err;
    }
  };
};
