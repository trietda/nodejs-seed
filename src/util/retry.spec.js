const { RetryError } = require('../error');
const withRetry = require('./retry');

describe('withRetry()', () => {
  it('should run action and return result', async () => {
    const result = {};
    const action = jest.fn().mockResolvedValueOnce(result);

    const actionWithRetry = withRetry(action);

    await expect(actionWithRetry()).toResolve(result);
    expect(action).toHaveBeenCalled();
  });

  it('should run action multiple times util max retry time is reached', async () => {
    const action = jest.fn();
    const maxRetry = 3;
    for (let i = 0; i < maxRetry; i += 1) {
      action.mockRejectedValueOnce(new Error());
    }

    const actionWithRetry = withRetry(action, { maxRetry });

    await expect(actionWithRetry()).toReject(RetryError);
  });
});
