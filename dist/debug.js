"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug_help = exports.debug = void 0;
// copy from utils-debug
// @ts-ignore
exports.debug = (process.env['DEBUG'] || "").split(':');
var do_debug_help = exports.debug.length > 0 && !exports.debug.includes('hide-help');
exports.debug_help = function (msg) { if (do_debug_help)
    console.log(msg); };
exports.debug_help("env DEBUG found");
exports.debug_help("export DEBUG='no-help' to avoid this message");
exports.debug_help("export DEBUG='moduleA:moduleB' to show debug messages of moduleA and moduleB");
exports.debug_help("export DEBUG='true:-moduleA' to show debug messages except those of moduleA");
exports.debug_help("Watch for lines starting with debug-list:  to find all loaded modules you focus on or block");
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
            console.log.apply(console, __spreadArrays(["DEBUG:", module], args));
        }
        : function () { };
    // @ts-ignore
    fun.log = log;
    return fun;
});
