const { assert } = require('chai');
const { getThenableFake } = require('../index');
const sinon = require('sinon');

describe('ThenableFake', function () {

    describe('resolve', function () {
        it('calls a then action when called', function () {
            const thenableFake = getThenableFake();

            const thenStub = sinon.stub();

            thenableFake
                .then(thenStub)
                .catch(() => null)
                .resolve();

            assert.equal(thenStub.callCount, 1);
        });

        it('calls all then actions when called', function () {
            const thenableFake = getThenableFake();

            const thenStub = sinon.stub();

            thenableFake
                .then(thenStub)
                .then(thenStub)
                .then(thenStub)
                .catch(() => null)
                .resolve();

            assert.equal(thenStub.callCount, 3);

        });

        it('calls passes results from then to then', function () {
            const thenableFake = getThenableFake();
            const thenStub = sinon.stub();

            thenableFake
                .then(value => value + 1)
                .then(value => value * 2)
                .then(thenStub)
                .catch(() => null)
                .resolve(5);

            assert.equal(thenStub.args[0][0], 12);

        });

        it('calls catch actions when then action throws', function () {
            const thenableFake = getThenableFake();
            const catchStub = sinon.stub();
            const errorMessage = 'An error occurred!';

            thenableFake
                .then(() => { throw new Error(errorMessage); })
                .catch(catchStub)
                .catch(catchStub)
                .resolve();

            assert.equal(catchStub.args[0][0].message, errorMessage);
            assert.equal(catchStub.callCount, 2);
        });

        it('throws an error when called if no catch actions exist', function () {
            const thenableFake = getThenableFake();

            function testAction() {
                thenableFake
                    .then(() => null)
                    .resolve();
            }

            assert.throws(testAction);
        });

        it('calls finally actions when resolutions are complete', function () {
            const thenableFake = getThenableFake();

            const finallyStub = sinon.stub();

            thenableFake
                .then(() => null)
                .catch(() => null)
                .finally(finallyStub)
                .finally(finallyStub)
                .resolve();

            assert.equal(finallyStub.callCount, 2);
        });

        it('calls finally actions when an error is thrown', function () {
            const thenableFake = getThenableFake();

            const finallyStub = sinon.stub();

            thenableFake
                .then(() => { throw new Error('Boom!') })
                .catch(() => null)
                .finally(finallyStub)
                .finally(finallyStub)
                .resolve();

            assert.equal(finallyStub.callCount, 2);
        });
    });

});