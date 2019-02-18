(function (apiFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    if (isNode) {
        module.exports = apiFactory();
    } else {
        window.promiseFakeFactory = apiFactory();
    }
})(function () {

    function ThenableFake() {
        this.thenActionIndex = 0;
        this.errorOccurred = false;
        this.throwsOnNoCatch = true;

        this.thenActions = [];
        this.catchActions = [];
        this.finallyActions = [];
    }

    ThenableFake.prototype = {
        disableThrowOnNoCatch: function () {
            this.throwsOnNoCatch = false;
        },

        throwOnUnresolvable: function () {
            if (!this.canResolve()) {
                throw new Error('Thenable is in a state where resolve cannot be ')
            }
        },

        throwOnNoCatch: function () {
            if (this.throwsOnNoCatch && this.catchActions.length < 1) {
                throw new Error('No error handling provided! Make sure your promise has a catch.');
            }
        },

        canResolve: function () {
            return !this.errorOccurred
                && this.thenActionIndex < this.thenActions.length;
        },

        resolve: function (...args) {
            let lastResult = args;

            while (this.canResolve()) {
                const newResult = this.resolveNext.apply(this, lastResult);

                lastResult = [newResult];
            }
        },

        resolveAction: function (currentAction, args) {
            const result = currentAction.apply(null, args);
            this.thenActionIndex++;

            return result;
        },

        rejectOnError: function (error) {
            this.errorOccurred = true;
            this.reject(error);
        },

        resolveNext: function (...args) {
            this.throwOnNoCatch();

            const currentAction = this.thenActions[this.thenActionIndex];
            let result;

            try {
                result = this.resolveAction(currentAction, args);
            } catch (error) {
                return this.rejectOnError(error);
            }

            if (!this.errorOccurred && !this.canResolve()) {
                this.callFinallyActions();
            }

            return result;
        },

        reject: function (error) {
            this.throwOnNoCatch();

            let nextResult = error;

            this.catchActions.forEach(function (catchAction) {
                nextResult = catchAction(nextResult);
            });

            this.callFinallyActions();
        },

        callFinallyActions: function () {
            this.finallyActions.forEach((action) => action());
        },

        throwOnUnacceptableAction: function (action) {
            const actionType = typeof action;

            if (actionType !== 'function' && actionType !== 'undefined') {
                throw new Error(`Recieved unexpected value for then, catch or finally. Expected undefined or function, but got value of type ${actionType}`);
            }
        },

        pushActionIfSafe: function (actions, newAction) {
            if (typeof newAction === 'function') {
                actions.push(newAction);
            }
        },

        then: function (action, rejection) {
            this.throwOnUnacceptableAction(action);
            this.pushActionIfSafe(this.thenActions, action);
            this.catch(rejection);

            return this;
        },

        catch: function (action) {
            this.throwOnUnacceptableAction(action);
            this.pushActionIfSafe(this.catchActions, action);

            return this;
        },

        finally: function (action) {
            this.throwOnUnacceptableAction(action);
            this.pushActionIfSafe(this.finallyActions, action);

            return this;
        }
    };

    function getThenableFake() {
        return new ThenableFake();
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

        function PromiseFake(executor) {
            let internalCounts = {
                resolve: 0,
                reject: 0
            };

            const resolve = getPromiseInternalFunction(internalCounts, resolveArgs, 'resolve');
            const reject = getPromiseInternalFunction(internalCounts, rejectArgs, 'reject');

            executor(resolve, reject);

            const coreThenable = getThenableFake();

            this.thenables = {
                coreThenable: coreThenable
            };

            this.then = (...args) => coreThenable.then.apply(coreThenable, args);
            this.catch = (...args) => coreThenable.catch.apply(coreThenable, args);
            this.finally = (...args) => coreThenable.finally.apply(coreThenable, args);
        };

        PromiseFake.all = function () {
            PromiseFake.thenables.all = getThenableFake();
            return PromiseFake.thenables.all;
        }

        PromiseFake.race = function () {
            PromiseFake.thenables.race = getThenableFake();
            return PromiseFake.thenables.race;
        }

        PromiseFake.resolve = resolveArgs;
        PromiseFake.reject = rejectArgs;

        return PromiseFake;
    }

    return {
        getPromiseFake: getPromiseFake,
        getThenableFake: getThenableFake
    };

});