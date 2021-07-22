"use strict";
// usage
// const bathroom_lock = something_to_be_locked({preventExit:true})
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLock = void 0;
var createLock = function (_a) {
    var preventExit = _a.preventExit;
    var locked = false;
    var waiting_list = [];
    var preventExitInterval;
    var next = function () {
        var n = waiting_list.shift();
        if (n)
            n(next);
        else {
            locked = false;
            clearInterval(preventExitInterval);
        }
    };
    if (preventExit && !preventExitInterval) {
        preventExitInterval = setInterval(function () { }, 100000); // prevent node from exitng by periodically running this once every 100 seconds
    }
    // instead of returning the function
    // we return a dicitoanry with a key 'aquire_lock'
    // now so that the usage is more descriptivie
    return {
        'aquire_lock': function () {
            var resolve;
            // promise which will resolve once the thing is free
            var p = new Promise(function (r, j) {
                resolve = r;
            });
            if (locked) {
                // @ts-ignore
                waiting_list.push(resolve);
            }
            else {
                locked = true;
                // @ts-ignore
                resolve(next);
            }
            return p;
        }
    };
};
exports.createLock = createLock;
