const sinon = require('sinon');
const chai = require('chai');
const chaiSinon = require('sinon-chai');
const chaiAsPromise = require('chai-as-promised');
const { RetryError } = require('../../../src/error');
const withRetry = require('../../../src/util/retry');

chai.use(chaiSinon);
chai.use(chaiAsPromise);

const { expect } = chai;

describe('withRetry()', () => {
  it('should run action and return result', async () => {
    const result = {};

    const action = sinon.stub().resolves(result);

    const actionWithRetry = withRetry(action);

    await expect(actionWithRetry()).to.be.eventually.equal(result);
    expect(action).to.be.calledOnce;
  });

  it('should run action multiple times util max retry time is reached', async () => {
    const maxRetry = 3;
    const action = sinon.stub();

    for (let i = 0; i < maxRetry; i++) {
      action.onCall(i).rejects(new Error());
    }

    const actionWithRetry = withRetry(action, { maxRetry });

    await expect(actionWithRetry()).to.be.rejectedWith(RetryError);
  });
});

