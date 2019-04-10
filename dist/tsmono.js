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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var JSON5 = require("json5");
var fs = require("fs-extra");
var path = require("path");
var child_process_1 = require("child_process");
var path_1 = require("path");
// import deepequal from "deep-equal"
var deepequal = require("deep-equal"); // allowSynteticImports doesn't exist for node -r ..
var btoa_1 = require("btoa");
var deepmerge_1 = require("deepmerge");
var cross_fetch_1 = require("cross-fetch");
var os_1 = require("os");
/// LIBRARY SUPPORT CODE
var clone = function (x) {
    console.log("cloning", x);
    return x === undefined ? undefined : JSON.parse(JSON.stringify(x));
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
var run = function (cmd, args) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // duplicate code
            return [4 /*yield*/, new Promise(function (a, b) {
                    var child = child_process_1.spawn(cmd, args, {
                        stdio: [
                            0,
                            'pipe',
                            fs.openSync("err.out", "w") // direct child's stderr to a file
                        ]
                    });
                    child.on('close', function (code, signal) {
                        if (code === 0)
                            a();
                        b(cmd.toString() + " failed with code " + code);
                    });
                })];
            case 1:
                // duplicate code
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var read_and_show = function (l, path) {
    if (fs.existsSync(path))
        console.log("file " + l + " " + path + " has contents " + fs.readFileSync(path, 'utf8'));
    else
        console.log("file " + l + " doesn't exist");
};
var run_stdout = function (cmd) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(_this, void 0, void 0, function () {
        var stdout;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("running", cmd, args);
                    stdout = "";
                    // duplicate code
                    return [4 /*yield*/, new Promise(function (a, b) {
                            var child = child_process_1.spawn(cmd, args, {
                                stdio: [0, 'pipe', 2]
                            });
                            if (!child.stdout)
                                throw new Error("child.stdout is null");
                            child.stdout.on('data', function (s) { return stdout += s; });
                            child.on('close', function (code, signal) {
                                if (code === 0)
                                    a();
                                b(cmd.toString() + " " + args.join(' ').toString() + " failed with code " + code);
                            });
                        })];
                case 1:
                    // duplicate code
                    _a.sent();
                    return [2 /*return*/, stdout];
            }
        });
    });
};
var DirectoryCache = /** @class */ (function () {
    // sry for reimplementing it - need a *simple* fast solution
    function DirectoryCache(path) {
        this.path = path;
    }
    DirectoryCache.prototype.tc_ = function () {
        return new Date().getTime();
    };
    DirectoryCache.prototype.path_ = function (key) {
        return this.path + "/" + btoa_1.default(key);
    };
    DirectoryCache.prototype.get_ = function (key, ttl) {
        var p = this.path_(key);
        if (fs.existsSync(p)) {
            var json = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (ttl === undefined || !(this.tc_() - json.tc > ttl))
                return json.thing;
        }
        return undefined;
    };
    DirectoryCache.prototype.put_ = function (key, thing) {
        if (!fs.existsSync(this.path))
            fs.mkdirpSync(this.path);
        fs.writeFileSync(this.path_(key), JSON.stringify({ 'thing': thing, 'tc': this.tc_() }));
    };
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
    return DirectoryCache;
}());
var config = {
    cacheDir: "~/.tsmono/cache"
};
var parse_dependency = function (s, origin) {
    var l = s.split(':');
    var r = { name: l[0] };
    for (var _i = 0, _a = l.slice(1); _i < _a.length; _i++) {
        var v = _a[_i];
        if (/version=(.*)/.test(v)) {
            r.version = v.slice(8);
            continue;
        }
        if (v === 'node_modules')
            r[v] = true;
        if (v === 'types')
            r[v] = true;
        if (v === 'npm')
            r[v] = true;
    }
    if (origin !== undefined)
        r.origin = origin;
    return r;
};
var cfg_api = function (cfg) {
    var fetch_from_registry = function (name) {
        return cfg.cache.get_async("fetch-" + name + "-registry.npmjs.org", function () { return __awaiter(_this, void 0, void 0, function () {
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
    var npm_version_for_name = function (name) { return __awaiter(_this, void 0, void 0, function () {
        var lock, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lock = new JSONFile('.tsmonolock');
                    if (!!(name in lock.json)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch_from_registry(name)];
                case 1:
                    r = _a.sent();
                    if (r.error)
                        return [2 /*return*/, undefined];
                    lock.json[name] = "^" + r['dist-tags'].latest;
                    lock.flush();
                    _a.label = 2;
                case 2: return [2 /*return*/, lock.json[name]];
            }
        });
    }); };
    return {
        fetch_from_registry: fetch_from_registry,
        npm_version_for_name: npm_version_for_name
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
    console.log("get_path", JSON.stringify(args));
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
        if (i == e) {
            obj[k] = obj[k] || args[e + 1];
            return obj[k];
        }
        obj[k] = obj[k] || {};
        obj = obj[k];
    }
};
var JSONFile = /** @class */ (function () {
    function JSONFile(path, default_) {
        if (default_ === void 0) { default_ = function () { return {}; }; }
        this.path = path;
        this.json_on_disc = undefined;
        this.json = {};
        if (fs.existsSync(this.path)) {
            var s = fs.readFileSync(this.path, 'utf8');
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
        var s = JSON.stringify(this.json);
        console.log('flushing ?', this.path);
        if (!deepequal(this.json_on_disc, this.json)) {
            console.log('flushing', this.path);
            fs.writeFileSync(this.path, s, 'utf8');
        }
    };
    JSONFile.prototype.flush_protect_user_changes = function () {
        var protect_path = this.path + ".tsmonoguard";
        if (fs.existsSync(protect_path)) {
            if (fs.readFileSync(protect_path, 'utf8') !== fs.readFileSync(this.path, 'utf8'))
                // TODO nicer diff or allow applying changes to tsmono.json
                throw new Error("Move " + protect_path + " " + this.path + " to continue. Not overwriting your changes");
        }
        console.log("flushing", this.json);
        this.flush();
        fs.copyFileSync(this.path, protect_path);
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
        r.push(k + ":version=" + v);
    }
    console.log("ABCC", r, versions);
    return r;
};
var dependency_to_str = function (d) {
    return d.name + " " + (d.npm && d.repository ? 'npm and repository?' : (d.repository ? "from " + d.repository.path : "from npm " + (d.version ? d.version : ''))) + " requested from " + d.origin;
};
var DependencyCollection = /** @class */ (function () {
    function DependencyCollection(dirs) {
        this.dirs = dirs;
        this.dependency_locactions = {};
        this.dependencies = [];
        this.devDependencies = [];
        this.todo = [];
        this.recursed = [];
    }
    DependencyCollection.prototype.print_warnings = function () {
        for (var _i = 0, _a = Object.entries(this.dependency_locactions); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            // TODO: check that all v's are same constraints ..
            var npms = v.filter(function (x) { return x.npm; });
            var no_npms = v.filter(function (x) { return !x.npm; });
            if (npms.length > 0 && no_npms.length > 0)
                console.log("WARNING: dependency " + k + " requested as npm and from disk, choosing first", v.map(dependency_to_str).join("\n"));
            // check version match etc
        }
    };
    DependencyCollection.prototype.dependencies_of_repository = function (r, dev) {
        var _this = this;
        // add dependencies r to todo list to be looked at
        var deps = r.dependencies();
        console.log("DEPS OF", r.path, deps);
        var add = function (key) {
            _this.todo = _this.todo.concat(deps[key]);
            _this[key] = _this[key].concat(deps[key].map(function (x) { return x.name; }));
        };
        add("dependencies");
        if (dev)
            add("devDependencies");
    };
    DependencyCollection.prototype.do = function () {
        var next;
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
        var d = this.dirs.map(function (x) { return x + "/" + dep.name; }).find(function (dir) { return fs.existsSync(dir); });
        if (!d) {
            console.log("WARNING, dependency " + dependency_to_str(dep) + " not found, forcing npm");
            dep.npm = true;
            return;
        }
        var r = new Repository(d);
        dep.repository = r;
        // devDependencies are likely to contain @types thus pull them, too ?
        // TODO: only pull @types/*?
        this.dependencies_of_repository(r, true);
    };
    return DependencyCollection;
}());
var Repository = /** @class */ (function () {
    function Repository(path) {
        this.path = path;
        this.tsmonojson = new TSMONOJSONFile(path + "/tsmono.json");
        this.packagejson = new JSONFile(path + "/package.json");
    }
    Repository.prototype.flush = function () {
        this.tsmonojson.flush();
        this.packagejson.flush();
    };
    Repository.prototype.init = function () {
        var tsconfig = this.path + "/tsconfig.json";
        this.tsmonojson.init(fs.existsSync(tsconfig) ? JSON5.parse(fs.readFileSync(tsconfig, 'utf8')) : {});
    };
    Repository.prototype.dependencies = function () {
        var _this = this;
        var to_dependency = function (dep) { return parse_dependency(dep, _this.path); };
        // get dependencies from
        // tsmono.json
        // package.json otherwise
        if (fs.existsSync(this.path + "/tsmono.json")) {
            return {
                dependencies: clone(get_path(this.tsmonojson.json, 'dependencies', [])).map(to_dependency),
                devDependencies: clone(get_path(this.tsmonojson.json, 'devDependencies', [])).map(to_dependency)
            };
        }
        return {
            dependencies: map_package_dependencies_to_tsmono_dependencies(get_path(this.packagejson.json, 'dependencies', {})).map(to_dependency),
            devDependencies: map_package_dependencies_to_tsmono_dependencies(get_path(this.packagejson.json, 'devDependencies', {})).map(to_dependency)
        };
    };
    Repository.prototype.src = function () {
        // the src file of this repository which should be linked to depending repository
        var src = this.path + "/src";
        return fs.existsSync(src) ? src : this.path;
    };
    Repository.prototype.update = function (cfg, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var link_dir, cwd, tsmonojson, package_json, tsconfig, dep_collection, expected_symlinks, expected_tools, path_for_tsconfig, _i, _a, _b, k, v, src, src_dir, src_tool, fix_ts_config, _c, _d, _e, path_2, merge, tsconfig_path, json, _f, _g, _h, k, v, t, _j, _k, _l, k, v, add_npm_packages, _m, _o, npm_install_cmd, _p, _q, dir, n;
            var _this = this;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        assert(!!opts.link_to_links, 'link_to_links should be true');
                        link_dir = "tsmono/links";
                        (fs.existsSync(link_dir) ? fs.readdirSync(link_dir) : []).forEach(function (x) {
                            fs.unlinkSync(link_dir + "/" + x);
                        });
                        cwd = process.cwd();
                        tsmonojson = this.tsmonojson.json || {};
                        package_json = clone(get_path(tsmonojson, 'package', {}));
                        if (package_json === undefined) {
                            package_json = {};
                        }
                        package_json.dependencies = {};
                        package_json.devDependencies = {};
                        delete package_json.tsconfig;
                        tsconfig = {};
                        dep_collection = new DependencyCollection(this.tsmonojson.dirs());
                        dep_collection.dependencies_of_repository(this, true);
                        dep_collection.do();
                        dep_collection.print_warnings();
                        console.log("dep_collection", dep_collection);
                        expected_symlinks = {};
                        expected_tools = {};
                        path_for_tsconfig = function (tsconfig_path) {
                            var r = {};
                            { // always set path
                                for (var _i = 0, _a = Object.entries(dep_collection.dependency_locactions); _i < _a.length; _i++) {
                                    var _b = _a[_i], k = _b[0], v = _b[1];
                                    if (v[0].repository) {
                                        // path.absolute path.relative(from,to) ?
                                        var lhs = k + "/*";
                                        var rhs = path.relative(path_1.dirname(tsconfig_path), path.resolve(cwd, (!!opts.link_to_links)
                                            ? link_dir + "/" + v[0].name + "/*"
                                            : "v[0].repository.src()))}/*"));
                                        ensure_path(r, 'compilerOptions', 'paths', lhs, []);
                                        if (!r.compilerOptions.paths[lhs].includes(rhs))
                                            r.compilerOptions.paths[lhs].push(rhs);
                                    }
                                }
                            }
                            return r;
                        };
                        for (_i = 0, _a = Object.entries(dep_collection.dependency_locactions); _i < _a.length; _i++) {
                            _b = _a[_i], k = _b[0], v = _b[1];
                            if (v[0].repository) {
                                src = v[0].repository.path + "/src";
                                src_dir = fs.existsSync(src) ? src : v[0].repository.path;
                                if (opts.link_to_links) {
                                    console.log("add", k);
                                    expected_symlinks[link_dir + "/" + k] = "../../" + src_dir;
                                }
                                console.log("tsconfig2", tsconfig);
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
                            if (x.compilerOptions.paths && !('baseUrl' in x.compilerOptions))
                                x.compilerOptions.baseUrl = ".";
                            // otherwise a lot of imports will not work
                            x.compilerOptions.allowSyntheticDefaultImports = true;
                            x.compilerOptions.esModuleInterop = true;
                            return x;
                        };
                        if ('tsconfigs' in tsmonojson) {
                            for (_c = 0, _d = Object.entries(tsmonojson.tsconfigs); _c < _d.length; _c++) {
                                _e = _d[_c], path_2 = _e[0], merge = _e[1];
                                fs.writeFileSync(path_2, JSON.stringify(fix_ts_config(deepmerge_1.default.all([tsmonojson.tsconfig || {}, path_for_tsconfig(path_2), tsconfig, merge]))), 'utf8');
                            }
                        }
                        else if ('tsconfig' in tsmonojson || Object.keys(path_for_tsconfig("")).length > 0) {
                            tsconfig_path = this.path + "/tsconfig.json";
                            json = JSON.stringify(fix_ts_config(deepmerge_1.default(tsmonojson.tsconfig || {}, path_for_tsconfig(tsconfig_path), tsconfig)));
                            console.log('pwd', this.path);
                            console.log("writing tsconfig.json", json);
                            fs.writeFileSync(tsconfig_path, json, 'utf8');
                            console.log("read", fs.readFileSync(this.path + "/tsconfig.json", 'utf8'));
                        }
                        clone(tsmonojson.tsconfig) || {};
                        for (_f = 0, _g = Object.entries(expected_tools); _f < _g.length; _f++) {
                            _h = _g[_f], k = _h[0], v = _h[1];
                            // todo should be self contained but 
                            // node -r ts-node/register/transpile-only -r tsconfig-paths/register 
                            // works so well that you sohuld have a shourtcut in your .bashrc anywaya
                            // so just making symlinks for now which should be good enough
                            ['tsmono/tools', 'tsmono/tools-bin', 'tsmono/tools-bin-check'].forEach(function (x) { if (!fs.existsSync(x))
                                fs.mkdirSync(x); });
                            // this is going to break if you have realtive symlinks ?
                            expected_symlinks["tsmono/tools/" + k] = v;
                            t = "tsmono/tools-bin/" + k;
                            del_if_exists(t);
                            fs.writeFileSync(t, "#!/bin/sh\nnode -r ts-node/register/transpile-only -r tsconfig-paths/register " + v + " \"$@\" ", 'utf8');
                            fs.writeFileSync("tsmono/tools-bin-check/" + k, "#!/bin/sh\nnode -r ts-node/register-only -r tsconfig-paths/register " + v + " \"$@\"", 'utf8');
                        }
                        console.log("expected_symlinks", expected_symlinks);
                        for (_j = 0, _k = Object.entries(expected_symlinks); _j < _k.length; _j++) {
                            _l = _k[_j], k = _l[0], v = _l[1];
                            del_if_exists(k);
                            fs.mkdirpSync(path_1.dirname(k));
                            fs.symlinkSync(v, k);
                        }
                        ensure_path(package_json, 'dependencies', {});
                        ensure_path(package_json, 'devDependencies', {});
                        add_npm_packages = function (dep) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, _a, dep_name, first, _b, _c, type_name, type_version, _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _i = 0, _a = dep_collection[dep];
                                        _f.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                                        dep_name = _a[_i];
                                        first = dep_collection.dependency_locactions[dep_name][0];
                                        if (!first.npm)
                                            return [3 /*break*/, 6];
                                        console.log("adding npm", dep_name, first);
                                        // TODO: care about version
                                        _b = ensure_path;
                                        _c = [package_json, dep, dep_name];
                                        return [4 /*yield*/, cfg.npm_version_for_name(dep_name)];
                                    case 2:
                                        // TODO: care about version
                                        _b.apply(void 0, _c.concat([_f.sent()]));
                                        if (!first.types) return [3 /*break*/, 5];
                                        type_name = "@types/" + dep_name;
                                        return [4 /*yield*/, cfg.npm_version_for_name(type_name)];
                                    case 3:
                                        type_version = _f.sent();
                                        console.log("got type version", type_version);
                                        if (!(type_version !== undefined)) return [3 /*break*/, 5];
                                        _d = ensure_path;
                                        _e = [package_json, dep, type_name];
                                        return [4 /*yield*/, cfg.npm_version_for_name(dep_name)];
                                    case 4:
                                        _d.apply(void 0, _e.concat([_f.sent()]));
                                        _f.label = 5;
                                    case 5:
                                        console.log("package_json", package_json);
                                        _f.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); };
                        // manually forcing ts-node dependency for now
                        _m = ensure_path;
                        _o = [package_json, 'devDependencies', 'ts-node'];
                        return [4 /*yield*/, cfg.npm_version_for_name('ts-node')];
                    case 1:
                        // manually forcing ts-node dependency for now
                        _m.apply(void 0, _o.concat([_r.sent()]));
                        return [4 /*yield*/, add_npm_packages("dependencies")];
                    case 2:
                        _r.sent();
                        return [4 /*yield*/, add_npm_packages("devDependencies")];
                    case 3:
                        _r.sent();
                        backup_file(package_json.path);
                        console.log("package_json2", package_json);
                        this.packagejson.json = package_json;
                        console.log("package_json2", this.packagejson.json);
                        this.packagejson.flush_protect_user_changes();
                        if (!opts.run_update) return [3 /*break*/, 5];
                        console.log("run_update");
                        npm_install_cmd = get_path(this.tsmonojson.json, "npm-install-cmd", ["fyn"]);
                        return [4 /*yield*/, run(npm_install_cmd[0], npm_install_cmd.slice(1))];
                    case 4:
                        _r.sent();
                        _r.label = 5;
                    case 5:
                        console.log("opts", opts);
                        if (opts.symlink_node_modules_hack) {
                            console.log("hack", this.tsmonojson.dirs());
                            for (_p = 0, _q = this.tsmonojson.dirs(); _p < _q.length; _p++) {
                                dir = _q[_p];
                                n = dir + "/node_modules";
                                if (fs.existsSync(n)) {
                                    fs.unlinkSync(n);
                                }
                                console.log("hack: symlinking node modules to ", n, path.relative(dir, this.path + "/node_modules"));
                                fs.symlinkSync(path.relative(dir, this.path + "/node_modules"), n);
                            }
                        }
                        return [2 /*return*/];
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
                    return [4 /*yield*/, this.init()];
                    case 1:
                        // TODO: check prefix "auto" etc to keep unique or overwrite
                        _a.sent();
                        j = this.tsmonojson.json;
                        j["dependencies"] = j["dependencies"].concat(dependencies.filter(function (x) { return !(j["dependencies"] || []).includes(x); }));
                        j["devDependencies"] = j["devDependencies"].concat(devDependencies.filter(function (x) { return !(j["devDependencies"] || []).includes(x); }));
                        return [4 /*yield*/, this.update(cfg, { link_to_links: true, run_update: true })];
                    case 2:
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
    description: "tsmono (typescirpt monorepository), see github ",
    version: "0.0.1",
});
var sp = parser.addSubparsers({
    'title': 'sub commands',
    'dest': 'main_action'
});
var init = sp.addParser("init", { 'addHelp': true });
var add = sp.addParser("add", { 'addHelp': true });
add.addArgument("args", { 'nargs': '*' });
var update = sp.addParser("update", { 'addHelp': true });
update.addArgument("--symlink-node-modules-hack", { 'action': 'storeTrue' });
var watch = sp.addParser("watch", { 'addHelp': true });
console.log(process.argv);
var args = parser.parseArgs();
console.log("args", args);
var main = function () { return __awaiter(_this, void 0, void 0, function () {
    var cache, config, cfg, p, d, dd, add, _i, _a, v, package_json;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cache = new DirectoryCache(os_1.homedir() + "/.tsmono/cache");
                config = {
                    cache: cache,
                    fetch_ttl_seconds: 60 * 24
                };
                cfg = Object.assign({}, config, cfg_api(config));
                p = new Repository(process.cwd());
                if (!(args.main_action == "init")) return [3 /*break*/, 2];
                return [4 /*yield*/, p.init()];
            case 1:
                _b.sent();
                return [2 /*return*/];
            case 2:
                if (!(args.main_action == "add")) return [3 /*break*/, 4];
                d = [];
                dd = [];
                add = d;
                for (_i = 0, _a = args.args; _i < _a.length; _i++) {
                    v = _a[_i];
                    if (v == "-d") {
                        add = dd;
                    }
                    dd.push(v);
                }
                return [4 /*yield*/, p.add(cfg, d, dd)];
            case 3:
                _b.sent();
                return [2 /*return*/];
            case 4:
                if (!(args.main_action == "update")) return [3 /*break*/, 6];
                return [4 /*yield*/, p.update(cfg, { link_to_links: true, run_update: true, symlink_node_modules_hack: args.symlink_node_modules_hack })];
            case 5:
                _b.sent();
                return [2 /*return*/];
            case 6:
                if (args.main_action == "add") {
                    throw new Error("TODO");
                }
                package_json = fs.readFileSync("package.json");
                return [2 /*return*/];
        }
    });
}); };
process.on("unhandledRejection", function (error) {
    console.error(error); // This prints error with stack included (as for normal errors)
    throw error; // Following best practices re-throw error and let the process exit with error code
});
main();
