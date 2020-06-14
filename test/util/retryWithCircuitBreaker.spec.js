const sinon = require('sinon');
const chai = require('chai');
const chaiSinon = require('sinon-chai');
const chaiAsPromise = require('chai-as-promised');
const withRetry = require('../../src/util/retry');
const withCircuitBreaker = require('../../src/util/circuitBreaker');

chai.use(chaiSinon);
chai.use(chaiAsPromise);

const { expect } = chai;

describe('Integration test withRetry() and withCircuitBreaker()', () => {
  it('should auto retry and success', async () => {
    const result = {};

    const action = sinon.stub()
      .onCall(0).rejects(new Error())
      .onCall(1)
      .rejects(new Error())
      .onCall(2)
      .resolves(result);

    const actionWithCircuitBreaker = withCircuitBreaker(action);
    const actionWithRetryAndCircuitBreaker = withRetry(actionWithCircuitBreaker);

    await expect(actionWithRetryAndCircuitBreaker()).to.be.eventually.equal(result);
    expect(action).to.be.calledThrice;
  });
});
