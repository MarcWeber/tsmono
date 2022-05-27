"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var chalk_1 = __importDefault(require("chalk"));
var debug_1 = __importDefault(require("./debug"));
var fs = __importStar(require("fs-extra"));
var JSON5 = __importStar(require("json5"));
var path = __importStar(require("path"));
var debug = (0, debug_1.default)("tsmono");
var btoa_1 = __importDefault(require("btoa"));
var child_process_1 = require("child_process");
var cross_fetch_1 = require("cross-fetch");
// import deepequal from "deep-equal"
var deep_equal_1 = __importDefault(require("deep-equal"));
var deepmerge_1 = __importDefault(require("deepmerge"));
var os_1 = require("os");
var path_1 = require("path");
var lock_1 = require("./lock");
var json_file_plus_1 = __importDefault(require("json-file-plus"));
var patches_1 = require("./patches");
var library_notes_1 = __importDefault(require("./library-notes"));
var readJsonFile = function (path) { return __awaiter(void 0, void 0, Promise, function () {
    var jf;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("reading", path);
                return [4 /*yield*/, (0, json_file_plus_1.default)(path)];
            case 1:
                jf = _a.sent();
                return [2 /*return*/, jf.data];
        }
    });
}); };
var parse_json_file = function (path) {
    try {
        return JSON5.parse(fs.readFileSync(path, 'utf8'));
    }
    catch (e) {
        throw "bad JSON at file ".concat(path, ", error: ").concat(e);
    }
};
// TODO: use path.join everywhere
var silent = false;
var info = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (!silent)
        console.log.apply(console, args);
};
var warning = info;
var verbose = info;
/// LIBRARY SUPPORT CODE
var clone = function (x) {
    return x === undefined ? undefined : JSON.parse(JSON.stringify(x));
};
var unique = function (x) { return x.filter(function (v, i) { return x.indexOf(v) === i; }); };
var del_if_exists = function (path) {
    // fs.existsSync doesn't work on symlinks
    try {
        fs.unlinkSync(path);
    }
    catch (e) { }
};
var assert = function (a, msg) {
    if (msg === void 0) { msg = ""; }
    if (!a)
        throw new Error(msg);
};
var assert_eql = function (a, b) {
    assert(a.trim() === b.trim(), "assertion ".concat(JSON.stringify(a), " === ").concat(JSON.stringify(b), " failed"));
};
var run = function (cmd, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var args, stdout, stderr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                args = opts.args || [];
                console.log("args", args);
                info("running", cmd, args, "in", opts.cwd);
                stdout = "";
                stderr = "";
                // duplicate code
                return [4 /*yield*/, new Promise(function (a, b) {
                        var child = (0, child_process_1.spawn)(cmd, args, Object.assign(opts, {
                            stdio: ["stdin" in opts ? "pipe" : 0, opts.stdout1 ? 1 : "pipe", "pipe"],
                        }));
                        if (child.stdin) {
                            if ("stdin" in opts && child.stdin) {
                                verbose("stdin is", opts.stdin);
                                // @ts-ignore
                                child.stdin.setEncoding("utf8");
                                child.stdin.write(opts.stdin);
                            }
                            // @ts-ignore
                            child.stdin.end();
                        }
                        if (child.stdout)
                            child.stdout.on("data", function (s) { return stdout += s; });
                        if (child.stderr)
                            child.stderr.on("data", function (s) { return stderr += s; });
                        child.on("close", function (code, signal) {
                            if ((opts.expected_exitcodes || [0]).includes(code))
                                a(undefined);
                            else
                                b("".concat(cmd.toString(), " ").concat(args.join(" ").toString(), " failed with code ").concat(code, "\nstdout:\n").concat(stdout, "\nstderr:\n").concat(stderr));
                        });
                    })];
            case 1:
                // duplicate code
                _a.sent();
                return [2 /*return*/, stdout];
        }
    });
}); };
var DirectoryCache = /** @class */ (function () {
    // sry for reimplementing it - need a *simple* fast solution
    function DirectoryCache(path) {
        this.path = path;
    }
    DirectoryCache.prototype.get = function (key, f, ttl_seconds) {
        var cached = this.get_(key, ttl_seconds);
        if (cached === undefined) {
            var r = f();
            this.put_(key, r);
            return r;
        }
        return cached;
    };
    DirectoryCache.prototype.get_async = function (key, f, ttl_seconds) {
        return __awaiter(this, void 0, Promise, function () {
            var cached, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.get_(key, ttl_seconds);
                        if (!(cached === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, f()];
                    case 1:
                        r = _a.sent();
                        this.put_(key, r);
                        return [2 /*return*/, r];
                    case 2: return [2 /*return*/, cached];
                }
            });
        });
    };
    DirectoryCache.prototype.tc_ = function () {
        return new Date().getTime();
    };
    DirectoryCache.prototype.path_ = function (key) {
        return path.join(this.path, (0, btoa_1.default)(key));
    };
    DirectoryCache.prototype.get_ = function (key, ttl) {
        var p = this.path_(key);
        if (fs.existsSync(p)) {
            var json = JSON.parse(fs.readFileSync(p, "utf8"));
            if (ttl === undefined || !(this.tc_() - json.tc > ttl))
                return json.thing;
        }
        return undefined;
    };
    DirectoryCache.prototype.put_ = function (key, thing) {
        if (!fs.existsSync(this.path))
            fs.mkdirpSync(this.path);
        fs.writeFileSync(this.path_(key), JSON.stringify({ thing: thing, tc: this.tc_() }));
    };
    return DirectoryCache;
}());
var config = {
    cacheDir: "~/.tsmono/cache",
};
var parse_dependency = function (s, origin) {
    var _a;
    var l = s.split(";");
    var r = { name: l[0] };
    if (/git\+https/.test(r.name)) {
        r.url = r.name;
        r.name = path.basename(r.name).replace(/\.git$/, "");
    }
    if ((_a = patches_1.patches[r.name]) === null || _a === void 0 ? void 0 : _a.npm_also_types) {
        r.types = true;
    } // TODO: add versions constraints
    for (var _i = 0, _b = l.slice(1); _i < _b.length; _i++) {
        var v = _b[_i];
        var x = v.split("=");
        if (x.length >= 2) {
            x = [x[0], x.slice(1).join("=")];
            if (x[0] === "version")
                r.version = x[1];
            else if (x[0] === "name")
                r.name = x[1];
            else if (x[0] === "srcdir")
                r.srcdir = x[1];
            else if (x[0] === "allDevDependencies")
                r.allDevDependencies = true;
            else if (x[0] === "package.json")
                r.package_jsons = __spreadArray(__spreadArray([], (r.package_jsons || []), true), [x[1]], false);
            else
                throw new Error("bad key=name pair: ".concat(v));
        }
        if (v === "node_modules")
            r[v] = true;
        if (v === "types") {
            r[v] = true;
            r.npm = true;
        }
        if (v === "npm")
            r[v] = true;
        if (v === "ignore_src")
            r[v] = true;
    }
    if (origin !== undefined)
        r.origin = origin;
    return r;
};
var cfg_api = function (cfg) {
    var fetch_from_registry = function (name) {
        return cfg.cache.get_async("fetch-".concat(name, "-registry.npmjs.org"), function () { return __awaiter(void 0, void 0, void 0, function () {
            var url, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "https://registry.npmjs.org/".concat(encodeURIComponent(name));
                        return [4 /*yield*/, (0, cross_fetch_1.fetch)(url)];
                    case 1:
                        res = _a.sent();
                        if (res.status !== 200)
                            throw new Error("fetching ".concat(url));
                        // returns {"error":"not found"} if package doesn't exist
                        return [2 /*return*/, res.json()];
                }
            });
        }); }, cfg.fetch_ttl_seconds);
    };
    var npm_version_for_name = function (name) { return __awaiter(void 0, void 0, Promise, function () {
        var lock, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lock = new JSONFile(".tsmonolock");
                    if (!!(name in lock.json)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch_from_registry(name)];
                case 1:
                    r = _a.sent();
                    if (r.error)
                        return [2 /*return*/, undefined];
                    lock.json[name] = "^".concat(r["dist-tags"].latest);
                    lock.flush();
                    _a.label = 2;
                case 2: return [2 /*return*/, lock.json[name]];
            }
        });
    }); };
    return {
        fetch_from_registry: fetch_from_registry,
        npm_version_for_name: npm_version_for_name,
    };
};
var backup_file = function (path) {
    if (fs.existsSync(path)) {
        var bak = "".concat(path, ".bak");
        if (fs.existsSync(bak))
            fs.renameSync(path, bak);
    }
};
// use object-path instead ?
var get_path = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    // get_path(obj, path)
    var r = args[0];
    for (var _a = 0, _b = args.slice(1, -1); _a < _b.length; _a++) {
        var v = _b[_a];
        try {
            if (!(v in r))
                return args[args.length - 1];
        }
        catch (e) {
            throw new Error("get_path problem getting key ".concat(v, ", args ").concat(args));
        }
        r = r[v];
    }
    return r;
};
var ensure_path = function (obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    // ensure_path({}, 'foo', 'bar', [])
    var e = args.length - 2;
    for (var i = 0, len = e; i <= e; i++) {
        var k = args[i];
        if (i === e) {
            obj[k] = obj[k] || args[e + 1];
            return obj[k];
        }
        obj[k] = obj[k] || {};
        obj = obj[k];
    }
};
var protect = function (path, flush, force, protect_path) {
    if (force === void 0) { force = false; }
    if (protect_path === void 0) { protect_path = "".concat(path, ".protect"); }
    if (fs.existsSync(protect_path) && fs.existsSync(path)) {
        if (!force && fs.readFileSync(protect_path, "utf8") !== fs.readFileSync(path, "utf8"))
            // TODO nicer diff or allow applying changes to tsmono.json
            throw new Error("mv ".concat(protect_path, " ").concat(path, " to continue. Not overwriting your changes. Use --force to force"));
    }
    flush();
    fs.copyFileSync(path, protect_path);
};
var JSONFile = /** @class */ (function () {
    function JSONFile(path, default_) {
        if (default_ === void 0) { default_ = function () { return ({}); }; }
        this.path = path;
        this.json = {};
        this.json_on_disc = undefined;
        if (fs.existsSync(this.path)) {
            var s = fs.readFileSync(this.path, "utf8");
            this.json = parse_json_file(this.path);
        }
        else {
            this.json_on_disc = undefined;
            this.json = default_();
        }
    }
    JSONFile.prototype.exists = function () {
        return fs.existsSync(this.path);
    };
    JSONFile.prototype.flush = function () {
        var s = JSON.stringify(this.json, undefined, 2);
        if (!(0, deep_equal_1.default)(this.json_on_disc, this.json)) {
            fs.writeFileSync(this.path, s, "utf8");
        }
    };
    JSONFile.prototype.flush_protect_user_changes = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        protect(this.path, function () { _this.flush(); }, force);
    };
    return JSONFile;
}());
var TSMONOJSONFile = /** @class */ (function (_super) {
    __extends(TSMONOJSONFile, _super);
    function TSMONOJSONFile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TSMONOJSONFile.prototype.init = function (cfg, tsconfig) {
        ensure_path(this.json, "name", "");
        ensure_path(this.json, "version", "0.0.0");
        ensure_path(this.json, "dependencies", []);
        ensure_path(this.json, "devDependencies", []);
        ensure_path(this.json, "tsconfig", tsconfig);
    };
    TSMONOJSONFile.prototype.dirs = function () {
        return get_path(this.json, "tsmono", "directories", ["../"]);
    };
    return TSMONOJSONFile;
}(JSONFile));
var map_package_dependencies_to_tsmono_dependencies = function (versions) {
    var r = [];
    for (var _i = 0, _a = Object.entries(versions); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        r.push("".concat(k, ";version=").concat(v));
    }
    return r;
};
var dependency_to_str = function (d) {
    return "".concat(d.name, " ").concat(d.npm && d.repository ? "npm and repository?" : (d.repository ? "from ".concat(d.repository.path) : "from npm ".concat(d.version ? d.version : "")), " requested from ").concat(d.origin);
};
var DependencyCollection = /** @class */ (function () {
    function DependencyCollection(cfg, origin, dirs) {
        this.cfg = cfg;
        this.origin = origin;
        this.dirs = dirs;
        this.dependency_locactions = {};
        this.dependencies = [];
        this.devDependencies = [];
        this.todo = [];
        this.recursed = [];
        this.links = {};
        this.paths = {};
        this.warnings = [];
    }
    DependencyCollection.prototype.print_warnings = function () {
        var _a;
        var _loop_1 = function (k, v) {
            var notes = (_a = patches_1.patches[k]) === null || _a === void 0 ? void 0 : _a.notes;
            if (notes) {
                console.log(chalk_1.default.magenta("HINT: ".concat(k, " repo: ").concat(v[0].origin, " ").concat(notes.join("\n"))));
            }
            // TODO: check that all v's are same constraints ..
            var npms = v.filter(function (x) { return x.npm; });
            var no_npms = v.filter(function (x) { return !x.npm; });
            if (npms.length > 0 && no_npms.length > 0)
                warning("WARNING: ".concat(this_1.origin, " dependency ").concat(k, " requested as npm and from disk, choosing first ").concat(v.map(dependency_to_str).join("\n")));
            // check version match etc
            var package_json_cache = {};
            var all_versions = [];
            var with_version = v.map(function (dep) {
                var _a;
                // hack just removing leading ^ - should look at lock files (fyn, node, ..) instead - but this probably is good enough
                var f = function (x) { return x.replace("^", ""); };
                var versions = [];
                if (dep.version)
                    versions.push(f(dep.version));
                if (dep.origin) {
                    var ps = (_a = dep.package_jsons) !== null && _a !== void 0 ? _a : ["".concat(dep.origin, "/package.json")];
                    var _loop_2 = function (p) {
                        if (!(dep.origin in package_json_cache) && fs.existsSync(p)) {
                            package_json_cache[p] = parse_json_file(p);
                            ["dependencies", "devDependencies"].forEach(function (d) {
                                var x = (dep.origin === undefined)
                                    ? undefined
                                    : get_path(package_json_cache[p], d, k, undefined);
                                if (x !== undefined)
                                    versions.push(f(x));
                            });
                        }
                        else if (dep.version) {
                            versions.push(f(dep.version));
                        }
                    };
                    for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
                        var p = ps_1[_i];
                        _loop_2(p);
                    }
                }
                all_versions = __spreadArray(__spreadArray([], all_versions, true), versions, true);
                return { dep: dep, versions: versions };
            }).filter(function (x) { return x.versions.length > 0; });
            if (unique(all_versions).length > 1) {
                warning("WARNING: ".concat(this_1.origin, " transient dependencies ").concat(k, " with competing versions found:"));
                for (var _f = 0, with_version_1 = with_version; _f < with_version_1.length; _f++) {
                    var v_1 = with_version_1[_f];
                    warning(v_1.dep.origin, v_1.versions);
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, _b = Object.entries(this.dependency_locactions); _i < _b.length; _i++) {
            var _c = _b[_i], k = _c[0], v = _c[1];
            _loop_1(k, v);
        }
        for (var _d = 0, _e = unique(this.warnings); _d < _e.length; _d++) {
            var w = _e[_d];
            console.log('!!!! > ' + w);
        }
    };
    DependencyCollection.prototype.dependencies_of_repository = function (r, dev, o) {
        var _this = this;
        var _a;
        // add dependencies r to todo list to be looked at
        var deps = r.dependencies(o);
        // paths
        for (var _i = 0, _b = Object.entries(deps.paths); _i < _b.length; _i++) {
            var _c = _b[_i], k = _c[0], v = _c[1];
            this.paths[k] = __spreadArray(__spreadArray([], (_a = this.paths[k]) !== null && _a !== void 0 ? _a : [], true), v, true);
        }
        // links
        if (o.addLinks) {
            for (var _d = 0, _e = Object.entries(deps.links); _d < _e.length; _d++) {
                var _f = _e[_d], k = _f[0], v = _f[1];
                var from = path.join(r.path, k);
                var o_1 = this.links[from];
                if (o_1 && o_1 != v)
                    debug("warning, overwriting link ".concat(o_1, " ").concat(v));
                this.links[from] = v;
            }
        }
        var add = function (key, filter) {
            if (filter === void 0) { filter = function (x) { return true; }; }
            _this.todo = __spreadArray(__spreadArray([], _this.todo, true), deps[key], true);
            _this[key] = __spreadArray(__spreadArray([], _this[key], true), deps[key].map(function (x) { return x.name; }).filter(filter), true);
        };
        add("dependencies");
        if (dev === true || dev === "dev-types")
            add("devDependencies", function (x) { return dev !== "dev-types" || /^@types/.test(x); });
    };
    DependencyCollection.prototype.do = function () {
        var next;
        // tslint:disable-next-line: no-conditional-assignment
        while (next = this.todo.shift()) {
            if (next.name in library_notes_1.default)
                this.warnings.push("WARNING for using library ".concat(next.name, ": ").concat(library_notes_1.default[next.name]));
            this.find_and_recurse_dependency(next);
        }
    };
    DependencyCollection.prototype.find_and_recurse_dependency = function (dep) {
        var _a;
        var locations = ensure_path(this.dependency_locactions, dep.name, []);
        locations.push(dep);
        if (this.recursed.includes(dep.name))
            return;
        this.recursed.push(dep.name);
        if (dep.npm)
            return; // nothing to do
        console.log("searching", dep);
        var dirs_lookup = this.dirs.map(function (x) { var _a; return path.join(x, (_a = patches_1.provided_by[dep.name]) !== null && _a !== void 0 ? _a : dep.name); });
        verbose("dirs_lookup", dirs_lookup);
        var d = dirs_lookup.find(function (dir) { return fs.existsSync(dir); });
        if (!d) {
            info("dependency ".concat(dependency_to_str(dep), " not found, forcing npm"));
            dep.npm = true;
            return;
        }
        console.log("dep=", dep);
        var r = new Repository(this.cfg, d, { dependency: dep });
        dep.repository = r;
        // devDependencies are likely to contain @types thus pull them, too ?
        // TODO: only pull @types/*?
        this.dependencies_of_repository(r, ((_a = patches_1.patches[dep.name]) === null || _a === void 0 ? void 0 : _a.allDevDependencies) ? true : "dev-types", { addLinks: true });
    };
    return DependencyCollection;
}());
var Repository = /** @class */ (function () {
    function Repository(cfg, path, o) {
        var _a;
        this.cfg = cfg;
        this.path = path;
        this.basename = (0, path_1.basename)(path);
        if (/\/\//.test(path))
            throw new Error("bad path ".concat(path));
        this.tsmonojson = new TSMONOJSONFile("".concat(path, "/tsmono.json"));
        var p = ((_a = o.dependency) === null || _a === void 0 ? void 0 : _a.package_jsons) || ['package.json'];
        this.packagejson_paths = p.map(function (x) { return "".concat(path, "/").concat(x); });
        this.packagejsons = this.packagejson_paths.map(function (x) { return new JSONFile(x); });
    }
    Repository.prototype.tsmono_json_with_patches = function () {
        var _a, _b;
        return deepmerge_1.default.all([{}, this.tsmonojson, (_b = (_a = patches_1.patches[this.basename]) === null || _a === void 0 ? void 0 : _a.tsmono) !== null && _b !== void 0 ? _b : {}]);
    };
    Repository.prototype.repositories = function (opts) {
        var dep_collection = new DependencyCollection(this.cfg, this.path, this.tsmonojson.dirs());
        dep_collection.dependencies_of_repository(this, true, { addLinks: false });
        dep_collection.do();
        dep_collection.print_warnings();
        var result = [];
        if (opts && opts.includeThis)
            result.push(this);
        var seen = [];
        for (var _i = 0, _a = Object.entries(dep_collection.dependency_locactions); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            var r = v[0].repository;
            if (r) {
                if (seen.includes(r.path))
                    continue;
                seen.push(r.path);
                result.push(r);
            }
        }
        return result;
    };
    Repository.prototype.flush = function () {
        this.tsmonojson.flush();
        for (var _i = 0, _a = this.packagejsons; _i < _a.length; _i++) {
            var v = _a[_i];
            v.flush();
        }
    };
    Repository.prototype.init = function () {
        var tsconfig = path.join(this.path, "tsconfig.json");
        this.tsmonojson.init(this.cfg, fs.existsSync(tsconfig) ? parse_json_file(tsconfig) : {});
    };
    Repository.prototype.tsmono_json_contents = function () {
        var p = path.join(this.path, 'tsmono.json');
        return (fs.existsSync(p)) ? parse_json_file(p) : {};
    };
    Repository.prototype.dependencies = function (o) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var to_dependency = function (dep) { return parse_dependency(dep, _this.path); };
        var presets = function (key) {
            var c_presets = get_path(_this.tsmonojson.json, "presets", {});
            return Object.keys(c_presets).map(function (p) { return get_path(presets, p, key, []); }).flat(1);
        };
        var tsmono_json = deepmerge_1.default.all([{}, this.tsmono_json_contents(), (_b = (_a = patches_1.patches[this.basename]) === null || _a === void 0 ? void 0 : _a.tsmono) !== null && _b !== void 0 ? _b : {}]);
        var package_jsons_paths = ((_d = (_c = tsmono_json === null || tsmono_json === void 0 ? void 0 : tsmono_json.js_like_source) === null || _c === void 0 ? void 0 : _c.dependencies_from_package_jsons) !== null && _d !== void 0 ? _d : ['package.json']).map(function (x) { return path.join(_this.path, x); });
        var package_jsons = package_jsons_paths.filter(function (x) { return fs.existsSync(x); })
            .map(parse_json_file);
        // console.log('package jsons', package_jsons_paths, package_jsons)
        var links = function () {
            var _a;
            var src = path.join(_this.path, "src");
            var k = fs.existsSync(src) ? "src" : "";
            return _a = {}, _a[k] = _this.basename, _a;
        };
        var package_json_dependencies = (package_jsons.map(function (x) { var _a; return map_package_dependencies_to_tsmono_dependencies((_a = x.dependencies) !== null && _a !== void 0 ? _a : []); }).flat());
        var package_json_devDependencies = (package_jsons.map(function (x) { var _a; return map_package_dependencies_to_tsmono_dependencies((_a = x.devDependencies) !== null && _a !== void 0 ? _a : []); }).flat());
        var f = function (x) { return !/version=(workspace:\*|link:.\/types)$/.test(x); };
        var deps = {
            dependencies: (__spreadArray(__spreadArray([], package_json_dependencies, true), ((_e = tsmono_json.dependencies) !== null && _e !== void 0 ? _e : []), true)).filter(f).map(to_dependency),
            devDependencies: (__spreadArray(__spreadArray([], package_json_devDependencies, true), ((_f = tsmono_json.devDependencies) !== null && _f !== void 0 ? _f : []), true)).filter(f).map(to_dependency),
            links: (_h = (_g = tsmono_json === null || tsmono_json === void 0 ? void 0 : tsmono_json.js_like_source) === null || _g === void 0 ? void 0 : _g.links) !== null && _h !== void 0 ? _h : links(),
            paths: (_k = (_j = tsmono_json === null || tsmono_json === void 0 ? void 0 : tsmono_json.js_like_source) === null || _j === void 0 ? void 0 : _j.paths) !== null && _k !== void 0 ? _k : {},
        };
        console.log("deps of ", this.path, deps);
        return deps;
    };
    Repository.prototype.update = function (cfg, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var this_tsmono, link_dir, cwd, tsmonojson, package_json, tsconfig, dep_collection, expected_symlinks, expected_tools, paths, paths_add, _i, _a, _b, k, v, _c, _d, _e, k, v, _f, v_2, v2, _g, _h, _j, k, v, src_tool, fix_ts_config, path_for_tsconfig, _k, _l, _m, path_, merge, tsconfig_path_1, json_1, _o, _p, _q, k, v, t, _r, _s, _t, k, v, add_dep, add_npm_packages, _u, _v, to_be_installed, p_installed, installed, _w, _x, dir, n, opts2, repositories, _y, repositories_1, r;
            var _this = this;
            return __generator(this, function (_z) {
                switch (_z.label) {
                    case 0:
                        if (!!fs.existsSync("".concat(this.path, "/tsmono.json"))) return [3 /*break*/, 3];
                        // only run fyn if package.json exists
                        info("!! NO tsmono.json found, only trying to install npm packages");
                        if (!(opts.install_npm_packages && fs.existsSync("".concat(this.path, "/package.json")))) return [3 /*break*/, 2];
                        info("running ".concat(cfg.npm_install_cmd, " in dependency ").concat(this.path));
                        return [4 /*yield*/, run(cfg.npm_install_cmd[0], { args: cfg.npm_install_cmd.slice(1), cwd: this.path })];
                    case 1:
                        _z.sent();
                        _z.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        this_tsmono = "".concat(this.path, "/src/tsmono");
                        link_dir = "".concat(this_tsmono);
                        if (opts.link_to_links) {
                            // (fs.existsSync(link_dir) ? fs.readdirSync(link_dir) : []).forEach((x: string) => {
                            //   fs.unlinkSync(path.join(link_dir, x))
                            // })
                            if (fs.existsSync(this_tsmono))
                                fs.removeSync(this_tsmono);
                        }
                        else {
                            if (fs.existsSync(this_tsmono))
                                fs.removeSync(this_tsmono);
                        }
                        cwd = process.cwd();
                        tsmonojson = this.tsmonojson.json || {};
                        package_json = clone(get_path(tsmonojson, "package", {}));
                        if (package_json === undefined) {
                            package_json = {};
                        }
                        package_json.dependencies = {};
                        package_json.devDependencies = {};
                        delete package_json.tsconfig;
                        tsconfig = {};
                        dep_collection = new DependencyCollection(cfg, this.path, this.tsmonojson.dirs());
                        dep_collection.dependencies_of_repository(this, true, { addLinks: false });
                        dep_collection.do();
                        dep_collection.print_warnings();
                        expected_symlinks = {};
                        expected_tools = {};
                        paths = {};
                        paths_add = function (lhs, rhs) {
                            var lhs_a = ensure_path(paths, lhs, []);
                            if (!lhs_a.includes(rhs)) {
                                lhs_a.push(rhs);
                            }
                        };
                        // link
                        for (_i = 0, _a = Object.entries(dep_collection.links); _i < _a.length; _i++) {
                            _b = _a[_i], k = _b[0], v = _b[1];
                            if (opts.link_to_links) {
                                expected_symlinks["".concat(link_dir, "/").concat(v)] = path.relative(path.join(link_dir, path.dirname(v)), path.resolve(cwd, k));
                                paths_add("".concat(v, "/*"), "src/tsmono/".concat(v, "/*")); // without * for index.ts
                                paths_add(v, "src/tsmono/".concat(v)); // without * for index.ts
                            }
                        }
                        // paths
                        for (_c = 0, _d = Object.entries(dep_collection.paths); _c < _d.length; _c++) {
                            _e = _d[_c], k = _e[0], v = _e[1];
                            for (_f = 0, v_2 = v; _f < v_2.length; _f++) {
                                v2 = v_2[_f];
                                paths_add(k, "src/tsmono/".concat(v2));
                            }
                        }
                        for (_g = 0, _h = Object.entries(dep_collection.dependency_locactions); _g < _h.length; _g++) {
                            _j = _h[_g], k = _j[0], v = _j[1];
                            if (v[0].repository) {
                                src_tool = "".concat(v[0].repository.path, "/src/tool");
                                (fs.existsSync(src_tool) ? fs.readdirSync(src_tool) : []).forEach(function (x) {
                                    var match = /([^/\\]*)(\.ts)/.exec(x);
                                    if (match) {
                                        expected_tools[match[1]] = x;
                                    }
                                });
                            }
                        }
                        fix_ts_config = function (x) {
                            var _a;
                            ensure_path(x, "compilerOptions", {});
                            if (((_a = x === null || x === void 0 ? void 0 : x.compilerOptions) === null || _a === void 0 ? void 0 : _a.moduleResolution) == 'node')
                                console.log(chalk_1.default.red("don't use moduleResolution node cause symlinks aren't found in a stable way"));
                            // some sane defaults uer can overwrite which make most code just work
                            // If you're not happy with these defaults you can always set the keys to overwrite these
                            ensure_path(x, "compilerOptions", "preserveSymlinks", true); // so that stuff get's loaded from current directory and not multiple versions from dependencies
                            ensure_path(x, "compilerOptions", "esModuleInterop", true); // eg to import m from "mithril"
                            ensure_path(x, "compilerOptions", "moduleResolution", 'node'); // otherwise src/tsmono/* symlinks seem to be instable ?? classic fails with ../src
                            ensure_path(x, "compilerOptions", "module", "commonjs"); // eg to import m from "mithril"
                            ensure_path(x, "compilerOptions", "target", "esnext"); // eg to import m from "mithril"
                            ensure_path(x, "compilerOptions", "strict", true); // eg to import m from "mithril"
                            ensure_path(x, "compilerOptions", "lib", [
                                "es5",
                                "es6",
                                "dom",
                                "es2015.promise",
                                "es2015.collection",
                                "es2015.iterable",
                                "es2019",
                                "dom", "dom.iterable" // for (const x in el.children)
                            ]); // eg to import m from "mithril"
                            if ("paths" in x.compilerOptions) {
                                if (!("baseUrl" in x.compilerOptions)) {
                                    x.compilerOptions.baseUrl = ".";
                                }
                                else {
                                    // Is this causing more problems than modules not being found
                                    throw "please drop baseUrl from your config. cause we have paths e.g. due to referenced dependencies it should be '.'";
                                }
                            }
                            // for test/test.ts so that it can import {..} from "<lib-name>"
                            // when using classic module resolution, node causes some errors
                            ensure_path(x, 'compilerOptions', 'paths', _this.basename, ["src/*"]);
                            // otherwise a lot of imports will not work
                            x.compilerOptions.allowSyntheticDefaultImports = true;
                            x.compilerOptions.esModuleInterop = true;
                            // if you run tsc or such -> provide default dist folder to keep eventually created .js files apart
                            ensure_path(x, "compilerOptions", "outDir", "./dist");
                            // if we have an dist/outDir add to exclude
                            for (var _i = 0, _b = ["outDir", "outFile"]; _i < _b.length; _i++) {
                                var key = _b[_i];
                                if (x.compilerOptions[key])
                                    ensure_path(x, "exclude", []).push(x.compilerOptions[key]);
                            }
                            return x;
                        };
                        path_for_tsconfig = function (x) {
                            return { compilerOptions: { paths: paths } };
                        };
                        if ("tsconfigs" in tsmonojson) {
                            for (_k = 0, _l = Object.entries(tsmonojson.tsconfigs); _k < _l.length; _k++) {
                                _m = _l[_k], path_ = _m[0], merge = _m[1];
                                info("tsconfig.json path", path_);
                                // use protect
                                fs.writeFileSync(path.join(path_, "tsconfig.json"), JSON.stringify(fix_ts_config(deepmerge_1.default.all([tsmonojson.tsconfig || {}, path_for_tsconfig(path_), tsconfig, merge])), undefined, 2), "utf8");
                            }
                        }
                        else if ("tsconfig" in tsmonojson || Object.keys(path_for_tsconfig("")).length > 0) {
                            tsconfig_path_1 = path.join(this.path, "tsconfig.json");
                            json_1 = JSON.stringify(fix_ts_config((0, deepmerge_1.default)(tsmonojson.tsconfig || {}, path_for_tsconfig(this.path), tsconfig)), undefined, 2);
                            protect(tsconfig_path_1, function () { fs.writeFileSync(tsconfig_path_1, json_1, "utf8"); }, opts.force);
                        }
                        // clone(tsmonojson.tsconfig) || {}
                        if (opts.link_to_links) {
                            for (_o = 0, _p = Object.entries(expected_tools); _o < _p.length; _o++) {
                                _q = _p[_o], k = _q[0], v = _q[1];
                                // todo should be self contained but
                                // node -r ts-node/register/transpile-only -r tsconfig-paths/register
                                // works so well that you sohuld have a shourtcut in your .bashrc anywaya
                                // so just making symlinks for now which should be good enough
                                ["tsmono/tools", "tsmono/tools-bin", "tsmono/tools-bin-check"].forEach(function (x) { if (!fs.existsSync(x))
                                    fs.mkdirSync(x); });
                                // this is going to break if you have realtive symlinks ?
                                expected_symlinks["".concat(this.path, "/}tsmono/tools/").concat(k)] = v;
                                t = "tsmono/tools-bin/".concat(k);
                                del_if_exists(t);
                                fs.writeFileSync(t, "#!/bin/sh\nnode -r ts-node/register/transpile-only -r tsconfig-paths/register ".concat(v, " \"$@\" "), "utf8");
                                fs.writeFileSync("tsmono/tools-bin-check/".concat(k), "#!/bin/sh\nnode -r ts-node/register-only -r tsconfig-paths/register ".concat(v, " \"$@\""), "utf8");
                            }
                        }
                        for (_r = 0, _s = Object.entries(expected_symlinks); _r < _s.length; _r++) {
                            _t = _s[_r], k = _t[0], v = _t[1];
                            del_if_exists(k);
                            fs.mkdirpSync((0, path_1.dirname)(k));
                            info("symlinking ".concat(k, " -> ").concat(v));
                            fs.symlinkSync(v, k);
                        }
                        ensure_path(package_json, "dependencies", {});
                        ensure_path(package_json, "devDependencies", {});
                        add_dep = function (dep, first, dep_name) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!first.url) return [3 /*break*/, 1];
                                        if (/git\+https/.test(first.url)) {
                                            ensure_path(package_json, dep, first.name, first.url);
                                        }
                                        else {
                                            throw new Error("cannot cope with url ".concat(first.url, " yet, no git+https, fix code"));
                                        }
                                        return [3 /*break*/, 5];
                                    case 1:
                                        _a = ensure_path;
                                        _b = [package_json, dep, dep_name];
                                        if (!("version" in first)) return [3 /*break*/, 2];
                                        _c = first.version;
                                        return [3 /*break*/, 4];
                                    case 2: return [4 /*yield*/, cfg.npm_version_for_name(dep_name)];
                                    case 3:
                                        _c = _d.sent();
                                        _d.label = 4;
                                    case 4:
                                        _a.apply(void 0, _b.concat([_c]));
                                        _d.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); };
                        add_npm_packages = function (dep) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, _a, dep_name, first, type_name, type_version, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _i = 0, _a = dep_collection[dep];
                                        _d.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                                        dep_name = _a[_i];
                                        first = dep_collection.dependency_locactions[dep_name][0];
                                        if (!first.npm)
                                            return [3 /*break*/, 5];
                                        debug("adding npm", dep_name, first);
                                        // TODO: care about version
                                        return [4 /*yield*/, add_dep(dep, first, dep_name)];
                                    case 2:
                                        // TODO: care about version
                                        _d.sent();
                                        if (!first.types) return [3 /*break*/, 5];
                                        type_name = "@types/".concat(dep_name);
                                        return [4 /*yield*/, cfg.npm_version_for_name(type_name)];
                                    case 3:
                                        type_version = _d.sent();
                                        debug("got type version ".concat(type_name, " ").concat(type_version));
                                        if (!(type_version !== undefined)) return [3 /*break*/, 5];
                                        _b = ensure_path;
                                        _c = [package_json, "devDependencies", type_name];
                                        return [4 /*yield*/, cfg.npm_version_for_name(type_name)];
                                    case 4:
                                        _b.apply(void 0, _c.concat([_d.sent()]));
                                        _d.label = 5;
                                    case 5:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); };
                        // manually forcing ts-node dependency for now
                        _u = ensure_path;
                        _v = [package_json, "devDependencies", "ts-node"];
                        return [4 /*yield*/, cfg.npm_version_for_name("ts-node")];
                    case 4:
                        // manually forcing ts-node dependency for now
                        _u.apply(void 0, _v.concat([_z.sent()]));
                        return [4 /*yield*/, add_npm_packages("dependencies")];
                    case 5:
                        _z.sent();
                        return [4 /*yield*/, add_npm_packages("devDependencies")];
                    case 6:
                        _z.sent();
                        backup_file(package_json.path);
                        this.packagejsons[0].json = package_json;
                        this.packagejsons[0].flush_protect_user_changes(opts.force);
                        if (!opts.install_npm_packages) return [3 /*break*/, 9];
                        debug("install_npm_packages");
                        to_be_installed = fs.readFileSync(this.packagejson_paths[0], "utf8");
                        p_installed = "".concat(this.packagejson_paths[0], ".installed");
                        installed = fs.existsSync(p_installed) ? fs.readFileSync(p_installed, "utf8") : undefined;
                        info("deciding to run npm_install_cmd in", this.path, this.packagejson_paths[0], p_installed, installed === to_be_installed);
                        if (!(installed !== to_be_installed || !fs.existsSync(path.join(this.path, "node_modules")))) return [3 /*break*/, 8];
                        return [4 /*yield*/, run(cfg.npm_install_cmd[0], { args: cfg.npm_install_cmd.slice(1), cwd: this.path })];
                    case 7:
                        _z.sent();
                        _z.label = 8;
                    case 8:
                        fs.writeFileSync(p_installed, to_be_installed);
                        _z.label = 9;
                    case 9:
                        if (opts.symlink_node_modules_hack) {
                            for (_w = 0, _x = this.tsmonojson.dirs(); _w < _x.length; _w++) {
                                dir = _x[_w];
                                n = "".concat(dir, "/node_modules");
                                if (fs.existsSync(n)) {
                                    fs.unlinkSync(n);
                                }
                                info("hack: symlinking node modules to ".concat(n, " ").concat(path.relative(dir, "".concat(this.path, "/node_modules"))));
                                fs.symlinkSync(path.relative(dir, "".concat(this.path, "/node_modules")), n);
                            }
                        }
                        if (!opts.recurse) return [3 /*break*/, 13];
                        opts2 = clone(opts);
                        opts2.symlink_node_modules_hack = false; // mutually exclusive. when using it ony one repository can be active
                        repositories = Object.values(dep_collection.dependency_locactions).map(function (x) { return x[0].repository; });
                        _y = 0, repositories_1 = repositories;
                        _z.label = 10;
                    case 10:
                        if (!(_y < repositories_1.length)) return [3 /*break*/, 13];
                        r = repositories_1[_y];
                        if (r === undefined)
                            return [3 /*break*/, 12];
                        info("recursing into dependency ".concat(r.path));
                        return [4 /*yield*/, r.update(cfg, opts2)];
                    case 11:
                        _z.sent();
                        _z.label = 12;
                    case 12:
                        _y++;
                        return [3 /*break*/, 10];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.add = function (cfg, dependencies, devDependencies) {
        return __awaiter(this, void 0, void 0, function () {
            var j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // TODO: check prefix "auto" etc to keep unique or overwrite
                        this.init();
                        j = this.tsmonojson.json;
                        j.dependencies = __spreadArray(__spreadArray([], j.dependencies, true), dependencies.filter(function (x) { return !(j.dependencies || []).includes(x); }), true);
                        j.devDependencies = __spreadArray(__spreadArray([], j.devDependencies, true), devDependencies.filter(function (x) { return !(j.devDependencies || []).includes(x); }), true);
                        return [4 /*yield*/, this.update(cfg, { link_to_links: true, install_npm_packages: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Repository;
}());
// COMMAND LINE ARGUMENTS
var parser = new argparse_1.ArgumentParser({
    addHelp: true,
    description: "tsmono (typescript monorepository), see github's README file",
    version: "0.0.1",
});
var sp = parser.addSubparsers({
    title: "sub commands",
    dest: "main_action",
});
var init = sp.addParser("init", { addHelp: true });
var add = sp.addParser("add", { addHelp: true });
add.addArgument("args", { nargs: "*" });
var care_about_remote_checkout = function (x) { return x.addArgument("--care-about-remote-checkout", { action: "storeTrue", help: "on remote site update the checked out repository and make sure they are clean" }); };
var update = sp.addParser("update", { addHelp: true, description: "This also is default action" });
update.addArgument("--symlink-node-modules-hack", { action: "storeTrue" });
update.addArgument("--link-via-root-dirs", { action: "storeTrue", help: "add dependencies by populating root-dirs. See README " });
update.addArgument("--link-to-links", { action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks. Useful to use ctrl-p in vscode to find files. On Windows 10 cconsider activating dev mode to allow creating symlinks without special priviledges." });
update.addArgument("--recurse", { action: "storeTrue" });
update.addArgument("--force", { action: "storeTrue" });
var zip = sp.addParser("zip", { addHelp: true, description: "This also is default action" });
var print_config_path = sp.addParser("print-config-path", { addHelp: true, description: "print tsmon.json path location" });
var write_config_path = sp.addParser("write-sample-config", { addHelp: true, description: "write sample configuration file" });
write_config_path.addArgument("--force", { action: "storeTrue" });
var echo_config_path = sp.addParser("echo-sample-config", { addHelp: true, description: "echo sample config for TSMONO_CONFIG_JSON env var" });
var update_using_rootDirs = sp.addParser("update-using-rootDirs", { addHelp: true, description: "Use rootDirs to link to dependencies essentially pulling all dependecnies, but also allowing to replace dependencies of dependencies this way" });
// update_using_rootDirs.addArgument("--symlink-node-modules-hack", {action: "storeTrue"})
// update_using_rootDirs.addArgument("--link-via-root-dirs", {action: "storeTrue", help: "add dependencies by populating root-dirs. See README "})
// update_using_rootDirs.addArgument("--link-to-links", {action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks"})
update_using_rootDirs.addArgument("--recurse", { action: "storeTrue" });
update_using_rootDirs.addArgument("--force", { action: "storeTrue" });
var commit_all = sp.addParser("commit-all", { addHelp: true, description: "commit all changes of this repository and dependencies" });
commit_all.addArgument("--force", { action: "storeTrue" });
commit_all.addArgument("-message", {});
var push = sp.addParser("push-with-dependencies", { addHelp: true, description: "upload to git repository" });
push.addArgument("--shell-on-changes", { action: "storeTrue", help: "open shell so that you can commit changes" });
push.addArgument("--git-push-remote-location-name", { help: "eg origin" });
care_about_remote_checkout(push);
push.addArgument("--git-remote-config-json", { help: '{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}' });
push.addArgument("--run-remote-command", { help: "remote ssh location to run git pull in user@host:path:cmd" });
var pull = sp.addParser("pull-with-dependencies", { addHelp: true, description: "pull current directory from remote location with dependencies" });
pull.addArgument("--git-remote-config-json", { help: '{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}' });
pull.addArgument("--update", { help: "if there is a tsmono.json also run tsmono update" });
pull.addArgument("--link-to-links", { help: "when --update use --link-to-links see update command for details" });
care_about_remote_checkout(pull);
var clean = sp.addParser("is-clean", { addHelp: true, description: "check whether git repositories on local/ remote side are clean" });
clean.addArgument("--no-local", { action: 'storeTrue', help: "don't look at local directories" });
clean.addArgument("--no-remote", { action: 'storeTrue', help: "don't\t look at remote directories" });
clean.addArgument("--shell", { action: "storeTrue", help: "if dirty start shell so that you can commit" });
clean.addArgument("--git-remote-config-json", { help: '{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}' });
var list_dependencies = sp.addParser("list-local-dependencies", { addHelp: true, description: "list dependencies" });
var from_json_files = sp.addParser("from-json-files", { addHelp: true, description: "try to create tsmono.json fom package.json and tsconfig.json file" });
push.addArgument("--force", { action: "storeTrue", help: "overwrites existing tsconfig.json file" });
var reinstall = sp.addParser("reinstall-with-dependencies", { addHelp: true, description: "removes node_modules and reinstalls to match current node version" });
reinstall.addArgument("--link-to-links", { action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks" });
var watch = sp.addParser("watch", { addHelp: true });
var esbuild_server_client_dev = sp.addParser("esbuild-server-client-dev", { addHelp: true, description: "check whether git repositories on local/ remote side are clean" });
esbuild_server_client_dev.addArgument("--server-ts-file", { help: "server.ts" });
esbuild_server_client_dev.addArgument("--web-ts-file", { help: "web client .ts files" });
var args = parser.parseArgs();
var dot_git_ignore_hack = function () { return __awaiter(void 0, void 0, void 0, function () {
    var f, lines, to_be_added;
    return __generator(this, function (_a) {
        if (!fs.pathExistsSync("tsmono.json"))
            return [2 /*return*/];
        f = ".gitignore";
        lines = (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "").split("\n");
        to_be_added = [
            "/node_modules",
            "/.vscode",
            "/dist",
            "/.fyn",
            "/tsconfig.json.protect",
            "/package.json.installed",
            "/package.json.protect",
            "/package.json",
            "/tsconfig.json", // derived by tsmono, contains local setup paths
        ].filter(function (a) { return !lines.find(function (x) { return x.startsWith(a); }); });
        if (to_be_added.length > 0) {
            fs.writeFileSync(f, __spreadArray(__spreadArray([], lines, true), to_be_added, true).join("\n"), "utf8");
        }
        return [2 /*return*/];
    });
}); };
var tslint_hack = function () { return __awaiter(void 0, void 0, void 0, function () {
    var j;
    return __generator(this, function (_a) {
        // this is biased  but its going to save your ass
        if (!fs.existsSync("tslint.json")) {
            fs.writeFileSync("tslint.json", "\n    {\n        \"extends\": [\n            \"tslint:recommended\"\n        ],\n        \"rules\": {\n            \"no-floating-promises\": true,\n            \"no-return-await\": true,\n            \"await-promise\": [true, \"PromiseLike\"],\n            \"max-line-length\": false,\n            \"variable-name\": false\n        }\n    }\n    ", "utf8");
        }
        else {
            j = parse_json_file("tslint.json");
            if (!j.rules["no-floating-promises"] && !j.rules["await-promise"])
                throw new Error("please add\n\n            \"no-floating-promises\": true,\n            \"no-return-await\": true,\n            \"await-promise\": [true, \"PromiseLike\"],\n\n            to your tslint.json 's rules section because it might save your ass\n      ");
        }
        return [2 /*return*/];
    });
}); };
var run_tasks = function (tasks) { return __awaiter(void 0, void 0, void 0, function () {
    var lock, with_user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lock = (0, lock_1.createLock)({ preventExit: true });
                with_user = function (run) { return __awaiter(void 0, void 0, void 0, function () {
                    var release;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, lock.aquire_lock()];
                            case 1:
                                release = _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, , 4, 5]);
                                return [4 /*yield*/, run()];
                            case 3: return [2 /*return*/, _a.sent()];
                            case 4:
                                release();
                                return [7 /*endfinally*/];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, Promise.all(tasks.map(function (x) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, with_user(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                        return [2 /*return*/, info("starting ".concat(x.task))];
                                    }); }); })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, x.start({ with_user: function (run) {
                                                return with_user(function () { return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        info("!=== task ".concat(x.task, " requires your attention"));
                                                        return [2 /*return*/, run()];
                                                    });
                                                }); });
                                            } })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, with_user(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                            return [2 /*return*/, info("done ".concat(x.task))];
                                        }); }); })];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var hd, cache, config, config_from_home_dir_path, env_config, homedir_config, cfg, ssh_cmd, p, ensure_is_git, update, d, dd, add_1, _i, _a, v, p_1, _b, _c, r, pwd, package_contents, _d, tsconfig_contents, _e, tsmono_contents, _f, _g, _h, k, v, _j, _k, _l, pack, version, cwd, reponame, config_1, sc, remote_exists, e_1, items, _m, _o, _p, path_, p_, repo, p_2, repositories, config_2, sc_1, results_2, check_local_1, check_remote_1, tasks, _q, results_1, i, p_3, config_3, basenames_to_pull, seen, ensure_repo_committed_and_clean_1, ensure_remote_location_setup_1, remote_update_1, push_to_remote_location, _r, _s, rep, force, p_4, _t, _u, r, stdout, p_5, dep_collection, seen, _v, _w, _x, k, v, r, _y, _z, r, package_json_installed, server_ts_1, web_ts_1, processes_1, spawn_1, compile_server_1, compile_web_1, restart_server_1, recompileAndStart_1, timer_1;
    return __generator(this, function (_0) {
        switch (_0.label) {
            case 0:
                hd = (0, os_1.homedir)();
                cache = new DirectoryCache("".concat(hd, "/.tsmono/cache"));
                config = {
                    cache: cache,
                    fetch_ttl_seconds: 60 * 24,
                    bin_sh: "/bin/sh",
                    npm_install_cmd: ["fyn"],
                };
                config_from_home_dir_path = path.join(hd, ".tsmmono.json");
                env_config = process.env.TSMONO_CONFIG_JSON
                    ? JSON.parse(process.env.TSMONO_CONFIG_JSON)
                    : {};
                homedir_config = fs.existsSync(config_from_home_dir_path)
                    ? JSON.parse(fs.readFileSync(config_from_home_dir_path, "utf8"))
                    : {};
                cfg = Object.assign({}, config, cfg_api(config), homedir_config, env_config);
                ssh_cmd = function (server) { return function (stdin, args) { return __awaiter(void 0, void 0, Promise, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, run("ssh", __assign({ args: [server], stdin: stdin }, args))];
                    });
                }); }; };
                p = new Repository(cfg, process.cwd(), {});
                ensure_is_git = function (r) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!!fs.existsSync(path.join(r.path, ".git"))) return [3 /*break*/, 2];
                                console.log("Please add .git so that this dependency ".concat(r.path, " can be pushed"));
                                return [4 /*yield*/, run(cfg.bin_sh, { cwd: r.path, stdout1: true })];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); };
                update = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, p.update(cfg, { link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: args.symlink_node_modules_hack, recurse: args.recurse, force: args.force })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                if (args.main_action === "init") {
                    p.init();
                    return [2 /*return*/];
                }
                if (!(args.main_action === "add")) return [3 /*break*/, 2];
                d = [];
                dd = [];
                add_1 = d;
                for (_i = 0, _a = args.args; _i < _a.length; _i++) {
                    v = _a[_i];
                    if (v === "-d") {
                        add_1 = dd;
                    }
                    dd.push(v);
                }
                return [4 /*yield*/, p.add(cfg, d, dd)];
            case 1:
                _0.sent();
                return [2 /*return*/];
            case 2:
                if (args.main_action === "zip") {
                    console.log("TODO : zip target.zip $( echo tsconfig.json; echo package.json; find -L  src | grep -ve 'tsmono.*tsmono|\\.git'");
                }
                if (!(args.main_action === "update")) return [3 /*break*/, 6];
                return [4 /*yield*/, update()];
            case 3:
                _0.sent();
                return [4 /*yield*/, tslint_hack()];
            case 4:
                _0.sent();
                return [4 /*yield*/, dot_git_ignore_hack()];
            case 5:
                _0.sent();
                return [2 /*return*/];
            case 6:
                if (!(args.main_action === "update_using_rootDirs")) return [3 /*break*/, 8];
                // await update_using_rootDirs();
                return [4 /*yield*/, tslint_hack()];
            case 7:
                // await update_using_rootDirs();
                _0.sent();
                return [2 /*return*/];
            case 8:
                if (args.main_action === "print-config-path") {
                    console.log("config path:", config_from_home_dir_path);
                    return [2 /*return*/];
                }
                if (args.main_action === "write-sample-config") {
                    if (!fs.existsSync(config_from_home_dir_path) || args.force) {
                        fs.writeFileSync(config_from_home_dir_path, config);
                    }
                    else {
                        console.log(config_from_home_dir_path, "not written because it exists. Try --force");
                    }
                    return [2 /*return*/];
                }
                if (args.main_action === "echo-sample-config") {
                    console.log("TSMONO_CONFIG_JSON=".concat(JSON.stringify(config)));
                    return [2 /*return*/];
                }
                if (args.main_action === "add") {
                    throw new Error("TODO");
                }
                if (args.main_action === "list-local-dependencies") {
                    silent = true;
                    p_1 = new Repository(cfg, process.cwd(), {});
                    for (_b = 0, _c = p_1.repositories(); _b < _c.length; _b++) {
                        r = _c[_b];
                        console.log("rel-path: ", r.path);
                    }
                }
                if (!(args.main_action === "from-json-files")) return [3 /*break*/, 15];
                // try creating tsmono from json files
                // TODO: test this
                if (fs.existsSync("tsmono.json") && !args.force) {
                    console.log("not overwriting tsmono.json, use --force");
                    return [2 /*return*/];
                }
                console.log("pwd", process.cwd());
                pwd = process.cwd();
                if (!fs.existsSync("package.json")) return [3 /*break*/, 10];
                return [4 /*yield*/, readJsonFile(path.join(pwd, "./package.json"))];
            case 9:
                _d = (_0.sent());
                return [3 /*break*/, 11];
            case 10:
                _d = undefined;
                _0.label = 11;
            case 11:
                package_contents = _d;
                if (!fs.existsSync("tsconfig.json")) return [3 /*break*/, 13];
                return [4 /*yield*/, readJsonFile(path.join(pwd, "./tsconfig.json"))];
            case 12:
                _e = (_0.sent());
                return [3 /*break*/, 14];
            case 13:
                _e = undefined;
                _0.label = 14;
            case 14:
                tsconfig_contents = _e;
                if (package_contents === undefined && tsconfig_contents === undefined) {
                    console.log("Neither package.json nor tsconfig.json found");
                    return [2 /*return*/];
                }
                tsconfig_contents = tsconfig_contents || {};
                tsmono_contents = {
                    package: {},
                    dependencies: [],
                    devDependencies: [],
                    tsconfig: tsconfig_contents || {},
                };
                // process package.json
                for (_f = 0, _g = Object.entries(package_contents || {}); _f < _g.length; _f++) {
                    _h = _g[_f], k = _h[0], v = _h[1];
                    if (k === "dependencies" || k === "devDependencies") {
                        for (_j = 0, _k = Object.entries(v); _j < _k.length; _j++) {
                            _l = _k[_j], pack = _l[0], version = _l[1];
                            tsmono_contents[k].push("".concat(pack, ";version=").concat(version));
                        }
                    }
                    else {
                        tsmono_contents.package[k] = v;
                    }
                }
                fs.writeFileSync("tsmono.json", JSON.stringify(tsmono_contents, undefined, 2), "utf8");
                _0.label = 15;
            case 15:
                if (!(args.main_action === "pull-with-dependencies")) return [3 /*break*/, 30];
                cwd = process.cwd();
                reponame = path.basename(cwd);
                config_1 = JSON.parse(args.git_remote_config_json);
                sc = ssh_cmd(config_1.server);
                remote_exists = true;
                _0.label = 16;
            case 16:
                _0.trys.push([16, 18, , 19]);
                return [4 /*yield*/, sc("\n      [ -f ".concat(config_1.repositoriesPath, "/").concat(reponame, "/.git/config ]\n      "), { stdout1: true })];
            case 17:
                _0.sent();
                return [3 /*break*/, 19];
            case 18:
                e_1 = _0.sent();
                info("remote directory ".concat(config_1.repositoriesPath, "/").concat(reponame, "/.git/config does not exit, cannot determine dependencies"));
                remote_exists = false;
                return [3 /*break*/, 19];
            case 19:
                if (!remote_exists) return [3 /*break*/, 21];
                return [4 /*yield*/, sc("\n            cd ".concat(config_1.repositoriesPath, "/").concat(reponame, " && tsmono list-local-dependencies\n      "))];
            case 20:
                _m = (_0.sent()).split("\n").filter(function (x) { return /rel-path: /.test(x); }).map(function (x) { return x.slice(11); });
                return [3 /*break*/, 22];
            case 21:
                _m = [];
                _0.label = 22;
            case 22:
                items = _m;
                info("pulling " + JSON.stringify(items));
                _o = 0, _p = [].concat(["../".concat(reponame)]).concat(items);
                _0.label = 23;
            case 23:
                if (!(_o < _p.length)) return [3 /*break*/, 30];
                path_ = _p[_o];
                info("pulling ".concat(path_));
                p_ = path.join(cwd, path_);
                repo = (0, path_1.basename)(p_);
                if ((config_1.ignoreWhenPulling || []).includes(repo))
                    return [3 /*break*/, 29];
                if (!fs.existsSync(p_)) {
                    info("creating ".concat(p_));
                    fs.mkdirpSync(p_);
                }
                return [4 /*yield*/, sc("\n        exec 2>&1\n        set -x\n        bare=".concat(config_1.bareRepositoriesPath, "/").concat(repo, "\n        repo=").concat(config_1.repositoriesPath, "/").concat(repo, "\n        [ -d $bare ] || {\n          mkdir -p $bare; ( cd $bare; git init --bare )\n          ( cd $repo;\n            git remote add origin ").concat(path.relative(path.join(config_1.repositoriesPath, repo), config_1.bareRepositoriesPath), "/").concat(repo, "\n            git push --set-upstream origin master\n          )\n        }\n        ").concat(args.care_about_remote_checkout ? "( cd $repo; git pull  )" : "", "\n        "))];
            case 24:
                _0.sent();
                if (!!fs.existsSync(path.join(p_, ".git/config"))) return [3 /*break*/, 26];
                return [4 /*yield*/, run("git", { args: ["clone", "".concat(config_1.server, ":").concat(config_1.bareRepositoriesPath, "/").concat(repo), p_] })];
            case 25:
                _0.sent();
                _0.label = 26;
            case 26:
                info("pulling ".concat(p_, " .."));
                return [4 /*yield*/, run("git", { args: ["pull"], cwd: p_ })];
            case 27:
                _0.sent();
                if (!(args.update && fs.existsSync(path.join(p_, "tsmono.json")))) return [3 /*break*/, 29];
                p_2 = new Repository(cfg, p_, {});
                return [4 /*yield*/, p_2.update(cfg, {
                        link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: false, recurse: true, force: true,
                        // , update_cmd: {executable: "npm", args: ["i"]}
                    })];
            case 28:
                _0.sent();
                _0.label = 29;
            case 29:
                _o++;
                return [3 /*break*/, 23];
            case 30:
                if (!(args.main_action === "is-clean")) return [3 /*break*/, 32];
                info("using local dependencies as reference");
                repositories = p.repositories({ includeThis: true });
                config_2 = args.git_remote_config_json ? JSON.parse(args.git_remote_config_json) : undefined;
                sc_1 = function () { return ssh_cmd(config_2.server); };
                results_2 = [];
                check_local_1 = function (r) { return function (o) { return __awaiter(void 0, void 0, void 0, function () {
                    var is_clean, clean_before, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                is_clean = function () { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = "";
                                            return [4 /*yield*/, run("git", { args: ["diff"], cwd: r.path })];
                                        case 1: return [2 /*return*/, (_a === (_b.sent()) ? "clean" : "dirty")];
                                    }
                                }); }); };
                                return [4 /*yield*/, is_clean()];
                            case 1:
                                clean_before = _e.sent();
                                if (!(clean_before === "dirty" && args.shell)) return [3 /*break*/, 3];
                                return [4 /*yield*/, o.with_user(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    info("".concat(r.path, " is not clean, starting shell"));
                                                    return [4 /*yield*/, run(cfg.bin_sh, { cwd: r.path, stdout1: true })];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 2:
                                _e.sent();
                                _e.label = 3;
                            case 3:
                                _b = (_a = results_2).push;
                                _d = (_c = "".concat(r.basename, ": ").concat(clean_before, " -> ")).concat;
                                return [4 /*yield*/, is_clean()];
                            case 4:
                                _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                                return [2 /*return*/];
                        }
                    });
                }); }; };
                check_remote_1 = function (r) { return function (o) { return __awaiter(void 0, void 0, void 0, function () {
                    var is_clean, clean_before, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                is_clean = function () { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = "";
                                            return [4 /*yield*/, sc_1()("cd ".concat(config_2.repositoriesPath, "/").concat(r.basename, "; git diff"))];
                                        case 1: return [2 /*return*/, (_a === (_b.sent()) ? "clean" : "dirty")];
                                    }
                                }); }); };
                                return [4 /*yield*/, is_clean()];
                            case 1:
                                clean_before = _e.sent();
                                if (!(clean_before === "dirty" && args.shell)) return [3 /*break*/, 3];
                                return [4 /*yield*/, o.with_user(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    info("".concat(r.path, " is not clean, starting shell"));
                                                    return [4 /*yield*/, run("ssh", { args: [config_2.server, "cd ".concat(config_2.repositoriesPath, "/").concat(r.basename, "; exec $SHELL -i")], stdout1: true })];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 2:
                                _e.sent();
                                _e.label = 3;
                            case 3:
                                _b = (_a = results_2).push;
                                _d = (_c = "remote ".concat(r.basename, ": ").concat(clean_before, " -> ")).concat;
                                return [4 /*yield*/, is_clean()];
                            case 4:
                                _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                                return [2 /*return*/];
                        }
                    });
                }); }; };
                tasks = __spreadArray(__spreadArray([], ((!args.no_local)
                    ? repositories.map(function (x) { return ({ task: "local clean? ".concat(x.path), start: check_local_1(x) }); })
                    : []), true), ((!args.no_remote)
                    ? repositories.map(function (x) { return ({ task: "remote clean? ".concat(x.path), start: check_remote_1(x) }); })
                    : []), true);
                return [4 /*yield*/, run_tasks(tasks)];
            case 31:
                _0.sent();
                info("=== results ===");
                for (_q = 0, results_1 = results_2; _q < results_1.length; _q++) {
                    i = results_1[_q];
                    info(i);
                }
                _0.label = 32;
            case 32:
                if (!(args.main_action === "push-with-dependencies")) return [3 /*break*/, 36];
                p_3 = new Repository(cfg, process.cwd(), {});
                config_3 = JSON.parse(args.git_remote_config_json);
                basenames_to_pull = [];
                seen = [] // TODO: why aret there duplicates ?
                ;
                ensure_repo_committed_and_clean_1 = function (r) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                info(r.path, "checking for cleanness");
                                _a = args.shell_on_changes;
                                if (!_a) return [3 /*break*/, 2];
                                _b = "";
                                return [4 /*yield*/, run("git", { args: ["diff"], cwd: r.path })];
                            case 1:
                                _a = _b !== (_c.sent());
                                _c.label = 2;
                            case 2:
                                if (!_a) return [3 /*break*/, 4];
                                info("".concat(r.path, " is dirty, please commit changes starting shell"));
                                return [4 /*yield*/, run(cfg.bin_sh, { cwd: r.path, stdout1: true })];
                            case 3:
                                _c.sent();
                                _c.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                ensure_remote_location_setup_1 = function (r) { return __awaiter(void 0, void 0, void 0, function () {
                    var reponame, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                info(r.path, "ensuring remote setup");
                                reponame = r.basename;
                                _a = "";
                                return [4 /*yield*/, run("git", { expected_exitcodes: [0, 1], args: "config --get remote.".concat(config_3.gitRemoteLocationName, ".url").split(" "), cwd: r.path })];
                            case 1:
                                if (!(_a === (_b.sent()))) return [3 /*break*/, 5];
                                // local side
                                return [4 /*yield*/, run("git", { args: "remote add ".concat(config_3.gitRemoteLocationName, " ").concat(config_3.server, ":").concat(config_3.bareRepositoriesPath, "/").concat(reponame).split(" "), cwd: r.path })
                                    // remote side
                                ];
                            case 2:
                                // local side
                                _b.sent();
                                // remote side
                                return [4 /*yield*/, run("ssh", { args: [config_3.server], cwd: r.path, stdin: "\n          bare=".concat(config_3.bareRepositoriesPath, "/").concat(reponame, "\n          target=").concat(config_3.repositoriesPath, "/").concat(reponame, "\n          [ -d \"$bare\" ] || mkdir -p \"$bare\"; ( cd \"$bare\"; git init --bare; )\n          ").concat(args.care_about_remote_checkout ? "[ -d \"$target\" ] || ( git clone $bare $target; cd $target; git config pull.rebase true; )" : "", "\n          ") })
                                    // local side .git/config
                                ];
                            case 3:
                                // remote side
                                _b.sent();
                                // local side .git/config
                                return [4 /*yield*/, run("git", { args: "push --set-upstream ".concat(config_3.gitRemoteLocationName, " master").split(" "), cwd: r.path })];
                            case 4:
                                // local side .git/config
                                _b.sent();
                                _b.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); };
                remote_update_1 = function (r) { return __awaiter(void 0, void 0, void 0, function () {
                    var reponame;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!args.care_about_remote_checkout)
                                    return [2 /*return*/];
                                reponame = r.basename;
                                return [4 /*yield*/, run("ssh", { args: [config_3.server],
                                        cwd: r.path, stdin: "\n          target=".concat(config_3.repositoriesPath, "/").concat(reponame, "\n          cd $target\n          git pull\n      ") })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                push_to_remote_location = function (r) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ensure_is_git(r)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, ensure_repo_committed_and_clean_1(r)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, ensure_remote_location_setup_1(r)
                                    // 2 push
                                ];
                            case 3:
                                _a.sent();
                                if (!config_3.gitRemoteLocationName) return [3 /*break*/, 5];
                                info("... pushing in ".concat(r.path, " ..."));
                                return [4 /*yield*/, run("git", { args: ["push", config_3.gitRemoteLocationName], cwd: r.path })];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5: 
                            // 3 checkout
                            return [4 /*yield*/, remote_update_1(r)];
                            case 6:
                                // 3 checkout
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                _r = 0, _s = p_3.repositories({ includeThis: true });
                _0.label = 33;
            case 33:
                if (!(_r < _s.length)) return [3 /*break*/, 36];
                rep = _s[_r];
                return [4 /*yield*/, push_to_remote_location(rep)];
            case 34:
                _0.sent();
                _0.label = 35;
            case 35:
                _r++;
                return [3 /*break*/, 33];
            case 36:
                if (!(args.main_action === "commit-all")) return [3 /*break*/, 43];
                force = args.force;
                p_4 = new Repository(cfg, process.cwd(), {});
                _t = 0, _u = p_4.repositories();
                _0.label = 37;
            case 37:
                if (!(_t < _u.length)) return [3 /*break*/, 43];
                r = _u[_t];
                if (!fs.existsSync(path.join(r.path, ".git"))) return [3 /*break*/, 42];
                return [4 /*yield*/, run("git", { args: ["diff"], cwd: r.path })];
            case 38:
                stdout = _0.sent();
                if (!(stdout !== "")) return [3 /*break*/, 42];
                console.log(stdout);
                if (!force) return [3 /*break*/, 40];
                return [4 /*yield*/, run("git", { args: ["commit", "-am", args.message], cwd: r.path })];
            case 39:
                _0.sent();
                return [3 /*break*/, 42];
            case 40:
                console.log(r.path, "has uncommited changes, commit now");
                return [4 /*yield*/, run(cfg.bin_sh, { cwd: r.path, stdout1: true })];
            case 41:
                _0.sent();
                _0.label = 42;
            case 42:
                _t++;
                return [3 /*break*/, 37];
            case 43:
                if (!(args.main_action === "reinstall-with-dependencies")) return [3 /*break*/, 45];
                p_5 = new Repository(cfg, process.cwd(), {});
                dep_collection = new DependencyCollection(cfg, p_5.path, p_5.tsmonojson.dirs());
                dep_collection.dependencies_of_repository(p_5, true, { addLinks: false });
                dep_collection.do();
                dep_collection.print_warnings();
                seen = [] // TODO: why aret there duplicates ?
                ;
                for (_v = 0, _w = Object.entries(dep_collection.dependency_locactions); _v < _w.length; _v++) {
                    _x = _w[_v], k = _x[0], v = _x[1];
                    r = v[0].repository;
                    if (r) {
                        if (seen.includes(r.path))
                            continue;
                        seen.push(r.path);
                    }
                }
                for (_y = 0, _z = p_5.repositories(); _y < _z.length; _y++) {
                    r = _z[_y];
                    fs.removeSync(path.join(r.path, "node_modules"));
                    package_json_installed = path.join(r.path, "package.json.installed");
                    if (fs.existsSync(package_json_installed))
                        fs.removeSync(package_json_installed);
                }
                return [4 /*yield*/, p_5.update(cfg, { link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: false, recurse: true, force: true,
                        // , update_cmd: {executable: "npm", args: ["i"]}
                    })];
            case 44:
                _0.sent();
                _0.label = 45;
            case 45:
                if (args.main_action == "esbuild-server-client-dev") {
                    server_ts_1 = args.server_ts_file;
                    web_ts_1 = args.web_ts_file;
                    processes_1 = {};
                    process.on('SIGINT', function () { for (var _i = 0, _a = Object.values(processes_1); _i < _a.length; _i++) {
                        var v = _a[_i];
                        v.kill();
                    } process.exit(); });
                    spawn_1 = function (x, cmd, args, echo) { return new Promise(function (r, j) {
                        var _a, _b;
                        var out = "";
                        if (processes_1[x]) {
                            console.log('killing');
                            processes_1[x].kill();
                        }
                        var y = (0, child_process_1.spawn)(cmd, args, { stdio: [undefined, 'pipe', 1] });
                        console.log("== ".concat(x, " spawned"));
                        processes_1[x] = y;
                        (_a = y.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (s) { out += s; if (echo)
                            console.log("" + s); });
                        (_b = y.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (s) { out += s; if (echo)
                            console.log("" + s); });
                        processes_1[x].on("close", function (code, signal) {
                            if (code == 0)
                                r(undefined);
                            fs.writeFileSync("".concat(x, ".log"), out);
                            console.log("== ".concat(x, " exited with : ").concat(code, " "));
                            if (!echo)
                                console.log(out);
                            if (code == 0)
                                console.log(chalk_1.default.green("".concat(x, " exited gracefully")));
                            else
                                console.log(chalk_1.default.red("".concat(x, " exited with code ").concat(code)));
                            j("code ".concat(code));
                        });
                    }); };
                    compile_server_1 = function () { return spawn_1("server_ts", 'esbuild', ["--outdir=./dist", "--bundle", "--platform=node", server_ts_1]); };
                    compile_web_1 = function () { return spawn_1("web_ts", 'esbuild', ["--outdir=./dist", "--bundle", "--sourcemap", web_ts_1]); };
                    restart_server_1 = function () { return spawn_1("server", 'node', [path.join('dist/', path.basename(server_ts_1).replace(/\.ts/, '.js'))], true); };
                    recompileAndStart_1 = function () {
                        compile_web_1().catch(function (e) { });
                        if (server_ts_1)
                            compile_server_1().then(function () { return restart_server_1(); }).catch(function (e) { });
                    };
                    timer_1 = "wait";
                    Promise.resolve().then(function () { return __importStar(require('chokidar')); }).then(function (chokidar) {
                        chokidar.watch('.', {
                            followSymlinks: true,
                            ignored: /dist.*|.log/,
                            // ignored: /(^|[\/\\])\../,
                            awaitWriteFinish: {
                                stabilityThreshold: 500,
                                pollInterval: 100
                            },
                        })
                            .on('ready', function () { timer_1 = undefined; console.log(chalk_1.default.green("chokidar setup")); })
                            .on('all', function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            if (timer_1 == "wait")
                                return;
                            if (timer_1)
                                clearTimeout(timer_1);
                            timer_1 = setTimeout(function () {
                                for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                                    var arg = args_1[_i];
                                    console.log("recompiling cause ", JSON.stringify(args), 'changed');
                                }
                                recompileAndStart_1();
                            }, 50);
                        });
                    });
                    recompileAndStart_1();
                }
                return [2 /*return*/];
        }
    });
}); };
process.on("unhandledRejection", function (error) {
    console.error(error); // This prints error with stack included (as for normal errors)
    if (error.message)
        console.error(error.message); // the error above does not print the message for whatever reason, so do so
    throw error; // Following best practices re-throw error and let the process exit with error code
});
main().then(function () { }, function (e) {
    console.log(chalk_1.default.red(e));
    process.exit(1);
});
