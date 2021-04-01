function resolveWhenTrue(options) {
    return new Promise(makeExecutorToResolveWhenTrue(options));
}

function makeExecutorToResolveWhenTrue(options) {
    return function(resolve, reject) {
        checkTester(resolve, reject, options);
    }
}

function makeExecutorToResolveWhenTrueAfterPromiseResolves(promise, options) {
    return function(resolve, reject) {
        promise.then(function(value) {
            checkTester(resolve, reject, { ...options, testerArgument: value });
        }, reject)
    }
}

function makeExecutorThatPerformsActionAfterPromise(promise, action) {
    return function(resolve, reject) {
        promise.then(action, reject)
    }
}

function checkTester(resolve, reject, {
    interval = 10,
    timeout = 10000,
    tester,
    resolveValue = (x) => x,
    rejectReason = () => new Error("Poller timeout"),
    testerArgument
}) {
    const start = new Date();
    function check(){
        let testerResult = tester(testerArgument)
        if(testerResult) {
            resolve(resolveValue(testerResult));
            return true
        } else if( (new Date() - start) > timeout ) {
            reject( rejectReason() )
        } else {
            setTimeout(check, interval);
        }
    }
    check();
}

module.exports = {
    checkTester,
    resolveWhenTrue,
    makeExecutorToResolveWhenTrue,
    makeExecutorThatPerformsActionAfterPromise,
    makeExecutorToResolveWhenTrueAfterPromiseResolves
}
