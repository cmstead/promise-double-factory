const { assert } = require('chai');
const { getPromiseFake } = require('../index');

describe('PromiseFake', function () {
    
    let PromiseFake;

    beforeEach(function () {
        PromiseFake = getPromiseFake();
    });


    it('is instantiable', function () {
        const result = new PromiseFake(() => null);

        assert.equal(typeof result, 'object');
    });
    
    it('tracks calls to resolve', function () {
        const expectedData = 'data';

        new PromiseFake(function(resolve) {
            resolve(expectedData);
        });

        const expectedResult = JSON.stringify([expectedData]);
        const actualResult = JSON.stringify(PromiseFake.resolve.args);

        assert.equal(expectedResult, actualResult);
    });
    
    it('throws an error if resolve is called more than once', function () {
        const expectedData = 'data';

        const testThrows = () => new PromiseFake(function(resolve) {
            resolve(expectedData);
            resolve(expectedData);
        });

        assert.throws(testThrows);
    });
    
    it('tracks calls to reject', function () {
        const expectedData = new Error('Reject error message');

        new PromiseFake(function(resolve, reject) {
            reject(expectedData);
        });

        const expectedResult = expectedData.message;
        const actualResult = PromiseFake.reject.args[0].message;

        assert.equal(expectedResult, actualResult);
        assert.equal(PromiseFake.reject.args.length, 1);
    });
    
    it('throws an error if reject is called more than once', function () {
        const expectedData = new Error('Reject called twice');

        const testThrows = () => new PromiseFake(function(resolve, reject) {
            reject(expectedData);
            reject(expectedData);
        });

        assert.throws(testThrows);
    });
    

});
