
# Promise Double Factory #

## Table Of Contents ##

- [Section 1: Introduction](#user-content-introduction)
- [Section 2: Setup](#user-content-setup)
- [Section 3: Test Examples](#user-content-test-examples)
- [Section 4: PromiseFake and Thenable APIs](#user-content-promisefake-and-thenable-apis)
- [Section 5: Version History](#user-content-version-history)

## Introduction ##

Promise Double Factory is a drop-in test solution for handling ES-Next and Promise/A+ promises in your code under test. The goal of Promise Double Factory is to make it as smooth and easy as possible to test code consuming promises without having to do a bunch of test gymnastics.

Why use Promise Double Factory:

- **Easy to use** -- API is exposed to developer to allow for full control over promise execution
- **Predictable** -- Executes promise code as it behaves in the wild, making it easier to verify everything works as expected
- **Deterministic execution** -- Your test is separated from the world: resolve or reject from within tests
- **Clear communication** -- Built to fail when code acts unpredictably: Resolve and reject throw when called twice; Optionally throws an error if no catch or onFailure behavior is registered (default: on)
- **Easy execution analysis** -- Optional step-by-step execution of resolve behavior for easier analysis

Compatibility:

- ES-Next Promise Standard:
    - Promise
        - all
        - race
        - new Promise()
    - Thenable
        - then
        - catch
        - finally
- Promise/A+
    - then supports both onSuccess and onFailure optionally


Promise Double Factory works both in Node and client-side code, so it integrates seamlessly into all of your test scenarios. With its clear, simple API, it is easy to either execute through the entire code stack or perform step-by-step evaluation of promise resolution.
    

## Setup ##

Setup is as simple as performing an NPM installation and including the library in your test environment:

`npm install promise-double-factory --save-dev`

The library exists at the following path:

`project-root/node_modules/promise-double-factory/index.js`

That's it!
    

## Test Examples ##

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
    

## PromiseFake and Thenable APIs ##

### PromiseFake API ###

```javascript
// Getting a new instantiable PromiseFake -- required for test state safety
const PromiseFake = promiseDoubleFactory.getPromiseFake();

// Promise.all
const thenableFake = PromiseFake.all([ /* these promises are not processed. */ ]);

// Promise.race
const thenableFake = PromiseFake.race([ /* these promises are not processed. */ ]);

// Instantiation
const thenableProxyFake = new PromiseFake(function(resolve, reject){
    // Code goes here
    // Resolving and rejecting DOES NOT initiate actual promise resolution
});

// Access to internal values:
const resolveArguments = thenableProxyFake.resolve.args;
const rejectArguments = thenableProxyFake.reject.args;
```

### Thenable Fake API ###

```javascript
// Getting a new thenable fake object
const thenableFake = promiseDoubleFactory.getThenableFake();

// Chaining thens, catches and finallys:
thenableFake
    .then(onSuccess1, onFailure1)
    .then(onSuccess2)
    .catch(onFailure2)
    .catch(onFailure3)
    .finally(onComplete1)
    .finally(onComplete2);

// Resolve and execute onSuccess and onComplete functions completely:
thenableFake.resolve(arg1, arg2);

// Reject and execute onFailure and onComplete functions completely:
thenableFake.reject(new Error('Something bad happened'));

// Resolve onSuccess functions incrementally, calling onComplete functions upon last onSuccess execution completion:
const outcome = thenableFake.resolveNext(aValue); // Returns outcome from internal execution
```
    

## Version History ##

### v1.0.0 ###

Initial release:

- PromiseFake
    - all
    - race
- ThenableFake
    - then
    - catch
    - finally
    - resolve
    - resolveNext
    - reject
    

    