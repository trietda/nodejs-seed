const withRetry = require('../../src/util/retry');
const withCircuitBreaker = require('../../src/util/circuitBreaker');

describe('Integration test withRetry() and withCircuitBreaker()', () => {
  it('should auto retry and success', async () => {
    const result = {};
    const action = jest.fn()
      .mockRejectedValueOnce(new Error())
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce();

    const actionWithCircuitBreaker = withCircuitBreaker(action);
    const actionWithRetryAndCircuitBreaker = withRetry(actionWithCircuitBreaker);

    await expect(actionWithRetryAndCircuitBreaker()).toResolve(result);
    expect(action).toHaveBeenCalledTimes(3);
  });
});
