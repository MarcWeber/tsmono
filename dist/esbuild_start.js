"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartable_processes = void 0;
var child_process_1 = require("child_process");
var chalk = __importStar(require("chalk"));
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var restartable_processes = function () {
    var processes = {};
    var spawn = function (x, cmd, args, echo) { return new Promise(function (r, j) {
        var _a, _b;
        var out = "";
        if (processes[x]) {
            console.log('killing');
            processes[x].kill();
        }
        var y = (0, child_process_1.spawn)(cmd, args, { stdio: [undefined, 'pipe', 1] });
        console.log("== ".concat(x, " spawned"));
        processes[x] = y;
        (_a = y.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (s) { out += s; if (echo)
            console.log("" + s); });
        (_b = y.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (s) { out += s; if (echo)
            console.log("" + s); });
        processes[x].on("close", function (code, signal) {
            if (code == 0)
                r(undefined);
            fs.writeFileSync("".concat(x, ".log"), out);
            console.log("== ".concat(x, " exited with : ").concat(code, " "));
            if (!echo)
                console.log(out);
            if (code == 0)
                console.log(chalk.green("".concat(x, " exited gracefully")));
            else
                console.log(chalk.red("".concat(x, " exited with code ").concat(code)));
            j("code ".concat(code));
        });
    }); };
    var compile = function (o) { return spawn("server_ts", 'esbuild', ["--outdir=".concat(o.outdir), "--bundle", "--platform=node", o.ts_file]); };
    var restart = function (o) { return spawn("server", 'node', [path.join('dist/api_ts', path.basename(o.ts_file).replace(/\.ts/, '.js'))], true); };
    var recompile_then_start = function (o) {
        compile(o).then(function () { return restart(o); });
    };
    var kill_all = function () {
        for (var _i = 0, _a = Object.values(processes); _i < _a.length; _i++) {
            var v = _a[_i];
            v.kill();
        }
        process.exit();
    };
    return {
        spawn: spawn,
        compile: compile,
        restart: restart,
        recompile_then_start: recompile_then_start,
        kill_all: kill_all
    };
};
exports.restartable_processes = restartable_processes;
