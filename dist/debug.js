"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug_help = exports.debug = void 0;
// copy from utils-debug
// @ts-ignore
exports.debug = (process.env['DEBUG'] || "").split(':');
var do_debug_help = exports.debug.length > 0 && !exports.debug.includes('hide-help');
var debug_help = function (msg) { if (do_debug_help)
    console.log(msg); };
exports.debug_help = debug_help;
(0, exports.debug_help)("env DEBUG found");
(0, exports.debug_help)("export DEBUG='no-help' to avoid this message");
(0, exports.debug_help)("export DEBUG='moduleA:moduleB' to show debug messages of moduleA and moduleB");
(0, exports.debug_help)("export DEBUG='true:-moduleA' to show debug messages except those of moduleA");
(0, exports.debug_help)("Watch for lines starting with debug-list:  to find all loaded modules you focus on or block");
exports.default = (function (module) {
    if (do_debug_help)
        console.log("debug-list:", module);
    var log = exports.debug.includes(module) || (exports.debug.includes('true') && !exports.debug.includes("-" + module));
    var fun = log
        ? function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // TODO: use stderr
            console.log.apply(console, __spreadArray(["DEBUG:", module], args, false));
        }
        : function () { };
    // @ts-ignore
    fun.log = log;
    return fun;
});
