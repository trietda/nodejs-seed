const Promise = require('bluebird');
const sinon = require('sinon');
const chai = require('chai');
const chaiSinon = require('sinon-chai');
const chaiAsPromise = require('chai-as-promised');
const { BreakError } = require('../../../src/error');
const withCircuitBreaker = require('../../../src/util/circuitBreaker');

chai.use(chaiSinon);
chai.use(chaiAsPromise);

const { expect } = chai;

describe('withCircuitBreaker()', () => {
  it('should exec action successfully', async () => {
    const action = sinon.stub().resolves();

    const circuitBreaker = withCircuitBreaker(action);

    expect(circuitBreaker()).to.be.fulfilled;
    expect(action).to.be.calledOnce;
  });

  it('should throw break error if execute action more than retry time, after cool-down period, action is called again, ', async () => {
    const action = sinon.stub()
      .onCall(0).rejects(new Error())
      .onCall(1)
      .rejects(new Error())
      .onCall(2)
      .resolves()
      .onCall(3)
      .rejects(new Error())
      .onCall(4)
      .rejects(new Error())
      .onCall(5)
      .rejects(new Error())
      .onCall(6)
      .resolves();

    const circuitBreaker = withCircuitBreaker(action, {
      breakTimeout: 1000,
    });

    await expect(circuitBreaker()).to.be.rejectedWith(Error);
    await expect(circuitBreaker()).to.be.rejectedWith(Error);
    await expect(circuitBreaker()).to.be.fulfilled;
    await expect(circuitBreaker()).to.be.rejectedWith(Error);
    await expect(circuitBreaker()).to.be.rejectedWith(Error);
    await expect(circuitBreaker()).to.be.rejectedWith(Error);

    await expect(circuitBreaker()).to.be.rejectedWith(BreakError);
    expect(action).to.have.callCount(6);

    await Promise.delay('1100');
    await expect(circuitBreaker()).to.be.fulfilled;
    expect(action).to.have.callCount(7);
  });
});
