"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var debug_1 = __importDefault(require("debug"));
var fs = __importStar(require("fs-extra"));
var JSON5 = __importStar(require("json5"));
var path = __importStar(require("path"));
var debug = debug_1.default("tsmono");
var btoa_1 = __importDefault(require("btoa"));
var child_process_1 = require("child_process");
var cross_fetch_1 = require("cross-fetch");
// import deepequal from "deep-equal"
var deep_equal_1 = __importDefault(require("deep-equal"));
var deepmerge_1 = __importDefault(require("deepmerge"));
var os_1 = require("os");
var path_1 = require("path");
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
var unique = function (x) {
    return x.filter(function (v, i) { return x.indexOf(v) === i; });
};
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
    assert(a.trim() === b.trim(), "assertion " + JSON.stringify(a) + " === " + JSON.stringify(b) + " failed");
};
var run = function (cmd, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var args, stdout;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                args = opts.args || [];
                info("running", cmd, args, "in", opts.cwd);
                stdout = "";
                // duplicate code
                return [4 /*yield*/, new Promise(function (a, b) {
                        var child = child_process_1.spawn(cmd, args, Object.assign(opts, {
                            stdio: ["pipe", "pipe", 2],
                        }));
                        if ("stdin" in opts && child.stdin) {
                            // @ts-ignore
                            child.stdin.setEncoding("utf8");
                            child.stdin.write(opts.stdin);
                        }
                        // @ts-ignore
                        child.stdin.end();
                        if (!child.stdout)
                            throw new Error("child.stdout is null");
                        child.stdout.on("data", function (s) { return stdout += s; });
                        child.on("close", function (code, signal) {
                            var exitcodes = opts.exitcodes || [0];
                            if (exitcodes.includes(code))
                                a();
                            b(cmd.toString() + " " + args.join(" ").toString() + " failed with code " + code);
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
        return __awaiter(this, void 0, void 0, function () {
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
        return this.path + "/" + btoa_1.default(key);
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
    var l = s.split(";");
    var r = { name: l[0] };
    if (/git\+https/.test(r.name)) {
        r.url = r.name;
        r.name = path.basename(r.name).replace(/\.git$/, "");
    }
    for (var _i = 0, _a = l.slice(1); _i < _a.length; _i++) {
        var v = _a[_i];
        var x = v.split("=");
        if (x.length >= 2) {
            x = [x[0], x.slice(1).join("=")];
            if (x[0] === "version")
                r.version = x[1];
            else if (x[0] === "name")
                r.name = x[1];
            else
                throw new Error("bad key=name pair: " + v);
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
        return cfg.cache.get_async("fetch-" + name + "-registry.npmjs.org", function () { return __awaiter(void 0, void 0, void 0, function () {
            var url, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "https://registry.npmjs.org/" + encodeURIComponent(name);
                        return [4 /*yield*/, cross_fetch_1.fetch(url)];
                    case 1:
                        res = _a.sent();
                        if (res.status !== 200)
                            throw new Error("fetching " + url);
                        // returns {"error":"not found"} if package doesn't exist
                        return [2 /*return*/, res.json()];
                }
            });
        }); }, cfg.fetch_ttl_seconds);
    };
    var npm_version_for_name = function (name) { return __awaiter(void 0, void 0, void 0, function () {
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
                    lock.json[name] = "^" + r["dist-tags"].latest;
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
        var bak = path + ".bak";
        if (fs.existsSync(bak))
            fs.renameSync(path, bak);
    }
};
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
            throw new Error("get_path problem getting key " + v + ", args " + args);
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
    if (protect_path === void 0) { protect_path = path + ".protect"; }
    if (fs.existsSync(protect_path) && fs.existsSync(path)) {
        if (!force && fs.readFileSync(protect_path, "utf8") !== fs.readFileSync(path, "utf8"))
            // TODO nicer diff or allow applying changes to tsmono.json
            throw new Error("mv " + protect_path + " " + path + " to continue. Not overwriting your changes. Use --force to force");
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
            try {
                this.json_on_disc = JSON5.parse(s);
            }
            catch (e) {
                throw new Error("syntax error " + e + " in " + this.path + ", contents " + s);
            }
            this.json = JSON5.parse(s);
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
        if (!deep_equal_1.default(this.json_on_disc, this.json)) {
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
    TSMONOJSONFile.prototype.init = function (tsconfig) {
        ensure_path(this.json, "name", "");
        ensure_path(this.json, "version", "0.0.0");
        ensure_path(this.json, "package-manager-install-cmd", ["fyn"]);
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
        r.push(k + ";version=" + v);
    }
    return r;
};
var dependency_to_str = function (d) {
    return d.name + " " + (d.npm && d.repository ? "npm and repository?" : (d.repository ? "from " + d.repository.path : "from npm " + (d.version ? d.version : ""))) + " requested from " + d.origin;
};
var DependencyCollection = /** @class */ (function () {
    function DependencyCollection(origin, dirs) {
        this.origin = origin;
        this.dirs = dirs;
        this.dependency_locactions = {};
        this.dependencies = [];
        this.devDependencies = [];
        this.todo = [];
        this.recursed = [];
    }
    DependencyCollection.prototype.print_warnings = function () {
        var _loop_1 = function (k, v) {
            // TODO: check that all v's are same constraints ..
            var npms = v.filter(function (x) { return x.npm; });
            var no_npms = v.filter(function (x) { return !x.npm; });
            if (npms.length > 0 && no_npms.length > 0)
                warning("WARNING: " + this_1.origin + " dependency " + k + " requested as npm and from disk, choosing first " + v.map(dependency_to_str).join("\n"));
            // check version match etc
            var package_json_cache = {};
            var all_versions = [];
            var with_version = v.map(function (dep) {
                // hack just removing leading ^ - should look at lock files (fyn, node, ..) instead - but this probably is good enough
                var f = function (x) { return x.replace("^", ""); };
                var versions = [];
                if (dep.version)
                    versions.push(f(dep.version));
                if (dep.origin) {
                    var p = dep.origin + "/package.json";
                    if (!(dep.origin in package_json_cache) && fs.existsSync(p)) {
                        package_json_cache[dep.origin] = JSON5.parse(fs.readFileSync(p, "utf8"));
                        ["dependencies", "devDependencies"].forEach(function (d) {
                            var x = (dep.origin === undefined)
                                ? undefined
                                : get_path(package_json_cache[dep.origin], d, k, undefined);
                            if (x !== undefined)
                                versions.push(f(x));
                        });
                    }
                    else if (dep.version) {
                        versions.push(f(dep.version));
                    }
                }
                all_versions = __spreadArrays(all_versions, versions);
                return { dep: dep, versions: versions };
            }).filter(function (x) { return x.versions.length > 0; });
            if (unique(all_versions).length > 1) {
                warning("WARNING: " + this_1.origin + " transient dependencies " + k + " with competing versions found:");
                for (var _i = 0, with_version_1 = with_version; _i < with_version_1.length; _i++) {
                    var v_1 = with_version_1[_i];
                    warning(v_1.dep.origin, v_1.versions);
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.entries(this.dependency_locactions); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            _loop_1(k, v);
        }
    };
    DependencyCollection.prototype.dependencies_of_repository = function (r, dev) {
        var _this = this;
        // add dependencies r to todo list to be looked at
        var deps = r.dependencies();
        var add = function (key, filter) {
            if (filter === void 0) { filter = function (x) { return true; }; }
            _this.todo = __spreadArrays(_this.todo, deps[key]);
            _this[key] = __spreadArrays(_this[key], deps[key].map(function (x) { return x.name; }).filter(filter));
        };
        add("dependencies");
        if (dev === true || dev === "dev-types")
            add("devDependencies", function (x) { return dev !== "dev-types" || /^@types/.test(x); });
    };
    DependencyCollection.prototype.do = function () {
        var next;
        // tslint:disable-next-line: no-conditional-assignment
        while (next = this.todo.shift()) {
            this.find_and_recurse_dependency(next);
        }
    };
    DependencyCollection.prototype.find_and_recurse_dependency = function (dep) {
        var locations = ensure_path(this.dependency_locactions, dep.name, []);
        locations.push(dep);
        if (this.recursed.includes(dep.name))
            return;
        this.recursed.push(dep.name);
        if (dep.npm)
            return; // nothing to do
        var dirs_lookup = this.dirs.map(function (x) { return path.join(x, dep.name); });
        verbose("dirs_lookup", dirs_lookup);
        var d = dirs_lookup.find(function (dir) { return fs.existsSync(dir); });
        if (!d) {
            info("dependency " + dependency_to_str(dep) + " not found, forcing npm");
            dep.npm = true;
            return;
        }
        var r = new Repository(d);
        dep.repository = r;
        // devDependencies are likely to contain @types thus pull them, too ?
        // TODO: only pull @types/*?
        this.dependencies_of_repository(r, "dev-types");
    };
    return DependencyCollection;
}());
var Repository = /** @class */ (function () {
    function Repository(path) {
        this.path = path;
        if (/\/\//.test(path))
            throw new Error("bad path " + path);
        this.tsmonojson = new TSMONOJSONFile(path + "/tsmono.json");
        this.packagejson_path = path + "/package.json";
        this.packagejson = new JSONFile(this.packagejson_path);
    }
    Repository.prototype.flush = function () {
        this.tsmonojson.flush();
        this.packagejson.flush();
    };
    Repository.prototype.init = function () {
        var tsconfig = path.join(this.path, "tsconfig.json");
        this.tsmonojson.init(fs.existsSync(tsconfig) ? JSON5.parse(fs.readFileSync(tsconfig, "utf8")) : {});
    };
    Repository.prototype.dependencies = function () {
        var _this = this;
        var to_dependency = function (dep) { return parse_dependency(dep, _this.path); };
        // get dependencies from
        // tsmono.json
        // package.json otherwise
        if (fs.existsSync(this.path + "/tsmono.json")) {
            return {
                dependencies: clone(get_path(this.tsmonojson.json, "dependencies", [])).map(to_dependency),
                devDependencies: clone(get_path(this.tsmonojson.json, "devDependencies", [])).map(to_dependency),
            };
        }
        return {
            dependencies: map_package_dependencies_to_tsmono_dependencies(get_path(this.packagejson.json, "dependencies", {})).map(to_dependency),
            devDependencies: map_package_dependencies_to_tsmono_dependencies(get_path(this.packagejson.json, "devDependencies", {})).map(to_dependency),
        };
    };
    Repository.prototype.update = function (cfg, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var link_dir, cwd, tsmonojson, package_json, tsconfig, dep_collection, expected_symlinks, expected_tools, path_for_tsconfig, _i, _a, _b, k, v, src_tool, fix_ts_config, _c, _d, _e, path_, merge, tsconfig_path_1, json_1, _f, _g, _h, k, v, t, _j, _k, _l, k, v, add_dep, add_npm_packages, _m, _o, npm_install_cmd, to_be_installed, p_installed, installed, _p, _q, dir, n, opts2, repositories, _r, repositories_1, r;
            var _this = this;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        if (!!fs.existsSync(this.path + "/tsmono.json")) return [3 /*break*/, 3];
                        // only run fyn if package.json exists
                        info("!! NO tsmono.json found, only trying to run fyn");
                        if (!(opts.install_npm_packages && fs.existsSync(this.path + "/package.json"))) return [3 /*break*/, 2];
                        info("running fyn in dependency " + this.path);
                        return [4 /*yield*/, run(opts.update_cmd && opts.update_cmd.executable || "fyn", { args: opts.update_cmd && opts.update_cmd.args, cwd: this.path })];
                    case 1:
                        _s.sent();
                        _s.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        link_dir = this.path + "/tsmono/links";
                        (fs.existsSync(link_dir) ? fs.readdirSync(link_dir) : []).forEach(function (x) {
                            fs.unlinkSync(link_dir + "/" + x);
                        });
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
                        dep_collection = new DependencyCollection(this.path, this.tsmonojson.dirs());
                        dep_collection.dependencies_of_repository(this, true);
                        dep_collection.do();
                        dep_collection.print_warnings();
                        expected_symlinks = {};
                        expected_tools = {};
                        path_for_tsconfig = function (tsconfig_dir) {
                            var r = {};
                            { // always set path
                                for (var _i = 0, _a = Object.entries(dep_collection.dependency_locactions); _i < _a.length; _i++) {
                                    var _b = _a[_i], k = _b[0], v = _b[1];
                                    if (v[0].repository) {
                                        // path.absolute path.relative(from,to) ?
                                        var src = !v[0].ignore_src && fs.existsSync(v[0].repository.path + "/src")
                                            ? "/src"
                                            : "";
                                        var resolved = path.resolve(cwd, (!!opts.link_to_links)
                                            ? link_dir + "/" + v[0].name + src
                                            : "" + v[0].repository.path + src);
                                        var rhs = path.relative(tsconfig_dir, resolved);
                                        info("tsconfig path", tsconfig_dir, "resolved", resolved, "result", rhs);
                                        var a = function (lhs, rhs) {
                                            ensure_path(r, "compilerOptions", "paths", lhs, []);
                                            if (!r.compilerOptions.paths[lhs].includes(rhs)) {
                                                r.compilerOptions.paths[lhs].push(rhs);
                                            }
                                        };
                                        a(k, rhs); // without * for index.ts
                                        a(k + "/*", rhs + "/*"); // for pkg/foo.ts or pkg/foo/sth.ts
                                    }
                                }
                            }
                            return r;
                        };
                        for (_i = 0, _a = Object.entries(dep_collection.dependency_locactions); _i < _a.length; _i++) {
                            _b = _a[_i], k = _b[0], v = _b[1];
                            if (v[0].repository) {
                                if (opts.link_to_links) {
                                    expected_symlinks[link_dir + "/" + k] = "../../" + v[0].repository.path;
                                }
                                src_tool = v[0].repository.path + "/src/tool";
                                (fs.existsSync(src_tool) ? fs.readdirSync(src_tool) : []).forEach(function (x) {
                                    var match = /([^/\\]*)(\.ts)/.exec(x);
                                    if (match) {
                                        expected_tools[match[1]] = x;
                                    }
                                });
                            }
                        }
                        fix_ts_config = function (x) {
                            ensure_path(x, "compilerOptions", {});
                            if ("paths" in x.compilerOptions && !("baseUrl" in x.compilerOptions))
                                x.compilerOptions.baseUrl = ".";
                            // otherwise a lot of imports will not work
                            x.compilerOptions.allowSyntheticDefaultImports = true;
                            x.compilerOptions.esModuleInterop = true;
                            // if we have an dist/outDir add to exclude
                            for (var _i = 0, _a = ["outDir", "outFile"]; _i < _a.length; _i++) {
                                var key = _a[_i];
                                if (x.compilerOptions[key])
                                    ensure_path(x, "exclude", []).push(x.compilerOptions[key]);
                            }
                            return x;
                        };
                        if ("tsconfigs" in tsmonojson) {
                            for (_c = 0, _d = Object.entries(tsmonojson.tsconfigs); _c < _d.length; _c++) {
                                _e = _d[_c], path_ = _e[0], merge = _e[1];
                                info("tsconfig.json path", path_);
                                // use protect
                                fs.writeFileSync(path.join(path_, "tsconfig.json"), JSON.stringify(fix_ts_config(deepmerge_1.default.all([tsmonojson.tsconfig || {}, path_for_tsconfig(path_), tsconfig, merge])), undefined, 2), "utf8");
                            }
                        }
                        else if ("tsconfig" in tsmonojson || Object.keys(path_for_tsconfig("")).length > 0) {
                            tsconfig_path_1 = path.join(this.path, "tsconfig.json");
                            json_1 = JSON.stringify(fix_ts_config(deepmerge_1.default(tsmonojson.tsconfig || {}, path_for_tsconfig(this.path), tsconfig)), undefined, 2);
                            protect(tsconfig_path_1, function () { fs.writeFileSync(tsconfig_path_1, json_1, "utf8"); }, opts.force);
                        }
                        // clone(tsmonojson.tsconfig) || {}
                        for (_f = 0, _g = Object.entries(expected_tools); _f < _g.length; _f++) {
                            _h = _g[_f], k = _h[0], v = _h[1];
                            // todo should be self contained but
                            // node -r ts-node/register/transpile-only -r tsconfig-paths/register
                            // works so well that you sohuld have a shourtcut in your .bashrc anywaya
                            // so just making symlinks for now which should be good enough
                            ["tsmono/tools", "tsmono/tools-bin", "tsmono/tools-bin-check"].forEach(function (x) { if (!fs.existsSync(x))
                                fs.mkdirSync(x); });
                            // this is going to break if you have realtive symlinks ?
                            expected_symlinks[this.path + "/}tsmono/tools/" + k] = v;
                            t = "tsmono/tools-bin/" + k;
                            del_if_exists(t);
                            fs.writeFileSync(t, "#!/bin/sh\nnode -r ts-node/register/transpile-only -r tsconfig-paths/register " + v + " \"$@\" ", "utf8");
                            fs.writeFileSync("tsmono/tools-bin-check/" + k, "#!/bin/sh\nnode -r ts-node/register-only -r tsconfig-paths/register " + v + " \"$@\"", "utf8");
                        }
                        for (_j = 0, _k = Object.entries(expected_symlinks); _j < _k.length; _j++) {
                            _l = _k[_j], k = _l[0], v = _l[1];
                            del_if_exists(k);
                            fs.mkdirpSync(path_1.dirname(k));
                            info("symlinking " + k + " -> " + v);
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
                                            throw new Error("cannot cope with url " + first.url + " yet, no git+https, fix code");
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
                                        type_name = "@types/" + dep_name;
                                        return [4 /*yield*/, cfg.npm_version_for_name(type_name)];
                                    case 3:
                                        type_version = _d.sent();
                                        debug("got type version " + type_name + " " + type_version);
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
                        _m = ensure_path;
                        _o = [package_json, "devDependencies", "ts-node"];
                        return [4 /*yield*/, cfg.npm_version_for_name("ts-node")];
                    case 4:
                        // manually forcing ts-node dependency for now
                        _m.apply(void 0, _o.concat([_s.sent()]));
                        return [4 /*yield*/, add_npm_packages("dependencies")];
                    case 5:
                        _s.sent();
                        return [4 /*yield*/, add_npm_packages("devDependencies")];
                    case 6:
                        _s.sent();
                        backup_file(package_json.path);
                        this.packagejson.json = package_json;
                        this.packagejson.flush_protect_user_changes(opts.force);
                        if (!opts.install_npm_packages) return [3 /*break*/, 9];
                        debug("install_npm_packages");
                        npm_install_cmd = get_path(this.tsmonojson.json, "npm-install-cmd", ["fyn"]);
                        to_be_installed = fs.readFileSync(this.packagejson_path, "utf-8");
                        p_installed = this.packagejson_path + ".installed";
                        installed = fs.existsSync(p_installed) ? fs.readFileSync(p_installed, "utf-8") : undefined;
                        info("deciding to run fyn in", this.path, this.packagejson_path, p_installed, installed === to_be_installed);
                        if (!(installed !== to_be_installed)) return [3 /*break*/, 8];
                        return [4 /*yield*/, run(npm_install_cmd[0], { args: npm_install_cmd.slice(1), cwd: this.path })];
                    case 7:
                        _s.sent();
                        _s.label = 8;
                    case 8:
                        fs.writeFileSync(p_installed, to_be_installed);
                        _s.label = 9;
                    case 9:
                        if (opts.symlink_node_modules_hack) {
                            for (_p = 0, _q = this.tsmonojson.dirs(); _p < _q.length; _p++) {
                                dir = _q[_p];
                                n = dir + "/node_modules";
                                if (fs.existsSync(n)) {
                                    fs.unlinkSync(n);
                                }
                                info("hack: symlinking node modules to " + n + " " + path.relative(dir, this.path + "/node_modules"));
                                fs.symlinkSync(path.relative(dir, this.path + "/node_modules"), n);
                            }
                        }
                        if (!opts.recurse) return [3 /*break*/, 13];
                        opts2 = clone(opts);
                        opts2.symlink_node_modules_hack = false; // mutually exclusive. when using it ony one repository can be active
                        repositories = Object.values(dep_collection.dependency_locactions).map(function (x) { return x[0].repository; });
                        _r = 0, repositories_1 = repositories;
                        _s.label = 10;
                    case 10:
                        if (!(_r < repositories_1.length)) return [3 /*break*/, 13];
                        r = repositories_1[_r];
                        if (r === undefined)
                            return [3 /*break*/, 12];
                        info("recursing into dependency " + r.path);
                        return [4 /*yield*/, r.update(cfg, opts2)];
                    case 11:
                        _s.sent();
                        _s.label = 12;
                    case 12:
                        _r++;
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
                        j.dependencies = __spreadArrays(j.dependencies, dependencies.filter(function (x) { return !(j.dependencies || []).includes(x); }));
                        j.devDependencies = __spreadArrays(j.devDependencies, devDependencies.filter(function (x) { return !(j.devDependencies || []).includes(x); }));
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
var update = sp.addParser("update", { addHelp: true, description: "This also is default action" });
update.addArgument("--symlink-node-modules-hack", { action: "storeTrue" });
update.addArgument("--link-via-root-dirs", { action: "storeTrue", help: "add dependencies by populating root-dirs. See README " });
update.addArgument("--link-to-links", { action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks" });
update.addArgument("--recurse", { action: "storeTrue" });
update.addArgument("--force", { action: "storeTrue" });
var update_using_rootDirs = sp.addParser("update-using-rootDirs", { addHelp: true, description: "Use rootDirs to link to dependencies essentially pulling all dependecnies, but also allowing to replace dependencies of dependencies this way" });
// update_using_rootDirs.addArgument("--symlink-node-modules-hack", {action: "storeTrue"})
// update_using_rootDirs.addArgument("--link-via-root-dirs", {action: "storeTrue", help: "add dependencies by populating root-dirs. See README "})
// update_using_rootDirs.addArgument("--link-to-links", {action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks"})
update_using_rootDirs.addArgument("--recurse", { action: "storeTrue" });
update_using_rootDirs.addArgument("--force", { action: "storeTrue" });
var push = sp.addParser("push-with-dependencies", { addHelp: true, description: "upload to git repository" });
push.addArgument("--shell-on-changes", { action: "storeTrue", help: "open shell so that you can commit changes" });
push.addArgument("--git-push-remote-location-name", { help: "eg origin" });
push.addArgument("--git-remote-config-json", { help: '{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}' });
push.addArgument("--run-remote-command", { help: "remote ssh location to run git pull in user@host:path:cmd" });
var pull = sp.addParser("pull-with-dependencies", { addHelp: true, description: "pull current directory from remote location with dependencies" });
pull.addArgument("--git-remote-config-json", { help: '{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}' });
var list_dependencies = sp.addParser("list-local-dependencies", { addHelp: true, description: "list dependencies" });
var from_json_files = sp.addParser("from-json-files", { addHelp: true, description: "try to create tsmono.json fom package.json and tsconfig.json file" });
push.addArgument("--force", { action: "storeTrue", help: "overwrites existing tsconfig.json file" });
var reinstall = sp.addParser("reinstall-with-dependencies", { addHelp: true, description: "removes node_modules and reinstalls to match current node version" });
var watch = sp.addParser("watch", { addHelp: true });
var args = parser.parseArgs();
var tslint_hack = function () { return __awaiter(void 0, void 0, void 0, function () {
    var j;
    return __generator(this, function (_a) {
        // this is biased  but its going to save your ass
        if (!fs.existsSync("tslint.json")) {
            fs.writeFileSync("tslint.json", "\n    {\n        \"extends\": [\n            \"tslint:recommended\"\n        ],\n        \"rules\": {\n            \"no-floating-promises\": true,\n            \"no-return-await\": true,\n            \"await-promise\": [true, \"PromiseLike\"]\n        }\n    }\n    ", "utf8");
        }
        else {
            j = JSON5.parse(fs.readFileSync("tslint.json", "utf8"));
            if (!j.rules["no-floating-promises"] && !j.rules["await-promise"])
                throw new Error("please add\n\n            \"no-floating-promises\": true,\n            \"no-return-await\": true,\n            \"await-promise\": [true, \"PromiseLike\"],\n\n            to your tslint.json 's rules section because it might save your ass\n      ");
        }
        return [2 /*return*/];
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var cache, config, cfg, p, update, d, dd, add_1, _i, _a, v, p_1, dep_collection, basenames_to_pull, seen, _b, _c, _d, k, v, r, package_contents, tsconfig_contents, tsmono_contents, _e, _f, _g, k, v, _h, _j, _k, pack, version, cwd, reponame, config_1, items, _l, _m, line, p_2, p_3, dep_collection, config_2, basenames_to_pull, seen, ensure_repo_committed_and_clean_1, ensure_remote_location_setup_1, remote_update_1, push_to_remote_location, _o, _p, _q, k, v, r, p_4, dep_collection, seen, _r, _s, _t, k, v, r, package_json_installed;
    return __generator(this, function (_u) {
        switch (_u.label) {
            case 0:
                cache = new DirectoryCache(os_1.homedir() + "/.tsmono/cache");
                config = {
                    cache: cache,
                    fetch_ttl_seconds: 60 * 24,
                };
                cfg = Object.assign({}, config, cfg_api(config));
                p = new Repository(process.cwd());
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
                _u.sent();
                return [2 /*return*/];
            case 2:
                if (!(args.main_action === "update")) return [3 /*break*/, 5];
                return [4 /*yield*/, update()];
            case 3:
                _u.sent();
                return [4 /*yield*/, tslint_hack()];
            case 4:
                _u.sent();
                return [2 /*return*/];
            case 5:
                if (!(args.main_action === "update_using_rootDirs")) return [3 /*break*/, 7];
                // await update_using_rootDirs();
                return [4 /*yield*/, tslint_hack()];
            case 6:
                // await update_using_rootDirs();
                _u.sent();
                return [2 /*return*/];
            case 7:
                if (args.main_action === "add") {
                    throw new Error("TODO");
                }
                if (args.main_action === "list-local-dependencies") {
                    silent = true;
                    p_1 = new Repository(process.cwd());
                    dep_collection = new DependencyCollection(p_1.path, p_1.tsmonojson.dirs());
                    dep_collection.dependencies_of_repository(p_1, true);
                    dep_collection.do();
                    dep_collection.print_warnings();
                    basenames_to_pull = [];
                    seen = [] // TODO: why aret there duplicates ?
                    ;
                    for (_b = 0, _c = Object.entries(dep_collection.dependency_locactions); _b < _c.length; _b++) {
                        _d = _c[_b], k = _d[0], v = _d[1];
                        r = v[0].repository;
                        if (r) {
                            if (seen.includes(r.path))
                                continue;
                            console.log("rel-path: ", r.path);
                            seen.push(r.path);
                        }
                    }
                }
                if (args.main_action === "from-json-files") {
                    // try creating tsmono from json files
                    // TODO: test this
                    if (fs.existsSync("tsmono.json") && !args.force) {
                        console.log("not overwriting tsconfig.json, use --force");
                        return [2 /*return*/];
                    }
                    package_contents = fs.existsSync("package.json") ? require("pcakage.json") : undefined;
                    tsconfig_contents = fs.existsSync("tsconfig.json") ? require("tsconfig.json") : undefined;
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
                    for (_e = 0, _f = Object.entries(package_contents || {}); _e < _f.length; _e++) {
                        _g = _f[_e], k = _g[0], v = _g[1];
                        if (k === "dependencies" || k === "devDependencies") {
                            for (_h = 0, _j = Object.entries(v); _h < _j.length; _h++) {
                                _k = _j[_h], pack = _k[0], version = _k[1];
                                tsmono_contents[k].push(pack + ";version=" + version);
                            }
                        }
                        else {
                            tsmono_contents.package[k] = v;
                        }
                    }
                    fs.writeFileSync("tsmono.json", JSON.stringify(tsmono_contents, undefined, 2), "uft8");
                }
                if (!(args.main_action === "pull-with-dependencies")) return [3 /*break*/, 12];
                cwd = process.cwd();
                reponame = path.basename(cwd);
                config_1 = JSON.parse(args.git_remote_config_json);
                return [4 /*yield*/, run("ssh", { args: [config_1.server], stdin: "\n          cd " + config_1.repositoriesPath + "/" + reponame + " && tsmono list-local-dependencies\n    " })];
            case 8:
                items = _u.sent();
                info("pulling " + JSON.stringify(items));
                _l = 0, _m = [].concat(["../" + reponame]).concat(items);
                _u.label = 9;
            case 9:
                if (!(_l < _m.length)) return [3 /*break*/, 12];
                line = _m[_l];
                if (!/rel-path: /.test(line)) return [3 /*break*/, 11];
                p_2 = path.relative(cwd, line.slice(10));
                if (!fs.existsSync(p_2)) {
                    info("creating " + p_2);
                    fs.mkdirpSync(p_2);
                }
                if (!!fs.existsSync(path.join(p_2, ".git/config"))) return [3 /*break*/, 11];
                return [4 /*yield*/, run("git", { args: ["clone", config_1.server + ":" + config_1.repositoriesPath + "/" + reponame, p_2] })];
            case 10:
                _u.sent();
                _u.label = 11;
            case 11:
                _l++;
                return [3 /*break*/, 9];
            case 12:
                if (!(args.main_action === "push-with-dependencies")) return [3 /*break*/, 18];
                p_3 = new Repository(process.cwd());
                dep_collection = new DependencyCollection(p_3.path, p_3.tsmonojson.dirs());
                config_2 = JSON.parse(args.git_remote_config_jon);
                dep_collection.dependencies_of_repository(p_3, true);
                dep_collection.do();
                dep_collection.print_warnings();
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
                                info(r.path + " is dirty, please commit changes starting shell");
                                return [4 /*yield*/, run("/bin/sh", { cwd: r.path })];
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
                                reponame = path.basename(r.path);
                                _a = "";
                                return [4 /*yield*/, run("git", { exitcodes: [0, 1], args: ("config --get remote." + config_2.gitRemoteLocationName + ".url").split(" "), cwd: r.path })];
                            case 1:
                                if (!(_a === (_b.sent()))) return [3 /*break*/, 5];
                                // local side
                                return [4 /*yield*/, run("git", { args: ("remote add " + config_2.gitRemoteLocationName + " " + config_2.server + ":" + config_2.bareRepositoriesPath + "/" + reponame).split(" "), cwd: r.path })
                                    // remote side
                                ];
                            case 2:
                                // local side
                                _b.sent();
                                // remote side
                                return [4 /*yield*/, run("ssh", { args: [config_2.server], cwd: r.path, stdin: "\n          bare=" + config_2.bareRepositoriesPath + "/" + reponame + "\n          target=" + config_2.repositoriesPath + "/" + reponame + "\n          [ -d \"$bare\" ] || mkdir -p \"$bare\"; ( cd \"$bare\"; git init --bare; )\n          [ -d \"$target\" ] || git clone $bare $target\n          " })
                                    // local side .git/config
                                ];
                            case 3:
                                // remote side
                                _b.sent();
                                // local side .git/config
                                return [4 /*yield*/, run("git", { args: ("push --set-upstream " + config_2.gitRemoteLocationName + " master").split(" "), cwd: r.path })];
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
                                reponame = path.basename(r.path);
                                return [4 /*yield*/, run("ssh", { args: [config_2.server],
                                        cwd: r.path, stdin: "\n          target=" + config_2.repositoriesPath + "/" + reponame + "\n          cd $target\n          git pull\n      " })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                push_to_remote_location = function (r) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ensure_repo_committed_and_clean_1(r)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, ensure_remote_location_setup_1(r)
                                    // 2 push
                                ];
                            case 2:
                                _a.sent();
                                if (!config_2.gitRemoteLocationName) return [3 /*break*/, 4];
                                info("... pushing in " + r.path + " ...");
                                return [4 /*yield*/, run("git", { args: ["push", config_2.gitRemoteLocationName], cwd: r.path })];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4: 
                            // 3 checkout
                            return [4 /*yield*/, remote_update_1(r)];
                            case 5:
                                // 3 checkout
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                _o = 0, _p = Object.entries(dep_collection.dependency_locactions);
                _u.label = 13;
            case 13:
                if (!(_o < _p.length)) return [3 /*break*/, 16];
                _q = _p[_o], k = _q[0], v = _q[1];
                r = v[0].repository;
                if (!r) return [3 /*break*/, 15];
                if (seen.includes(r.path))
                    return [3 /*break*/, 15];
                seen.push(r.path);
                return [4 /*yield*/, push_to_remote_location(r)];
            case 14:
                _u.sent();
                _u.label = 15;
            case 15:
                _o++;
                return [3 /*break*/, 13];
            case 16: return [4 /*yield*/, push_to_remote_location(p_3)
                // for (const v of basenames_to_pull) {
                //     const user_host  = args.run_remote_command.split(":")
                //     const target_path = `${user_host[1]}/${v}`
                //     console.log(`... pulling ${args.ssh_remote_location_git_pull}${v} ...`)
                //     await run("ssh", {args: [user_host[0]], stdin: `cd ${target_path}; ${user_host[2]}`}  )
                // }
            ];
            case 17:
                _u.sent();
                _u.label = 18;
            case 18:
                if (!(args.main_action === "reinstall-with-dependencies")) return [3 /*break*/, 20];
                p_4 = new Repository(process.cwd());
                dep_collection = new DependencyCollection(p_4.path, p_4.tsmonojson.dirs());
                dep_collection.dependencies_of_repository(p_4, true);
                dep_collection.do();
                dep_collection.print_warnings();
                seen = [] // TODO: why aret there duplicates ?
                ;
                for (_r = 0, _s = Object.entries(dep_collection.dependency_locactions); _r < _s.length; _r++) {
                    _t = _s[_r], k = _t[0], v = _t[1];
                    r = v[0].repository;
                    if (r) {
                        if (seen.includes(r.path))
                            continue;
                        seen.push(r.path);
                        fs.removeSync(path.join(r.path, "node_modules"));
                        package_json_installed = path.join(r.path, "package.json.installed");
                        if (fs.existsSync(package_json_installed))
                            fs.removeSync(package_json_installed);
                    }
                }
                return [4 /*yield*/, p_4.update(cfg, { link_to_links: true, install_npm_packages: true, symlink_node_modules_hack: false, recurse: true, force: true,
                    })];
            case 19:
                _u.sent();
                _u.label = 20;
            case 20: return [2 /*return*/];
        }
    });
}); };
process.on("unhandledRejection", function (error) {
    console.error(error); // This prints error with stack included (as for normal errors)
    if (error.message)
        console.error(error.message); // the error above does not print the message for whatever reason, so do so
    throw error; // Following best practices re-throw error and let the process exit with error code
});
main().then(function () { }, console.log);
