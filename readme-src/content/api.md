<!--bl
(filemeta
    (title "PromiseFake and Thenable APIs"))
/bl-->

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