"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartable_processes = void 0;
var child_process_1 = require("child_process");
var chalk_1 = __importDefault(require("chalk"));
var fs_1 = __importDefault(require("fs"));
var restartable_processes = function () {
    var processes = {};
    var spawn = function (key_and_name, cmd, args, echo) { return new Promise(function (r, j) {
        var _a, _b;
        var out = "";
        if (processes[key_and_name]) {
            console.log('killing');
            processes[key_and_name].kill();
        }
        var y = (0, child_process_1.spawn)(cmd, args, { stdio: [undefined, 'pipe', 1] });
        console.log("== ".concat(key_and_name, " spawned"));
        processes[key_and_name] = y;
        (_a = y.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (s) { out += s; if (echo)
            console.log("" + s); });
        (_b = y.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (s) { out += s; if (echo)
            console.log("" + s); });
        processes[key_and_name].on("close", function (code, signal) {
            if (code == 0)
                r(undefined);
            fs_1.default.writeFileSync("".concat(key_and_name, ".log"), out);
            console.log("== ".concat(key_and_name, " exited with : ").concat(code, " "));
            if (!echo)
                console.log(out);
            if (code == 0)
                console.log(chalk_1.default.green("".concat(key_and_name, " exited gracefully")));
            else
                console.log(chalk_1.default.red("".concat(key_and_name, " exited with code ").concat(code)));
            j("code ".concat(code));
        });
    }); };
    var kill_all = function () {
        for (var _i = 0, _a = Object.values(processes); _i < _a.length; _i++) {
            var v = _a[_i];
            v.kill();
        }
        process.exit();
    };
    return {
        spawn: spawn,
        kill_all: kill_all
    };
};
exports.restartable_processes = restartable_processes;
