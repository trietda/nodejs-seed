const Promise = require('bluebird');
const withCircuitBreaker = require('./circuitBreaker');

describe('withCircuitBreaker()', () => {
  it('should exec action successfully', async () => {
    const action = jest.fn();
    const circuitBreaker = withCircuitBreaker(action);

    await expect(circuitBreaker()).toResolve();
    expect(action).toHaveBeenCalled();
  });

  it('should throw break error if execute action more than retry time, after cool-down period, action is called again, ', async () => {
    const action = jest.fn()
      .mockRejectedValueOnce(new Error())
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error())
      .mockRejectedValueOnce(new Error())
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce();

    const circuitBreaker = withCircuitBreaker(action, {
      breakTimeout: 1000,
    });

    await expect(circuitBreaker()).toReject();
    await expect(circuitBreaker()).toReject();
    await expect(circuitBreaker()).toResolve();
    await expect(circuitBreaker()).toReject();
    await expect(circuitBreaker()).toReject();
    await expect(circuitBreaker()).toReject();
    await expect(circuitBreaker()).toReject();
    expect(action).toHaveBeenCalledTimes(6);
    await Promise.delay('1100');
    await expect(circuitBreaker()).toResolve();
    expect(action).toHaveBeenCalledTimes(7);
  });
});
