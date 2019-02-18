(function (apiFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        module.exports = apiFactory();
    } else {
        window.promiseFakeFactory = apiFactory();
    }
})(function () {

    function getThenable() {

    }

    function getPromiseInternalFunction(internalCounts, argumentObject, functionKey) {
        return function (...args) {
            const count = internalCounts[functionKey];

            if (count === 0) {
                argumentObject.args = args;
            } else {
                throw new Error(`Cannot ${functionKey} a promise twice`);
            }

            internalCounts[functionKey]++;
        }
    }

    function getPromiseFake() {
        let resolveArgs = { args: null };
        let rejectArgs = { args: null };

        function PromiseFake(callthrough) {
            let internalCounts = {
                resolve: 0,
                reject: 0
            };

            const resolve = getPromiseInternalFunction(internalCounts, resolveArgs, 'resolve');
            const reject = getPromiseInternalFunction(internalCounts, rejectArgs, 'reject');

            callthrough(resolve, reject);
        };

        PromiseFake.resolve = resolveArgs;
        PromiseFake.reject = rejectArgs;

        return PromiseFake;
    }

    return {
        getPromiseFake: getPromiseFake,
        getThenable: getThenable
    };

});