<!--bl
(filemeta
    (title "Test Examples"))
/bl-->

### A common test example ###

A common test setup scenario would look like the following (using the Mocha test framework):

```javascript
const sinon = require('sinon');

const promiseDoubleFactory = require('promise-double-factory');
const moduleUnderTestFactory = require('./moduleUnderTestFactory');

describe('Module Under Test', function () {

    let thenableFake;
    let moduleUnderTest;

    beforeEach(function () {
        thenableFake = promiseDoubleFactory.getThenableFake();

        const MyService = require('./MyService');
        sinon.stub(MyService, 'doAsyncThing').callsFake(() => thenableFake);

        moduleUnderTest = moduleUnderTestFactory(MyService);
    });

    it('consumes a promise', function() {
        // Call method under test
        moduleUnderTest.doSomethingAsync();

        // Initiate promise resolution, firing all thens, catches and finallys
        thenableFake.resolve({ foo: 'bar' });

        // perform test assertion around result from doSomethingAsync
    });

});
```
### A running thenable fake ###

An example of consuming a Promise Double Factory thenable straight from the actual test suite is as follows:

```javascript
const thenableFake = getThenableFake();

const thenStub = sinon.stub();

thenableFake
    .then(value => value + 1)
    .then(value => value * 2)
    .then(thenStub)
    .catch(() => null)
    .resolve(5);

assert.equal(thenStub.args[0][0], 12);
```

It's worth noting `thenableFake` adheres to the ES-Next promise standard, with the addition of `resolve,` which will execute the promise as if it were resolved from an async executor (action).

### Step-wise then resolution ###

You can step through a promise resolution with the `resolveNext` function.  The following execution allows the user to analyze what happens as each then executes and exits.

```javascript
const thenableFake = getThenableFake();

const thenStub = sinon.stub();

thenableFake
    .then(value => value + 1)
    .then(value => value * 2)
    .then(thenStub)
    .catch(() => null);

const result1 = thenableFake.resolveNext(5); // runs the first 'then'
const result2 = thenableFake.resolveNext(result1); // runs the second 'then'
const result3 = thenableFake.resolveNext(result2); // runs the third 'then'

assert.equal(thenStub.args[0][0], result3);
assert.equal(result3, 12);
```

### Rejecting a thenable fake ###

Rejecting a thenable fake will work exactly as expected, executing no then onSuccess functions, jumping straight to the catch.

```javascript
const thenableFake = getThenableFake();

const thenStub = sinon.stub();
const catchStub = sinon.stub();

thenableFake
    .then(value => value + 1)
    .then(value => value * 2)
    .then(thenStub)
    .catch(() => null)
    .reject(new Error('Because.'));

assert.equal(thenStub.callCount, 0);
assert.equal(thenStub.args[0][0].message, 'Because.');
```