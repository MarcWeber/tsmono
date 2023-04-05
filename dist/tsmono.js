"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/universalify/index.js
var require_universalify = __commonJS({
  "node_modules/universalify/index.js"(exports) {
    "use strict";
    exports.fromCallback = function(fn) {
      return Object.defineProperty(function() {
        if (typeof arguments[arguments.length - 1] === "function")
          fn.apply(this, arguments);
        else {
          return new Promise((resolve2, reject) => {
            arguments[arguments.length] = (err, res) => {
              if (err)
                return reject(err);
              resolve2(res);
            };
            arguments.length++;
            fn.apply(this, arguments);
          });
        }
      }, "name", { value: fn.name });
    };
    exports.fromPromise = function(fn) {
      return Object.defineProperty(function() {
        const cb = arguments[arguments.length - 1];
        if (typeof cb !== "function")
          return fn.apply(this, arguments);
        else
          fn.apply(this, arguments).then((r) => cb(null, r), cb);
      }, "name", { value: fn.name });
    };
  }
});

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/graceful-fs/polyfills.js"(exports, module2) {
    var constants = require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    var chdir = process.chdir;
    process.chdir = function(d) {
      cwd = null;
      chdir.call(process, d);
    };
    module2.exports = patch;
    function patch(fs6) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs6);
      }
      if (!fs6.lutimes) {
        patchLutimes(fs6);
      }
      fs6.chown = chownFix(fs6.chown);
      fs6.fchown = chownFix(fs6.fchown);
      fs6.lchown = chownFix(fs6.lchown);
      fs6.chmod = chmodFix(fs6.chmod);
      fs6.fchmod = chmodFix(fs6.fchmod);
      fs6.lchmod = chmodFix(fs6.lchmod);
      fs6.chownSync = chownFixSync(fs6.chownSync);
      fs6.fchownSync = chownFixSync(fs6.fchownSync);
      fs6.lchownSync = chownFixSync(fs6.lchownSync);
      fs6.chmodSync = chmodFixSync(fs6.chmodSync);
      fs6.fchmodSync = chmodFixSync(fs6.fchmodSync);
      fs6.lchmodSync = chmodFixSync(fs6.lchmodSync);
      fs6.stat = statFix(fs6.stat);
      fs6.fstat = statFix(fs6.fstat);
      fs6.lstat = statFix(fs6.lstat);
      fs6.statSync = statFixSync(fs6.statSync);
      fs6.fstatSync = statFixSync(fs6.fstatSync);
      fs6.lstatSync = statFixSync(fs6.lstatSync);
      if (!fs6.lchmod) {
        fs6.lchmod = function(path4, mode, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs6.lchmodSync = function() {
        };
      }
      if (!fs6.lchown) {
        fs6.lchown = function(path4, uid, gid, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs6.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs6.rename = function(fs$rename) {
          return function(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs6.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb)
                cb(er);
            });
          };
        }(fs6.rename);
      }
      fs6.read = function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs6, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs6, fd, buffer, offset, length, position, callback);
        }
        read.__proto__ = fs$read;
        return read;
      }(fs6.read);
      fs6.readSync = function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs6, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      }(fs6.readSync);
      function patchLchmod(fs7) {
        fs7.lchmod = function(path4, mode, callback) {
          fs7.open(
            path4,
            constants.O_WRONLY | constants.O_SYMLINK,
            mode,
            function(err, fd) {
              if (err) {
                if (callback)
                  callback(err);
                return;
              }
              fs7.fchmod(fd, mode, function(err2) {
                fs7.close(fd, function(err22) {
                  if (callback)
                    callback(err2 || err22);
                });
              });
            }
          );
        };
        fs7.lchmodSync = function(path4, mode) {
          var fd = fs7.openSync(path4, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs7.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs7.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs7.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs7) {
        if (constants.hasOwnProperty("O_SYMLINK")) {
          fs7.lutimes = function(path4, at, mt, cb) {
            fs7.open(path4, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb)
                  cb(er);
                return;
              }
              fs7.futimes(fd, at, mt, function(er2) {
                fs7.close(fd, function(er22) {
                  if (cb)
                    cb(er2 || er22);
                });
              });
            });
          };
          fs7.lutimesSync = function(path4, at, mt) {
            var fd = fs7.openSync(path4, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs7.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs7.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs7.closeSync(fd);
              }
            }
            return ret;
          };
        } else {
          fs7.lutimes = function(_a2, _b, _c, cb) {
            if (cb)
              process.nextTick(cb);
          };
          fs7.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig)
          return orig;
        return function(target, mode, cb) {
          return orig.call(fs6, target, mode, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, mode) {
          try {
            return orig.call(fs6, target, mode);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs6, target, uid, gid, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs6, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig)
          return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0)
                stats.uid += 4294967296;
              if (stats.gid < 0)
                stats.gid += 4294967296;
            }
            if (cb)
              cb.apply(this, arguments);
          }
          return options ? orig.call(fs6, target, options, callback) : orig.call(fs6, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs6, target, options) : orig.call(fs6, target);
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "node_modules/graceful-fs/legacy-streams.js"(exports, module2) {
    var Stream = require("stream").Stream;
    module2.exports = legacy;
    function legacy(fs6) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path4, options) {
        if (!(this instanceof ReadStream))
          return new ReadStream(path4, options);
        Stream.call(this);
        var self2 = this;
        this.path = path4;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding)
          this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if ("number" !== typeof this.end) {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self2._read();
          });
          return;
        }
        fs6.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self2.emit("error", err);
            self2.readable = false;
            return;
          }
          self2.fd = fd;
          self2.emit("open", fd);
          self2._read();
        });
      }
      function WriteStream(path4, options) {
        if (!(this instanceof WriteStream))
          return new WriteStream(path4, options);
        Stream.call(this);
        this.path = path4;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs6.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "node_modules/graceful-fs/clone.js"(exports, module2) {
    "use strict";
    module2.exports = clone2;
    function clone2(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: obj.__proto__ };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "node_modules/graceful-fs/graceful-fs.js"(exports, module2) {
    var fs6 = require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone2 = require_clone();
    var util = require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = Symbol.for("graceful-fs.queue");
      previousSymbol = Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    var debug4 = noop;
    if (util.debuglog)
      debug4 = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug4 = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!global[gracefulQueue]) {
      queue = [];
      Object.defineProperty(global, gracefulQueue, {
        get: function() {
          return queue;
        }
      });
      fs6.close = function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs6, fd, function(err) {
            if (!err) {
              retry();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      }(fs6.close);
      fs6.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs6, arguments);
          retry();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      }(fs6.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug4(global[gracefulQueue]);
          require("assert").equal(global[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    module2.exports = patch(clone2(fs6));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs6.__patched) {
      module2.exports = patch(fs6);
      fs6.__patched = true;
    }
    function patch(fs7) {
      polyfills(fs7);
      fs7.gracefulify = patch;
      fs7.createReadStream = createReadStream;
      fs7.createWriteStream = createWriteStream;
      var fs$readFile = fs7.readFile;
      fs7.readFile = readFile;
      function readFile(path4, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path4, options, cb);
        function go$readFile(path5, options2, cb2) {
          return fs$readFile(path5, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path5, options2, cb2]]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
              retry();
            }
          });
        }
      }
      var fs$writeFile = fs7.writeFile;
      fs7.writeFile = writeFile;
      function writeFile(path4, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path4, data, options, cb);
        function go$writeFile(path5, data2, options2, cb2) {
          return fs$writeFile(path5, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path5, data2, options2, cb2]]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
              retry();
            }
          });
        }
      }
      var fs$appendFile = fs7.appendFile;
      if (fs$appendFile)
        fs7.appendFile = appendFile;
      function appendFile(path4, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path4, data, options, cb);
        function go$appendFile(path5, data2, options2, cb2) {
          return fs$appendFile(path5, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path5, data2, options2, cb2]]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
              retry();
            }
          });
        }
      }
      var fs$readdir = fs7.readdir;
      fs7.readdir = readdir;
      function readdir(path4, options, cb) {
        var args2 = [path4];
        if (typeof options !== "function") {
          args2.push(options);
        } else {
          cb = options;
        }
        args2.push(go$readdir$cb);
        return go$readdir(args2);
        function go$readdir$cb(err, files) {
          if (files && files.sort)
            files.sort();
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$readdir, [args2]]);
          else {
            if (typeof cb === "function")
              cb.apply(this, arguments);
            retry();
          }
        }
      }
      function go$readdir(args2) {
        return fs$readdir.apply(fs7, args2);
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs7);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs7.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs7.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs7, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs7, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs7, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs7, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path4, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path4, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream(path4, options) {
        return new fs7.ReadStream(path4, options);
      }
      function createWriteStream(path4, options) {
        return new fs7.WriteStream(path4, options);
      }
      var fs$open = fs7.open;
      fs7.open = open;
      function open(path4, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path4, flags, mode, cb);
        function go$open(path5, flags2, mode2, cb2) {
          return fs$open(path5, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path5, flags2, mode2, cb2]]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
              retry();
            }
          });
        }
      }
      return fs7;
    }
    function enqueue(elem) {
      debug4("ENQUEUE", elem[0].name, elem[1]);
      global[gracefulQueue].push(elem);
    }
    function retry() {
      var elem = global[gracefulQueue].shift();
      if (elem) {
        debug4("RETRY", elem[0].name, elem[1]);
        elem[0].apply(null, elem[1]);
      }
    }
  }
});

// node_modules/fs-extra/lib/fs/index.js
var require_fs = __commonJS({
  "node_modules/fs-extra/lib/fs/index.js"(exports) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs6 = require_graceful_fs();
    var api = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchown",
      "lchmod",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "readFile",
      "readdir",
      "readlink",
      "realpath",
      "rename",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((key) => {
      return typeof fs6[key] === "function";
    });
    Object.keys(fs6).forEach((key) => {
      if (key === "promises") {
        return;
      }
      exports[key] = fs6[key];
    });
    api.forEach((method) => {
      exports[method] = u(fs6[method]);
    });
    exports.exists = function(filename, callback) {
      if (typeof callback === "function") {
        return fs6.exists(filename, callback);
      }
      return new Promise((resolve2) => {
        return fs6.exists(filename, resolve2);
      });
    };
    exports.read = function(fd, buffer, offset, length, position, callback) {
      if (typeof callback === "function") {
        return fs6.read(fd, buffer, offset, length, position, callback);
      }
      return new Promise((resolve2, reject) => {
        fs6.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
          if (err)
            return reject(err);
          resolve2({ bytesRead, buffer: buffer2 });
        });
      });
    };
    exports.write = function(fd, buffer, ...args2) {
      if (typeof args2[args2.length - 1] === "function") {
        return fs6.write(fd, buffer, ...args2);
      }
      return new Promise((resolve2, reject) => {
        fs6.write(fd, buffer, ...args2, (err, bytesWritten, buffer2) => {
          if (err)
            return reject(err);
          resolve2({ bytesWritten, buffer: buffer2 });
        });
      });
    };
  }
});

// node_modules/fs-extra/lib/mkdirs/win32.js
var require_win32 = __commonJS({
  "node_modules/fs-extra/lib/mkdirs/win32.js"(exports, module2) {
    "use strict";
    var path4 = require("path");
    function getRootPath(p) {
      p = path4.normalize(path4.resolve(p)).split(path4.sep);
      if (p.length > 0)
        return p[0];
      return null;
    }
    var INVALID_PATH_CHARS = /[<>:"|?*]/;
    function invalidWin32Path(p) {
      const rp = getRootPath(p);
      p = p.replace(rp, "");
      return INVALID_PATH_CHARS.test(p);
    }
    module2.exports = {
      getRootPath,
      invalidWin32Path
    };
  }
});

// node_modules/fs-extra/lib/mkdirs/mkdirs.js
var require_mkdirs = __commonJS({
  "node_modules/fs-extra/lib/mkdirs/mkdirs.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var invalidWin32Path = require_win32().invalidWin32Path;
    var o777 = parseInt("0777", 8);
    function mkdirs(p, opts, callback, made) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      } else if (!opts || typeof opts !== "object") {
        opts = { mode: opts };
      }
      if (process.platform === "win32" && invalidWin32Path(p)) {
        const errInval = new Error(p + " contains invalid WIN32 path characters.");
        errInval.code = "EINVAL";
        return callback(errInval);
      }
      let mode = opts.mode;
      const xfs = opts.fs || fs6;
      if (mode === void 0) {
        mode = o777 & ~process.umask();
      }
      if (!made)
        made = null;
      callback = callback || function() {
      };
      p = path4.resolve(p);
      xfs.mkdir(p, mode, (er) => {
        if (!er) {
          made = made || p;
          return callback(null, made);
        }
        switch (er.code) {
          case "ENOENT":
            if (path4.dirname(p) === p)
              return callback(er);
            mkdirs(path4.dirname(p), opts, (er2, made2) => {
              if (er2)
                callback(er2, made2);
              else
                mkdirs(p, opts, callback, made2);
            });
            break;
          default:
            xfs.stat(p, (er2, stat) => {
              if (er2 || !stat.isDirectory())
                callback(er, made);
              else
                callback(null, made);
            });
            break;
        }
      });
    }
    module2.exports = mkdirs;
  }
});

// node_modules/fs-extra/lib/mkdirs/mkdirs-sync.js
var require_mkdirs_sync = __commonJS({
  "node_modules/fs-extra/lib/mkdirs/mkdirs-sync.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var invalidWin32Path = require_win32().invalidWin32Path;
    var o777 = parseInt("0777", 8);
    function mkdirsSync(p, opts, made) {
      if (!opts || typeof opts !== "object") {
        opts = { mode: opts };
      }
      let mode = opts.mode;
      const xfs = opts.fs || fs6;
      if (process.platform === "win32" && invalidWin32Path(p)) {
        const errInval = new Error(p + " contains invalid WIN32 path characters.");
        errInval.code = "EINVAL";
        throw errInval;
      }
      if (mode === void 0) {
        mode = o777 & ~process.umask();
      }
      if (!made)
        made = null;
      p = path4.resolve(p);
      try {
        xfs.mkdirSync(p, mode);
        made = made || p;
      } catch (err0) {
        if (err0.code === "ENOENT") {
          if (path4.dirname(p) === p)
            throw err0;
          made = mkdirsSync(path4.dirname(p), opts, made);
          mkdirsSync(p, opts, made);
        } else {
          let stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory())
            throw err0;
        }
      }
      return made;
    }
    module2.exports = mkdirsSync;
  }
});

// node_modules/fs-extra/lib/mkdirs/index.js
var require_mkdirs2 = __commonJS({
  "node_modules/fs-extra/lib/mkdirs/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var mkdirs = u(require_mkdirs());
    var mkdirsSync = require_mkdirs_sync();
    module2.exports = {
      mkdirs,
      mkdirsSync,
      // alias
      mkdirp: mkdirs,
      mkdirpSync: mkdirsSync,
      ensureDir: mkdirs,
      ensureDirSync: mkdirsSync
    };
  }
});

// node_modules/fs-extra/lib/util/utimes.js
var require_utimes = __commonJS({
  "node_modules/fs-extra/lib/util/utimes.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var os = require("os");
    var path4 = require("path");
    function hasMillisResSync() {
      let tmpfile = path4.join("millis-test-sync" + Date.now().toString() + Math.random().toString().slice(2));
      tmpfile = path4.join(os.tmpdir(), tmpfile);
      const d = /* @__PURE__ */ new Date(1435410243862);
      fs6.writeFileSync(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141");
      const fd = fs6.openSync(tmpfile, "r+");
      fs6.futimesSync(fd, d, d);
      fs6.closeSync(fd);
      return fs6.statSync(tmpfile).mtime > 1435410243e3;
    }
    function hasMillisRes(callback) {
      let tmpfile = path4.join("millis-test" + Date.now().toString() + Math.random().toString().slice(2));
      tmpfile = path4.join(os.tmpdir(), tmpfile);
      const d = /* @__PURE__ */ new Date(1435410243862);
      fs6.writeFile(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141", (err) => {
        if (err)
          return callback(err);
        fs6.open(tmpfile, "r+", (err2, fd) => {
          if (err2)
            return callback(err2);
          fs6.futimes(fd, d, d, (err3) => {
            if (err3)
              return callback(err3);
            fs6.close(fd, (err4) => {
              if (err4)
                return callback(err4);
              fs6.stat(tmpfile, (err5, stats) => {
                if (err5)
                  return callback(err5);
                callback(null, stats.mtime > 1435410243e3);
              });
            });
          });
        });
      });
    }
    function timeRemoveMillis(timestamp) {
      if (typeof timestamp === "number") {
        return Math.floor(timestamp / 1e3) * 1e3;
      } else if (timestamp instanceof Date) {
        return new Date(Math.floor(timestamp.getTime() / 1e3) * 1e3);
      } else {
        throw new Error("fs-extra: timeRemoveMillis() unknown parameter type");
      }
    }
    function utimesMillis(path5, atime, mtime, callback) {
      fs6.open(path5, "r+", (err, fd) => {
        if (err)
          return callback(err);
        fs6.futimes(fd, atime, mtime, (futimesErr) => {
          fs6.close(fd, (closeErr) => {
            if (callback)
              callback(futimesErr || closeErr);
          });
        });
      });
    }
    function utimesMillisSync(path5, atime, mtime) {
      const fd = fs6.openSync(path5, "r+");
      fs6.futimesSync(fd, atime, mtime);
      return fs6.closeSync(fd);
    }
    module2.exports = {
      hasMillisRes,
      hasMillisResSync,
      timeRemoveMillis,
      utimesMillis,
      utimesMillisSync
    };
  }
});

// node_modules/fs-extra/lib/util/buffer.js
var require_buffer = __commonJS({
  "node_modules/fs-extra/lib/util/buffer.js"(exports, module2) {
    "use strict";
    module2.exports = function(size) {
      if (typeof Buffer.allocUnsafe === "function") {
        try {
          return Buffer.allocUnsafe(size);
        } catch (e) {
          return new Buffer(size);
        }
      }
      return new Buffer(size);
    };
  }
});

// node_modules/fs-extra/lib/copy-sync/copy-sync.js
var require_copy_sync = __commonJS({
  "node_modules/fs-extra/lib/copy-sync/copy-sync.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var mkdirpSync4 = require_mkdirs2().mkdirsSync;
    var utimesSync = require_utimes().utimesMillisSync;
    var notExist = Symbol("notExist");
    function copySync(src, dest, opts) {
      if (typeof opts === "function") {
        opts = { filter: opts };
      }
      opts = opts || {};
      opts.clobber = "clobber" in opts ? !!opts.clobber : true;
      opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
      if (opts.preserveTimestamps && process.arch === "ia32") {
        console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
      }
      const destStat = checkPaths(src, dest);
      if (opts.filter && !opts.filter(src, dest))
        return;
      const destParent = path4.dirname(dest);
      if (!fs6.existsSync(destParent))
        mkdirpSync4(destParent);
      return startCopy(destStat, src, dest, opts);
    }
    function startCopy(destStat, src, dest, opts) {
      if (opts.filter && !opts.filter(src, dest))
        return;
      return getStats(destStat, src, dest, opts);
    }
    function getStats(destStat, src, dest, opts) {
      const statSync = opts.dereference ? fs6.statSync : fs6.lstatSync;
      const srcStat = statSync(src);
      if (srcStat.isDirectory())
        return onDir(srcStat, destStat, src, dest, opts);
      else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
        return onFile(srcStat, destStat, src, dest, opts);
      else if (srcStat.isSymbolicLink())
        return onLink(destStat, src, dest, opts);
    }
    function onFile(srcStat, destStat, src, dest, opts) {
      if (destStat === notExist)
        return copyFile(srcStat, src, dest, opts);
      return mayCopyFile(srcStat, src, dest, opts);
    }
    function mayCopyFile(srcStat, src, dest, opts) {
      if (opts.overwrite) {
        fs6.unlinkSync(dest);
        return copyFile(srcStat, src, dest, opts);
      } else if (opts.errorOnExist) {
        throw new Error(`'${dest}' already exists`);
      }
    }
    function copyFile(srcStat, src, dest, opts) {
      if (typeof fs6.copyFileSync === "function") {
        fs6.copyFileSync(src, dest);
        fs6.chmodSync(dest, srcStat.mode);
        if (opts.preserveTimestamps) {
          return utimesSync(dest, srcStat.atime, srcStat.mtime);
        }
        return;
      }
      return copyFileFallback(srcStat, src, dest, opts);
    }
    function copyFileFallback(srcStat, src, dest, opts) {
      const BUF_LENGTH = 64 * 1024;
      const _buff = require_buffer()(BUF_LENGTH);
      const fdr = fs6.openSync(src, "r");
      const fdw = fs6.openSync(dest, "w", srcStat.mode);
      let pos = 0;
      while (pos < srcStat.size) {
        const bytesRead = fs6.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs6.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
      }
      if (opts.preserveTimestamps)
        fs6.futimesSync(fdw, srcStat.atime, srcStat.mtime);
      fs6.closeSync(fdr);
      fs6.closeSync(fdw);
    }
    function onDir(srcStat, destStat, src, dest, opts) {
      if (destStat === notExist)
        return mkDirAndCopy(srcStat, src, dest, opts);
      if (destStat && !destStat.isDirectory()) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
      }
      return copyDir(src, dest, opts);
    }
    function mkDirAndCopy(srcStat, src, dest, opts) {
      fs6.mkdirSync(dest);
      copyDir(src, dest, opts);
      return fs6.chmodSync(dest, srcStat.mode);
    }
    function copyDir(src, dest, opts) {
      fs6.readdirSync(src).forEach((item) => copyDirItem(item, src, dest, opts));
    }
    function copyDirItem(item, src, dest, opts) {
      const srcItem = path4.join(src, item);
      const destItem = path4.join(dest, item);
      const destStat = checkPaths(srcItem, destItem);
      return startCopy(destStat, srcItem, destItem, opts);
    }
    function onLink(destStat, src, dest, opts) {
      let resolvedSrc = fs6.readlinkSync(src);
      if (opts.dereference) {
        resolvedSrc = path4.resolve(process.cwd(), resolvedSrc);
      }
      if (destStat === notExist) {
        return fs6.symlinkSync(resolvedSrc, dest);
      } else {
        let resolvedDest;
        try {
          resolvedDest = fs6.readlinkSync(dest);
        } catch (err) {
          if (err.code === "EINVAL" || err.code === "UNKNOWN")
            return fs6.symlinkSync(resolvedSrc, dest);
          throw err;
        }
        if (opts.dereference) {
          resolvedDest = path4.resolve(process.cwd(), resolvedDest);
        }
        if (isSrcSubdir(resolvedSrc, resolvedDest)) {
          throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
        }
        if (fs6.statSync(dest).isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
          throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
        }
        return copyLink(resolvedSrc, dest);
      }
    }
    function copyLink(resolvedSrc, dest) {
      fs6.unlinkSync(dest);
      return fs6.symlinkSync(resolvedSrc, dest);
    }
    function isSrcSubdir(src, dest) {
      const srcArray = path4.resolve(src).split(path4.sep);
      const destArray = path4.resolve(dest).split(path4.sep);
      return srcArray.reduce((acc, current, i) => acc && destArray[i] === current, true);
    }
    function checkStats(src, dest) {
      const srcStat = fs6.statSync(src);
      let destStat;
      try {
        destStat = fs6.statSync(dest);
      } catch (err) {
        if (err.code === "ENOENT")
          return { srcStat, destStat: notExist };
        throw err;
      }
      return { srcStat, destStat };
    }
    function checkPaths(src, dest) {
      const { srcStat, destStat } = checkStats(src, dest);
      if (destStat.ino && destStat.ino === srcStat.ino) {
        throw new Error("Source and destination must not be the same.");
      }
      if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
      }
      return destStat;
    }
    module2.exports = copySync;
  }
});

// node_modules/fs-extra/lib/copy-sync/index.js
var require_copy_sync2 = __commonJS({
  "node_modules/fs-extra/lib/copy-sync/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      copySync: require_copy_sync()
    };
  }
});

// node_modules/fs-extra/lib/path-exists/index.js
var require_path_exists = __commonJS({
  "node_modules/fs-extra/lib/path-exists/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromPromise;
    var fs6 = require_fs();
    function pathExists(path4) {
      return fs6.access(path4).then(() => true).catch(() => false);
    }
    module2.exports = {
      pathExists: u(pathExists),
      pathExistsSync: fs6.existsSync
    };
  }
});

// node_modules/fs-extra/lib/copy/copy.js
var require_copy = __commonJS({
  "node_modules/fs-extra/lib/copy/copy.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var mkdirp = require_mkdirs2().mkdirs;
    var pathExists = require_path_exists().pathExists;
    var utimes = require_utimes().utimesMillis;
    var notExist = Symbol("notExist");
    function copy(src, dest, opts, cb) {
      if (typeof opts === "function" && !cb) {
        cb = opts;
        opts = {};
      } else if (typeof opts === "function") {
        opts = { filter: opts };
      }
      cb = cb || function() {
      };
      opts = opts || {};
      opts.clobber = "clobber" in opts ? !!opts.clobber : true;
      opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
      if (opts.preserveTimestamps && process.arch === "ia32") {
        console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
      }
      checkPaths(src, dest, (err, destStat) => {
        if (err)
          return cb(err);
        if (opts.filter)
          return handleFilter(checkParentDir, destStat, src, dest, opts, cb);
        return checkParentDir(destStat, src, dest, opts, cb);
      });
    }
    function checkParentDir(destStat, src, dest, opts, cb) {
      const destParent = path4.dirname(dest);
      pathExists(destParent, (err, dirExists) => {
        if (err)
          return cb(err);
        if (dirExists)
          return startCopy(destStat, src, dest, opts, cb);
        mkdirp(destParent, (err2) => {
          if (err2)
            return cb(err2);
          return startCopy(destStat, src, dest, opts, cb);
        });
      });
    }
    function handleFilter(onInclude, destStat, src, dest, opts, cb) {
      Promise.resolve(opts.filter(src, dest)).then((include) => {
        if (include) {
          if (destStat)
            return onInclude(destStat, src, dest, opts, cb);
          return onInclude(src, dest, opts, cb);
        }
        return cb();
      }, (error) => cb(error));
    }
    function startCopy(destStat, src, dest, opts, cb) {
      if (opts.filter)
        return handleFilter(getStats, destStat, src, dest, opts, cb);
      return getStats(destStat, src, dest, opts, cb);
    }
    function getStats(destStat, src, dest, opts, cb) {
      const stat = opts.dereference ? fs6.stat : fs6.lstat;
      stat(src, (err, srcStat) => {
        if (err)
          return cb(err);
        if (srcStat.isDirectory())
          return onDir(srcStat, destStat, src, dest, opts, cb);
        else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
          return onFile(srcStat, destStat, src, dest, opts, cb);
        else if (srcStat.isSymbolicLink())
          return onLink(destStat, src, dest, opts, cb);
      });
    }
    function onFile(srcStat, destStat, src, dest, opts, cb) {
      if (destStat === notExist)
        return copyFile(srcStat, src, dest, opts, cb);
      return mayCopyFile(srcStat, src, dest, opts, cb);
    }
    function mayCopyFile(srcStat, src, dest, opts, cb) {
      if (opts.overwrite) {
        fs6.unlink(dest, (err) => {
          if (err)
            return cb(err);
          return copyFile(srcStat, src, dest, opts, cb);
        });
      } else if (opts.errorOnExist) {
        return cb(new Error(`'${dest}' already exists`));
      } else
        return cb();
    }
    function copyFile(srcStat, src, dest, opts, cb) {
      if (typeof fs6.copyFile === "function") {
        return fs6.copyFile(src, dest, (err) => {
          if (err)
            return cb(err);
          return setDestModeAndTimestamps(srcStat, dest, opts, cb);
        });
      }
      return copyFileFallback(srcStat, src, dest, opts, cb);
    }
    function copyFileFallback(srcStat, src, dest, opts, cb) {
      const rs = fs6.createReadStream(src);
      rs.on("error", (err) => cb(err)).once("open", () => {
        const ws = fs6.createWriteStream(dest, { mode: srcStat.mode });
        ws.on("error", (err) => cb(err)).on("open", () => rs.pipe(ws)).once("close", () => setDestModeAndTimestamps(srcStat, dest, opts, cb));
      });
    }
    function setDestModeAndTimestamps(srcStat, dest, opts, cb) {
      fs6.chmod(dest, srcStat.mode, (err) => {
        if (err)
          return cb(err);
        if (opts.preserveTimestamps) {
          return utimes(dest, srcStat.atime, srcStat.mtime, cb);
        }
        return cb();
      });
    }
    function onDir(srcStat, destStat, src, dest, opts, cb) {
      if (destStat === notExist)
        return mkDirAndCopy(srcStat, src, dest, opts, cb);
      if (destStat && !destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
      }
      return copyDir(src, dest, opts, cb);
    }
    function mkDirAndCopy(srcStat, src, dest, opts, cb) {
      fs6.mkdir(dest, (err) => {
        if (err)
          return cb(err);
        copyDir(src, dest, opts, (err2) => {
          if (err2)
            return cb(err2);
          return fs6.chmod(dest, srcStat.mode, cb);
        });
      });
    }
    function copyDir(src, dest, opts, cb) {
      fs6.readdir(src, (err, items) => {
        if (err)
          return cb(err);
        return copyDirItems(items, src, dest, opts, cb);
      });
    }
    function copyDirItems(items, src, dest, opts, cb) {
      const item = items.pop();
      if (!item)
        return cb();
      return copyDirItem(items, item, src, dest, opts, cb);
    }
    function copyDirItem(items, item, src, dest, opts, cb) {
      const srcItem = path4.join(src, item);
      const destItem = path4.join(dest, item);
      checkPaths(srcItem, destItem, (err, destStat) => {
        if (err)
          return cb(err);
        startCopy(destStat, srcItem, destItem, opts, (err2) => {
          if (err2)
            return cb(err2);
          return copyDirItems(items, src, dest, opts, cb);
        });
      });
    }
    function onLink(destStat, src, dest, opts, cb) {
      fs6.readlink(src, (err, resolvedSrc) => {
        if (err)
          return cb(err);
        if (opts.dereference) {
          resolvedSrc = path4.resolve(process.cwd(), resolvedSrc);
        }
        if (destStat === notExist) {
          return fs6.symlink(resolvedSrc, dest, cb);
        } else {
          fs6.readlink(dest, (err2, resolvedDest) => {
            if (err2) {
              if (err2.code === "EINVAL" || err2.code === "UNKNOWN")
                return fs6.symlink(resolvedSrc, dest, cb);
              return cb(err2);
            }
            if (opts.dereference) {
              resolvedDest = path4.resolve(process.cwd(), resolvedDest);
            }
            if (isSrcSubdir(resolvedSrc, resolvedDest)) {
              return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
            }
            if (destStat.isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
              return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
            }
            return copyLink(resolvedSrc, dest, cb);
          });
        }
      });
    }
    function copyLink(resolvedSrc, dest, cb) {
      fs6.unlink(dest, (err) => {
        if (err)
          return cb(err);
        return fs6.symlink(resolvedSrc, dest, cb);
      });
    }
    function isSrcSubdir(src, dest) {
      const srcArray = path4.resolve(src).split(path4.sep);
      const destArray = path4.resolve(dest).split(path4.sep);
      return srcArray.reduce((acc, current, i) => acc && destArray[i] === current, true);
    }
    function checkStats(src, dest, cb) {
      fs6.stat(src, (err, srcStat) => {
        if (err)
          return cb(err);
        fs6.stat(dest, (err2, destStat) => {
          if (err2) {
            if (err2.code === "ENOENT")
              return cb(null, { srcStat, destStat: notExist });
            return cb(err2);
          }
          return cb(null, { srcStat, destStat });
        });
      });
    }
    function checkPaths(src, dest, cb) {
      checkStats(src, dest, (err, stats) => {
        if (err)
          return cb(err);
        const { srcStat, destStat } = stats;
        if (destStat.ino && destStat.ino === srcStat.ino) {
          return cb(new Error("Source and destination must not be the same."));
        }
        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
          return cb(new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`));
        }
        return cb(null, destStat);
      });
    }
    module2.exports = copy;
  }
});

// node_modules/fs-extra/lib/copy/index.js
var require_copy2 = __commonJS({
  "node_modules/fs-extra/lib/copy/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    module2.exports = {
      copy: u(require_copy())
    };
  }
});

// node_modules/fs-extra/lib/remove/rimraf.js
var require_rimraf = __commonJS({
  "node_modules/fs-extra/lib/remove/rimraf.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var assert = require("assert");
    var isWindows = process.platform === "win32";
    function defaults(options) {
      const methods = [
        "unlink",
        "chmod",
        "stat",
        "lstat",
        "rmdir",
        "readdir"
      ];
      methods.forEach((m) => {
        options[m] = options[m] || fs6[m];
        m = m + "Sync";
        options[m] = options[m] || fs6[m];
      });
      options.maxBusyTries = options.maxBusyTries || 3;
    }
    function rimraf(p, options, cb) {
      let busyTries = 0;
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      assert(p, "rimraf: missing path");
      assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
      assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
      assert(options, "rimraf: invalid options argument provided");
      assert.strictEqual(typeof options, "object", "rimraf: options should be object");
      defaults(options);
      rimraf_(p, options, function CB(er) {
        if (er) {
          if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
            busyTries++;
            const time = busyTries * 100;
            return setTimeout(() => rimraf_(p, options, CB), time);
          }
          if (er.code === "ENOENT")
            er = null;
        }
        cb(er);
      });
    }
    function rimraf_(p, options, cb) {
      assert(p);
      assert(options);
      assert(typeof cb === "function");
      options.lstat(p, (er, st) => {
        if (er && er.code === "ENOENT") {
          return cb(null);
        }
        if (er && er.code === "EPERM" && isWindows) {
          return fixWinEPERM(p, options, er, cb);
        }
        if (st && st.isDirectory()) {
          return rmdir(p, options, er, cb);
        }
        options.unlink(p, (er2) => {
          if (er2) {
            if (er2.code === "ENOENT") {
              return cb(null);
            }
            if (er2.code === "EPERM") {
              return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
            }
            if (er2.code === "EISDIR") {
              return rmdir(p, options, er2, cb);
            }
          }
          return cb(er2);
        });
      });
    }
    function fixWinEPERM(p, options, er, cb) {
      assert(p);
      assert(options);
      assert(typeof cb === "function");
      if (er) {
        assert(er instanceof Error);
      }
      options.chmod(p, 438, (er2) => {
        if (er2) {
          cb(er2.code === "ENOENT" ? null : er);
        } else {
          options.stat(p, (er3, stats) => {
            if (er3) {
              cb(er3.code === "ENOENT" ? null : er);
            } else if (stats.isDirectory()) {
              rmdir(p, options, er, cb);
            } else {
              options.unlink(p, cb);
            }
          });
        }
      });
    }
    function fixWinEPERMSync(p, options, er) {
      let stats;
      assert(p);
      assert(options);
      if (er) {
        assert(er instanceof Error);
      }
      try {
        options.chmodSync(p, 438);
      } catch (er2) {
        if (er2.code === "ENOENT") {
          return;
        } else {
          throw er;
        }
      }
      try {
        stats = options.statSync(p);
      } catch (er3) {
        if (er3.code === "ENOENT") {
          return;
        } else {
          throw er;
        }
      }
      if (stats.isDirectory()) {
        rmdirSync(p, options, er);
      } else {
        options.unlinkSync(p);
      }
    }
    function rmdir(p, options, originalEr, cb) {
      assert(p);
      assert(options);
      if (originalEr) {
        assert(originalEr instanceof Error);
      }
      assert(typeof cb === "function");
      options.rmdir(p, (er) => {
        if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) {
          rmkids(p, options, cb);
        } else if (er && er.code === "ENOTDIR") {
          cb(originalEr);
        } else {
          cb(er);
        }
      });
    }
    function rmkids(p, options, cb) {
      assert(p);
      assert(options);
      assert(typeof cb === "function");
      options.readdir(p, (er, files) => {
        if (er)
          return cb(er);
        let n = files.length;
        let errState;
        if (n === 0)
          return options.rmdir(p, cb);
        files.forEach((f) => {
          rimraf(path4.join(p, f), options, (er2) => {
            if (errState) {
              return;
            }
            if (er2)
              return cb(errState = er2);
            if (--n === 0) {
              options.rmdir(p, cb);
            }
          });
        });
      });
    }
    function rimrafSync(p, options) {
      let st;
      options = options || {};
      defaults(options);
      assert(p, "rimraf: missing path");
      assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
      assert(options, "rimraf: missing options");
      assert.strictEqual(typeof options, "object", "rimraf: options should be object");
      try {
        st = options.lstatSync(p);
      } catch (er) {
        if (er.code === "ENOENT") {
          return;
        }
        if (er.code === "EPERM" && isWindows) {
          fixWinEPERMSync(p, options, er);
        }
      }
      try {
        if (st && st.isDirectory()) {
          rmdirSync(p, options, null);
        } else {
          options.unlinkSync(p);
        }
      } catch (er) {
        if (er.code === "ENOENT") {
          return;
        } else if (er.code === "EPERM") {
          return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
        } else if (er.code !== "EISDIR") {
          throw er;
        }
        rmdirSync(p, options, er);
      }
    }
    function rmdirSync(p, options, originalEr) {
      assert(p);
      assert(options);
      if (originalEr) {
        assert(originalEr instanceof Error);
      }
      try {
        options.rmdirSync(p);
      } catch (er) {
        if (er.code === "ENOTDIR") {
          throw originalEr;
        } else if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") {
          rmkidsSync(p, options);
        } else if (er.code !== "ENOENT") {
          throw er;
        }
      }
    }
    function rmkidsSync(p, options) {
      assert(p);
      assert(options);
      options.readdirSync(p).forEach((f) => rimrafSync(path4.join(p, f), options));
      if (isWindows) {
        const startTime = Date.now();
        do {
          try {
            const ret = options.rmdirSync(p, options);
            return ret;
          } catch (er) {
          }
        } while (Date.now() - startTime < 500);
      } else {
        const ret = options.rmdirSync(p, options);
        return ret;
      }
    }
    module2.exports = rimraf;
    rimraf.sync = rimrafSync;
  }
});

// node_modules/fs-extra/lib/remove/index.js
var require_remove = __commonJS({
  "node_modules/fs-extra/lib/remove/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var rimraf = require_rimraf();
    module2.exports = {
      remove: u(rimraf),
      removeSync: rimraf.sync
    };
  }
});

// node_modules/fs-extra/lib/empty/index.js
var require_empty = __commonJS({
  "node_modules/fs-extra/lib/empty/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs6 = require("fs");
    var path4 = require("path");
    var mkdir = require_mkdirs2();
    var remove = require_remove();
    var emptyDir = u(function emptyDir2(dir, callback) {
      callback = callback || function() {
      };
      fs6.readdir(dir, (err, items) => {
        if (err)
          return mkdir.mkdirs(dir, callback);
        items = items.map((item) => path4.join(dir, item));
        deleteItem();
        function deleteItem() {
          const item = items.pop();
          if (!item)
            return callback();
          remove.remove(item, (err2) => {
            if (err2)
              return callback(err2);
            deleteItem();
          });
        }
      });
    });
    function emptyDirSync(dir) {
      let items;
      try {
        items = fs6.readdirSync(dir);
      } catch (err) {
        return mkdir.mkdirsSync(dir);
      }
      items.forEach((item) => {
        item = path4.join(dir, item);
        remove.removeSync(item);
      });
    }
    module2.exports = {
      emptyDirSync,
      emptydirSync: emptyDirSync,
      emptyDir,
      emptydir: emptyDir
    };
  }
});

// node_modules/fs-extra/lib/ensure/file.js
var require_file = __commonJS({
  "node_modules/fs-extra/lib/ensure/file.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var path4 = require("path");
    var fs6 = require_graceful_fs();
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    function createFile(file, callback) {
      function makeFile() {
        fs6.writeFile(file, "", (err) => {
          if (err)
            return callback(err);
          callback();
        });
      }
      fs6.stat(file, (err, stats) => {
        if (!err && stats.isFile())
          return callback();
        const dir = path4.dirname(file);
        pathExists(dir, (err2, dirExists) => {
          if (err2)
            return callback(err2);
          if (dirExists)
            return makeFile();
          mkdir.mkdirs(dir, (err3) => {
            if (err3)
              return callback(err3);
            makeFile();
          });
        });
      });
    }
    function createFileSync(file) {
      let stats;
      try {
        stats = fs6.statSync(file);
      } catch (e) {
      }
      if (stats && stats.isFile())
        return;
      const dir = path4.dirname(file);
      if (!fs6.existsSync(dir)) {
        mkdir.mkdirsSync(dir);
      }
      fs6.writeFileSync(file, "");
    }
    module2.exports = {
      createFile: u(createFile),
      createFileSync
    };
  }
});

// node_modules/fs-extra/lib/ensure/link.js
var require_link = __commonJS({
  "node_modules/fs-extra/lib/ensure/link.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var path4 = require("path");
    var fs6 = require_graceful_fs();
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    function createLink(srcpath, dstpath, callback) {
      function makeLink(srcpath2, dstpath2) {
        fs6.link(srcpath2, dstpath2, (err) => {
          if (err)
            return callback(err);
          callback(null);
        });
      }
      pathExists(dstpath, (err, destinationExists) => {
        if (err)
          return callback(err);
        if (destinationExists)
          return callback(null);
        fs6.lstat(srcpath, (err2) => {
          if (err2) {
            err2.message = err2.message.replace("lstat", "ensureLink");
            return callback(err2);
          }
          const dir = path4.dirname(dstpath);
          pathExists(dir, (err3, dirExists) => {
            if (err3)
              return callback(err3);
            if (dirExists)
              return makeLink(srcpath, dstpath);
            mkdir.mkdirs(dir, (err4) => {
              if (err4)
                return callback(err4);
              makeLink(srcpath, dstpath);
            });
          });
        });
      });
    }
    function createLinkSync(srcpath, dstpath) {
      const destinationExists = fs6.existsSync(dstpath);
      if (destinationExists)
        return void 0;
      try {
        fs6.lstatSync(srcpath);
      } catch (err) {
        err.message = err.message.replace("lstat", "ensureLink");
        throw err;
      }
      const dir = path4.dirname(dstpath);
      const dirExists = fs6.existsSync(dir);
      if (dirExists)
        return fs6.linkSync(srcpath, dstpath);
      mkdir.mkdirsSync(dir);
      return fs6.linkSync(srcpath, dstpath);
    }
    module2.exports = {
      createLink: u(createLink),
      createLinkSync
    };
  }
});

// node_modules/fs-extra/lib/ensure/symlink-paths.js
var require_symlink_paths = __commonJS({
  "node_modules/fs-extra/lib/ensure/symlink-paths.js"(exports, module2) {
    "use strict";
    var path4 = require("path");
    var fs6 = require_graceful_fs();
    var pathExists = require_path_exists().pathExists;
    function symlinkPaths(srcpath, dstpath, callback) {
      if (path4.isAbsolute(srcpath)) {
        return fs6.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace("lstat", "ensureSymlink");
            return callback(err);
          }
          return callback(null, {
            "toCwd": srcpath,
            "toDst": srcpath
          });
        });
      } else {
        const dstdir = path4.dirname(dstpath);
        const relativeToDst = path4.join(dstdir, srcpath);
        return pathExists(relativeToDst, (err, exists) => {
          if (err)
            return callback(err);
          if (exists) {
            return callback(null, {
              "toCwd": relativeToDst,
              "toDst": srcpath
            });
          } else {
            return fs6.lstat(srcpath, (err2) => {
              if (err2) {
                err2.message = err2.message.replace("lstat", "ensureSymlink");
                return callback(err2);
              }
              return callback(null, {
                "toCwd": srcpath,
                "toDst": path4.relative(dstdir, srcpath)
              });
            });
          }
        });
      }
    }
    function symlinkPathsSync(srcpath, dstpath) {
      let exists;
      if (path4.isAbsolute(srcpath)) {
        exists = fs6.existsSync(srcpath);
        if (!exists)
          throw new Error("absolute srcpath does not exist");
        return {
          "toCwd": srcpath,
          "toDst": srcpath
        };
      } else {
        const dstdir = path4.dirname(dstpath);
        const relativeToDst = path4.join(dstdir, srcpath);
        exists = fs6.existsSync(relativeToDst);
        if (exists) {
          return {
            "toCwd": relativeToDst,
            "toDst": srcpath
          };
        } else {
          exists = fs6.existsSync(srcpath);
          if (!exists)
            throw new Error("relative srcpath does not exist");
          return {
            "toCwd": srcpath,
            "toDst": path4.relative(dstdir, srcpath)
          };
        }
      }
    }
    module2.exports = {
      symlinkPaths,
      symlinkPathsSync
    };
  }
});

// node_modules/fs-extra/lib/ensure/symlink-type.js
var require_symlink_type = __commonJS({
  "node_modules/fs-extra/lib/ensure/symlink-type.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    function symlinkType(srcpath, type, callback) {
      callback = typeof type === "function" ? type : callback;
      type = typeof type === "function" ? false : type;
      if (type)
        return callback(null, type);
      fs6.lstat(srcpath, (err, stats) => {
        if (err)
          return callback(null, "file");
        type = stats && stats.isDirectory() ? "dir" : "file";
        callback(null, type);
      });
    }
    function symlinkTypeSync(srcpath, type) {
      let stats;
      if (type)
        return type;
      try {
        stats = fs6.lstatSync(srcpath);
      } catch (e) {
        return "file";
      }
      return stats && stats.isDirectory() ? "dir" : "file";
    }
    module2.exports = {
      symlinkType,
      symlinkTypeSync
    };
  }
});

// node_modules/fs-extra/lib/ensure/symlink.js
var require_symlink = __commonJS({
  "node_modules/fs-extra/lib/ensure/symlink.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var path4 = require("path");
    var fs6 = require_graceful_fs();
    var _mkdirs = require_mkdirs2();
    var mkdirs = _mkdirs.mkdirs;
    var mkdirsSync = _mkdirs.mkdirsSync;
    var _symlinkPaths = require_symlink_paths();
    var symlinkPaths = _symlinkPaths.symlinkPaths;
    var symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
    var _symlinkType = require_symlink_type();
    var symlinkType = _symlinkType.symlinkType;
    var symlinkTypeSync = _symlinkType.symlinkTypeSync;
    var pathExists = require_path_exists().pathExists;
    function createSymlink(srcpath, dstpath, type, callback) {
      callback = typeof type === "function" ? type : callback;
      type = typeof type === "function" ? false : type;
      pathExists(dstpath, (err, destinationExists) => {
        if (err)
          return callback(err);
        if (destinationExists)
          return callback(null);
        symlinkPaths(srcpath, dstpath, (err2, relative3) => {
          if (err2)
            return callback(err2);
          srcpath = relative3.toDst;
          symlinkType(relative3.toCwd, type, (err3, type2) => {
            if (err3)
              return callback(err3);
            const dir = path4.dirname(dstpath);
            pathExists(dir, (err4, dirExists) => {
              if (err4)
                return callback(err4);
              if (dirExists)
                return fs6.symlink(srcpath, dstpath, type2, callback);
              mkdirs(dir, (err5) => {
                if (err5)
                  return callback(err5);
                fs6.symlink(srcpath, dstpath, type2, callback);
              });
            });
          });
        });
      });
    }
    function createSymlinkSync(srcpath, dstpath, type) {
      const destinationExists = fs6.existsSync(dstpath);
      if (destinationExists)
        return void 0;
      const relative3 = symlinkPathsSync(srcpath, dstpath);
      srcpath = relative3.toDst;
      type = symlinkTypeSync(relative3.toCwd, type);
      const dir = path4.dirname(dstpath);
      const exists = fs6.existsSync(dir);
      if (exists)
        return fs6.symlinkSync(srcpath, dstpath, type);
      mkdirsSync(dir);
      return fs6.symlinkSync(srcpath, dstpath, type);
    }
    module2.exports = {
      createSymlink: u(createSymlink),
      createSymlinkSync
    };
  }
});

// node_modules/fs-extra/lib/ensure/index.js
var require_ensure = __commonJS({
  "node_modules/fs-extra/lib/ensure/index.js"(exports, module2) {
    "use strict";
    var file = require_file();
    var link = require_link();
    var symlink = require_symlink();
    module2.exports = {
      // file
      createFile: file.createFile,
      createFileSync: file.createFileSync,
      ensureFile: file.createFile,
      ensureFileSync: file.createFileSync,
      // link
      createLink: link.createLink,
      createLinkSync: link.createLinkSync,
      ensureLink: link.createLink,
      ensureLinkSync: link.createLinkSync,
      // symlink
      createSymlink: symlink.createSymlink,
      createSymlinkSync: symlink.createSymlinkSync,
      ensureSymlink: symlink.createSymlink,
      ensureSymlinkSync: symlink.createSymlinkSync
    };
  }
});

// node_modules/jsonfile/index.js
var require_jsonfile = __commonJS({
  "node_modules/jsonfile/index.js"(exports, module2) {
    var _fs;
    try {
      _fs = require_graceful_fs();
    } catch (_) {
      _fs = require("fs");
    }
    function readFile(file, options, callback) {
      if (callback == null) {
        callback = options;
        options = {};
      }
      if (typeof options === "string") {
        options = { encoding: options };
      }
      options = options || {};
      var fs6 = options.fs || _fs;
      var shouldThrow = true;
      if ("throws" in options) {
        shouldThrow = options.throws;
      }
      fs6.readFile(file, options, function(err, data) {
        if (err)
          return callback(err);
        data = stripBom(data);
        var obj;
        try {
          obj = JSON.parse(data, options ? options.reviver : null);
        } catch (err2) {
          if (shouldThrow) {
            err2.message = file + ": " + err2.message;
            return callback(err2);
          } else {
            return callback(null, null);
          }
        }
        callback(null, obj);
      });
    }
    function readFileSync5(file, options) {
      options = options || {};
      if (typeof options === "string") {
        options = { encoding: options };
      }
      var fs6 = options.fs || _fs;
      var shouldThrow = true;
      if ("throws" in options) {
        shouldThrow = options.throws;
      }
      try {
        var content = fs6.readFileSync(file, options);
        content = stripBom(content);
        return JSON.parse(content, options.reviver);
      } catch (err) {
        if (shouldThrow) {
          err.message = file + ": " + err.message;
          throw err;
        } else {
          return null;
        }
      }
    }
    function stringify(obj, options) {
      var spaces;
      var EOL = "\n";
      if (typeof options === "object" && options !== null) {
        if (options.spaces) {
          spaces = options.spaces;
        }
        if (options.EOL) {
          EOL = options.EOL;
        }
      }
      var str = JSON.stringify(obj, options ? options.replacer : null, spaces);
      return str.replace(/\n/g, EOL) + EOL;
    }
    function writeFile(file, obj, options, callback) {
      if (callback == null) {
        callback = options;
        options = {};
      }
      options = options || {};
      var fs6 = options.fs || _fs;
      var str = "";
      try {
        str = stringify(obj, options);
      } catch (err) {
        if (callback)
          callback(err, null);
        return;
      }
      fs6.writeFile(file, str, options, callback);
    }
    function writeFileSync5(file, obj, options) {
      options = options || {};
      var fs6 = options.fs || _fs;
      var str = stringify(obj, options);
      return fs6.writeFileSync(file, str, options);
    }
    function stripBom(content) {
      if (Buffer.isBuffer(content))
        content = content.toString("utf8");
      content = content.replace(/^\uFEFF/, "");
      return content;
    }
    var jsonfile = {
      readFile,
      readFileSync: readFileSync5,
      writeFile,
      writeFileSync: writeFileSync5
    };
    module2.exports = jsonfile;
  }
});

// node_modules/fs-extra/lib/json/jsonfile.js
var require_jsonfile2 = __commonJS({
  "node_modules/fs-extra/lib/json/jsonfile.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var jsonFile2 = require_jsonfile();
    module2.exports = {
      // jsonfile exports
      readJson: u(jsonFile2.readFile),
      readJsonSync: jsonFile2.readFileSync,
      writeJson: u(jsonFile2.writeFile),
      writeJsonSync: jsonFile2.writeFileSync
    };
  }
});

// node_modules/fs-extra/lib/json/output-json.js
var require_output_json = __commonJS({
  "node_modules/fs-extra/lib/json/output-json.js"(exports, module2) {
    "use strict";
    var path4 = require("path");
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    var jsonFile2 = require_jsonfile2();
    function outputJson(file, data, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      const dir = path4.dirname(file);
      pathExists(dir, (err, itDoes) => {
        if (err)
          return callback(err);
        if (itDoes)
          return jsonFile2.writeJson(file, data, options, callback);
        mkdir.mkdirs(dir, (err2) => {
          if (err2)
            return callback(err2);
          jsonFile2.writeJson(file, data, options, callback);
        });
      });
    }
    module2.exports = outputJson;
  }
});

// node_modules/fs-extra/lib/json/output-json-sync.js
var require_output_json_sync = __commonJS({
  "node_modules/fs-extra/lib/json/output-json-sync.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var mkdir = require_mkdirs2();
    var jsonFile2 = require_jsonfile2();
    function outputJsonSync(file, data, options) {
      const dir = path4.dirname(file);
      if (!fs6.existsSync(dir)) {
        mkdir.mkdirsSync(dir);
      }
      jsonFile2.writeJsonSync(file, data, options);
    }
    module2.exports = outputJsonSync;
  }
});

// node_modules/fs-extra/lib/json/index.js
var require_json = __commonJS({
  "node_modules/fs-extra/lib/json/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var jsonFile2 = require_jsonfile2();
    jsonFile2.outputJson = u(require_output_json());
    jsonFile2.outputJsonSync = require_output_json_sync();
    jsonFile2.outputJSON = jsonFile2.outputJson;
    jsonFile2.outputJSONSync = jsonFile2.outputJsonSync;
    jsonFile2.writeJSON = jsonFile2.writeJson;
    jsonFile2.writeJSONSync = jsonFile2.writeJsonSync;
    jsonFile2.readJSON = jsonFile2.readJson;
    jsonFile2.readJSONSync = jsonFile2.readJsonSync;
    module2.exports = jsonFile2;
  }
});

// node_modules/fs-extra/lib/move-sync/index.js
var require_move_sync = __commonJS({
  "node_modules/fs-extra/lib/move-sync/index.js"(exports, module2) {
    "use strict";
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var copySync = require_copy_sync2().copySync;
    var removeSync3 = require_remove().removeSync;
    var mkdirpSync4 = require_mkdirs2().mkdirsSync;
    var buffer = require_buffer();
    function moveSync(src, dest, options) {
      options = options || {};
      const overwrite = options.overwrite || options.clobber || false;
      src = path4.resolve(src);
      dest = path4.resolve(dest);
      if (src === dest)
        return fs6.accessSync(src);
      if (isSrcSubdir(src, dest))
        throw new Error(`Cannot move '${src}' into itself '${dest}'.`);
      mkdirpSync4(path4.dirname(dest));
      tryRenameSync();
      function tryRenameSync() {
        if (overwrite) {
          try {
            return fs6.renameSync(src, dest);
          } catch (err) {
            if (err.code === "ENOTEMPTY" || err.code === "EEXIST" || err.code === "EPERM") {
              removeSync3(dest);
              options.overwrite = false;
              return moveSync(src, dest, options);
            }
            if (err.code !== "EXDEV")
              throw err;
            return moveSyncAcrossDevice(src, dest, overwrite);
          }
        } else {
          try {
            fs6.linkSync(src, dest);
            return fs6.unlinkSync(src);
          } catch (err) {
            if (err.code === "EXDEV" || err.code === "EISDIR" || err.code === "EPERM" || err.code === "ENOTSUP") {
              return moveSyncAcrossDevice(src, dest, overwrite);
            }
            throw err;
          }
        }
      }
    }
    function moveSyncAcrossDevice(src, dest, overwrite) {
      const stat = fs6.statSync(src);
      if (stat.isDirectory()) {
        return moveDirSyncAcrossDevice(src, dest, overwrite);
      } else {
        return moveFileSyncAcrossDevice(src, dest, overwrite);
      }
    }
    function moveFileSyncAcrossDevice(src, dest, overwrite) {
      const BUF_LENGTH = 64 * 1024;
      const _buff = buffer(BUF_LENGTH);
      const flags = overwrite ? "w" : "wx";
      const fdr = fs6.openSync(src, "r");
      const stat = fs6.fstatSync(fdr);
      const fdw = fs6.openSync(dest, flags, stat.mode);
      let pos = 0;
      while (pos < stat.size) {
        const bytesRead = fs6.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs6.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
      }
      fs6.closeSync(fdr);
      fs6.closeSync(fdw);
      return fs6.unlinkSync(src);
    }
    function moveDirSyncAcrossDevice(src, dest, overwrite) {
      const options = {
        overwrite: false
      };
      if (overwrite) {
        removeSync3(dest);
        tryCopySync();
      } else {
        tryCopySync();
      }
      function tryCopySync() {
        copySync(src, dest, options);
        return removeSync3(src);
      }
    }
    function isSrcSubdir(src, dest) {
      try {
        return fs6.statSync(src).isDirectory() && src !== dest && dest.indexOf(src) > -1 && dest.split(path4.dirname(src) + path4.sep)[1].split(path4.sep)[0] === path4.basename(src);
      } catch (e) {
        return false;
      }
    }
    module2.exports = {
      moveSync
    };
  }
});

// node_modules/fs-extra/lib/move/index.js
var require_move = __commonJS({
  "node_modules/fs-extra/lib/move/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var copy = require_copy2().copy;
    var remove = require_remove().remove;
    var mkdirp = require_mkdirs2().mkdirp;
    var pathExists = require_path_exists().pathExists;
    function move(src, dest, opts, cb) {
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      const overwrite = opts.overwrite || opts.clobber || false;
      src = path4.resolve(src);
      dest = path4.resolve(dest);
      if (src === dest)
        return fs6.access(src, cb);
      fs6.stat(src, (err, st) => {
        if (err)
          return cb(err);
        if (st.isDirectory() && isSrcSubdir(src, dest)) {
          return cb(new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`));
        }
        mkdirp(path4.dirname(dest), (err2) => {
          if (err2)
            return cb(err2);
          return doRename(src, dest, overwrite, cb);
        });
      });
    }
    function doRename(src, dest, overwrite, cb) {
      if (overwrite) {
        return remove(dest, (err) => {
          if (err)
            return cb(err);
          return rename(src, dest, overwrite, cb);
        });
      }
      pathExists(dest, (err, destExists) => {
        if (err)
          return cb(err);
        if (destExists)
          return cb(new Error("dest already exists."));
        return rename(src, dest, overwrite, cb);
      });
    }
    function rename(src, dest, overwrite, cb) {
      fs6.rename(src, dest, (err) => {
        if (!err)
          return cb();
        if (err.code !== "EXDEV")
          return cb(err);
        return moveAcrossDevice(src, dest, overwrite, cb);
      });
    }
    function moveAcrossDevice(src, dest, overwrite, cb) {
      const opts = {
        overwrite,
        errorOnExist: true
      };
      copy(src, dest, opts, (err) => {
        if (err)
          return cb(err);
        return remove(src, cb);
      });
    }
    function isSrcSubdir(src, dest) {
      const srcArray = src.split(path4.sep);
      const destArray = dest.split(path4.sep);
      return srcArray.reduce((acc, current, i) => {
        return acc && destArray[i] === current;
      }, true);
    }
    module2.exports = {
      move: u(move)
    };
  }
});

// node_modules/fs-extra/lib/output/index.js
var require_output = __commonJS({
  "node_modules/fs-extra/lib/output/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs6 = require_graceful_fs();
    var path4 = require("path");
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    function outputFile(file, data, encoding, callback) {
      if (typeof encoding === "function") {
        callback = encoding;
        encoding = "utf8";
      }
      const dir = path4.dirname(file);
      pathExists(dir, (err, itDoes) => {
        if (err)
          return callback(err);
        if (itDoes)
          return fs6.writeFile(file, data, encoding, callback);
        mkdir.mkdirs(dir, (err2) => {
          if (err2)
            return callback(err2);
          fs6.writeFile(file, data, encoding, callback);
        });
      });
    }
    function outputFileSync(file, ...args2) {
      const dir = path4.dirname(file);
      if (fs6.existsSync(dir)) {
        return fs6.writeFileSync(file, ...args2);
      }
      mkdir.mkdirsSync(dir);
      fs6.writeFileSync(file, ...args2);
    }
    module2.exports = {
      outputFile: u(outputFile),
      outputFileSync
    };
  }
});

// node_modules/fs-extra/lib/index.js
var require_lib = __commonJS({
  "node_modules/fs-extra/lib/index.js"(exports, module2) {
    "use strict";
    module2.exports = Object.assign(
      {},
      // Export promiseified graceful-fs:
      require_fs(),
      // Export extra methods:
      require_copy_sync2(),
      require_copy2(),
      require_empty(),
      require_ensure(),
      require_json(),
      require_mkdirs2(),
      require_move_sync(),
      require_move(),
      require_output(),
      require_path_exists(),
      require_remove()
    );
    var fs6 = require("fs");
    if (Object.getOwnPropertyDescriptor(fs6, "promises")) {
      Object.defineProperty(module2.exports, "promises", {
        get() {
          return fs6.promises;
        }
      });
    }
  }
});

// node_modules/object-keys/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/object-keys/isArguments.js"(exports, module2) {
    "use strict";
    var toStr = Object.prototype.toString;
    module2.exports = function isArguments(value) {
      var str = toStr.call(value);
      var isArgs = str === "[object Arguments]";
      if (!isArgs) {
        isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
      }
      return isArgs;
    };
  }
});

// node_modules/object-keys/implementation.js
var require_implementation = __commonJS({
  "node_modules/object-keys/implementation.js"(exports, module2) {
    "use strict";
    var keysShim;
    if (!Object.keys) {
      has = Object.prototype.hasOwnProperty;
      toStr = Object.prototype.toString;
      isArgs = require_isArguments();
      isEnumerable = Object.prototype.propertyIsEnumerable;
      hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
      hasProtoEnumBug = isEnumerable.call(function() {
      }, "prototype");
      dontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor"
      ];
      equalsConstructorPrototype = function(o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
      };
      excludedKeys = {
        $applicationCache: true,
        $console: true,
        $external: true,
        $frame: true,
        $frameElement: true,
        $frames: true,
        $innerHeight: true,
        $innerWidth: true,
        $onmozfullscreenchange: true,
        $onmozfullscreenerror: true,
        $outerHeight: true,
        $outerWidth: true,
        $pageXOffset: true,
        $pageYOffset: true,
        $parent: true,
        $scrollLeft: true,
        $scrollTop: true,
        $scrollX: true,
        $scrollY: true,
        $self: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $window: true
      };
      hasAutomationEqualityBug = function() {
        if (typeof window === "undefined") {
          return false;
        }
        for (var k in window) {
          try {
            if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
              try {
                equalsConstructorPrototype(window[k]);
              } catch (e) {
                return true;
              }
            }
          } catch (e) {
            return true;
          }
        }
        return false;
      }();
      equalsConstructorPrototypeIfNotBuggy = function(o) {
        if (typeof window === "undefined" || !hasAutomationEqualityBug) {
          return equalsConstructorPrototype(o);
        }
        try {
          return equalsConstructorPrototype(o);
        } catch (e) {
          return false;
        }
      };
      keysShim = function keys(object) {
        var isObject = object !== null && typeof object === "object";
        var isFunction = toStr.call(object) === "[object Function]";
        var isArguments = isArgs(object);
        var isString = isObject && toStr.call(object) === "[object String]";
        var theKeys = [];
        if (!isObject && !isFunction && !isArguments) {
          throw new TypeError("Object.keys called on a non-object");
        }
        var skipProto = hasProtoEnumBug && isFunction;
        if (isString && object.length > 0 && !has.call(object, 0)) {
          for (var i = 0; i < object.length; ++i) {
            theKeys.push(String(i));
          }
        }
        if (isArguments && object.length > 0) {
          for (var j = 0; j < object.length; ++j) {
            theKeys.push(String(j));
          }
        } else {
          for (var name in object) {
            if (!(skipProto && name === "prototype") && has.call(object, name)) {
              theKeys.push(String(name));
            }
          }
        }
        if (hasDontEnumBug) {
          var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
          for (var k = 0; k < dontEnums.length; ++k) {
            if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
              theKeys.push(dontEnums[k]);
            }
          }
        }
        return theKeys;
      };
    }
    var has;
    var toStr;
    var isArgs;
    var isEnumerable;
    var hasDontEnumBug;
    var hasProtoEnumBug;
    var dontEnums;
    var equalsConstructorPrototype;
    var excludedKeys;
    var hasAutomationEqualityBug;
    var equalsConstructorPrototypeIfNotBuggy;
    module2.exports = keysShim;
  }
});

// node_modules/object-keys/index.js
var require_object_keys = __commonJS({
  "node_modules/object-keys/index.js"(exports, module2) {
    "use strict";
    var slice = Array.prototype.slice;
    var isArgs = require_isArguments();
    var origKeys = Object.keys;
    var keysShim = origKeys ? function keys(o) {
      return origKeys(o);
    } : require_implementation();
    var originalKeys = Object.keys;
    keysShim.shim = function shimObjectKeys() {
      if (Object.keys) {
        var keysWorksWithArguments = function() {
          var args2 = Object.keys(arguments);
          return args2 && args2.length === arguments.length;
        }(1, 2);
        if (!keysWorksWithArguments) {
          Object.keys = function keys(object) {
            if (isArgs(object)) {
              return originalKeys(slice.call(object));
            }
            return originalKeys(object);
          };
        }
      } else {
        Object.keys = keysShim;
      }
      return Object.keys || keysShim;
    };
    module2.exports = keysShim;
  }
});

// node_modules/is-arguments/index.js
var require_is_arguments = __commonJS({
  "node_modules/is-arguments/index.js"(exports, module2) {
    "use strict";
    var hasToStringTag = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
    var toStr = Object.prototype.toString;
    var isStandardArguments = function isArguments(value) {
      if (hasToStringTag && value && typeof value === "object" && Symbol.toStringTag in value) {
        return false;
      }
      return toStr.call(value) === "[object Arguments]";
    };
    var isLegacyArguments = function isArguments(value) {
      if (isStandardArguments(value)) {
        return true;
      }
      return value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value) !== "[object Array]" && toStr.call(value.callee) === "[object Function]";
    };
    var supportsStandardArguments = function() {
      return isStandardArguments(arguments);
    }();
    isStandardArguments.isLegacyArguments = isLegacyArguments;
    module2.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
  }
});

// node_modules/object-is/index.js
var require_object_is = __commonJS({
  "node_modules/object-is/index.js"(exports, module2) {
    "use strict";
    var NumberIsNaN = function(value) {
      return value !== value;
    };
    module2.exports = function is(a, b) {
      if (a === 0 && b === 0) {
        return 1 / a === 1 / b;
      } else if (a === b) {
        return true;
      } else if (NumberIsNaN(a) && NumberIsNaN(b)) {
        return true;
      }
      return false;
    };
  }
});

// node_modules/function-bind/implementation.js
var require_implementation2 = __commonJS({
  "node_modules/function-bind/implementation.js"(exports, module2) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var slice = Array.prototype.slice;
    var toStr = Object.prototype.toString;
    var funcType = "[object Function]";
    module2.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args2 = slice.call(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            args2.concat(slice.call(arguments))
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        } else {
          return target.apply(
            that,
            args2.concat(slice.call(arguments))
          );
        }
      };
      var boundLength = Math.max(0, target.length - args2.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs.push("$" + i);
      }
      bound = Function("binder", "return function (" + boundArgs.join(",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation2();
    module2.exports = Function.prototype.bind || implementation;
  }
});

// node_modules/has/src/index.js
var require_src = __commonJS({
  "node_modules/has/src/index.js"(exports, module2) {
    "use strict";
    var bind = require_function_bind();
    module2.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
  }
});

// node_modules/is-regex/index.js
var require_is_regex = __commonJS({
  "node_modules/is-regex/index.js"(exports, module2) {
    "use strict";
    var has = require_src();
    var regexExec = RegExp.prototype.exec;
    var gOPD = Object.getOwnPropertyDescriptor;
    var tryRegexExecCall = function tryRegexExec(value) {
      try {
        var lastIndex = value.lastIndex;
        value.lastIndex = 0;
        regexExec.call(value);
        return true;
      } catch (e) {
        return false;
      } finally {
        value.lastIndex = lastIndex;
      }
    };
    var toStr = Object.prototype.toString;
    var regexClass = "[object RegExp]";
    var hasToStringTag = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
    module2.exports = function isRegex(value) {
      if (!value || typeof value !== "object") {
        return false;
      }
      if (!hasToStringTag) {
        return toStr.call(value) === regexClass;
      }
      var descriptor = gOPD(value, "lastIndex");
      var hasLastIndexDataProperty = descriptor && has(descriptor, "value");
      if (!hasLastIndexDataProperty) {
        return false;
      }
      return tryRegexExecCall(value);
    };
  }
});

// node_modules/define-properties/index.js
var require_define_properties = __commonJS({
  "node_modules/define-properties/index.js"(exports, module2) {
    "use strict";
    var keys = require_object_keys();
    var hasSymbols = typeof Symbol === "function" && typeof Symbol("foo") === "symbol";
    var toStr = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var origDefineProperty = Object.defineProperty;
    var isFunction = function(fn) {
      return typeof fn === "function" && toStr.call(fn) === "[object Function]";
    };
    var arePropertyDescriptorsSupported = function() {
      var obj = {};
      try {
        origDefineProperty(obj, "x", { enumerable: false, value: obj });
        for (var _ in obj) {
          return false;
        }
        return obj.x === obj;
      } catch (e) {
        return false;
      }
    };
    var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();
    var defineProperty = function(object, name, value, predicate) {
      if (name in object && (!isFunction(predicate) || !predicate())) {
        return;
      }
      if (supportsDescriptors) {
        origDefineProperty(object, name, {
          configurable: true,
          enumerable: false,
          value,
          writable: true
        });
      } else {
        object[name] = value;
      }
    };
    var defineProperties = function(object, map) {
      var predicates = arguments.length > 2 ? arguments[2] : {};
      var props = keys(map);
      if (hasSymbols) {
        props = concat.call(props, Object.getOwnPropertySymbols(map));
      }
      for (var i = 0; i < props.length; i += 1) {
        defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
      }
    };
    defineProperties.supportsDescriptors = !!supportsDescriptors;
    module2.exports = defineProperties;
  }
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "node_modules/has-symbols/shams.js"(exports, module2) {
    "use strict";
    module2.exports = function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (sym in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "node_modules/has-symbols/index.js"(exports, module2) {
    "use strict";
    var origSymbol = global.Symbol;
    var hasSymbolSham = require_shams();
    module2.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
  }
});

// node_modules/es-abstract/GetIntrinsic.js
var require_GetIntrinsic = __commonJS({
  "node_modules/es-abstract/GetIntrinsic.js"(exports, module2) {
    "use strict";
    var undefined2;
    var $TypeError = TypeError;
    var $gOPD = Object.getOwnPropertyDescriptor;
    var throwTypeError = function() {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD ? function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    }() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = Object.getPrototypeOf || function(x) {
      return x.__proto__;
    };
    var generator;
    var generatorFunction = generator ? getProto(generator) : undefined2;
    var asyncFn;
    var asyncFunction = asyncFn ? asyncFn.constructor : undefined2;
    var asyncGen;
    var asyncGenFunction = asyncGen ? getProto(asyncGen) : undefined2;
    var asyncGenIterator = asyncGen ? asyncGen() : undefined2;
    var TypedArray = typeof Uint8Array === "undefined" ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      "$ %Array%": Array,
      "$ %ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "$ %ArrayBufferPrototype%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer.prototype,
      "$ %ArrayIteratorPrototype%": hasSymbols ? getProto([][Symbol.iterator]()) : undefined2,
      "$ %ArrayPrototype%": Array.prototype,
      "$ %ArrayProto_entries%": Array.prototype.entries,
      "$ %ArrayProto_forEach%": Array.prototype.forEach,
      "$ %ArrayProto_keys%": Array.prototype.keys,
      "$ %ArrayProto_values%": Array.prototype.values,
      "$ %AsyncFromSyncIteratorPrototype%": undefined2,
      "$ %AsyncFunction%": asyncFunction,
      "$ %AsyncFunctionPrototype%": asyncFunction ? asyncFunction.prototype : undefined2,
      "$ %AsyncGenerator%": asyncGen ? getProto(asyncGenIterator) : undefined2,
      "$ %AsyncGeneratorFunction%": asyncGenFunction,
      "$ %AsyncGeneratorPrototype%": asyncGenFunction ? asyncGenFunction.prototype : undefined2,
      "$ %AsyncIteratorPrototype%": asyncGenIterator && hasSymbols && Symbol.asyncIterator ? asyncGenIterator[Symbol.asyncIterator]() : undefined2,
      "$ %Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "$ %Boolean%": Boolean,
      "$ %BooleanPrototype%": Boolean.prototype,
      "$ %DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "$ %DataViewPrototype%": typeof DataView === "undefined" ? undefined2 : DataView.prototype,
      "$ %Date%": Date,
      "$ %DatePrototype%": Date.prototype,
      "$ %decodeURI%": decodeURI,
      "$ %decodeURIComponent%": decodeURIComponent,
      "$ %encodeURI%": encodeURI,
      "$ %encodeURIComponent%": encodeURIComponent,
      "$ %Error%": Error,
      "$ %ErrorPrototype%": Error.prototype,
      "$ %eval%": eval,
      // eslint-disable-line no-eval
      "$ %EvalError%": EvalError,
      "$ %EvalErrorPrototype%": EvalError.prototype,
      "$ %Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "$ %Float32ArrayPrototype%": typeof Float32Array === "undefined" ? undefined2 : Float32Array.prototype,
      "$ %Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "$ %Float64ArrayPrototype%": typeof Float64Array === "undefined" ? undefined2 : Float64Array.prototype,
      "$ %Function%": Function,
      "$ %FunctionPrototype%": Function.prototype,
      "$ %Generator%": generator ? getProto(generator()) : undefined2,
      "$ %GeneratorFunction%": generatorFunction,
      "$ %GeneratorPrototype%": generatorFunction ? generatorFunction.prototype : undefined2,
      "$ %Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "$ %Int8ArrayPrototype%": typeof Int8Array === "undefined" ? undefined2 : Int8Array.prototype,
      "$ %Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "$ %Int16ArrayPrototype%": typeof Int16Array === "undefined" ? undefined2 : Int8Array.prototype,
      "$ %Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "$ %Int32ArrayPrototype%": typeof Int32Array === "undefined" ? undefined2 : Int32Array.prototype,
      "$ %isFinite%": isFinite,
      "$ %isNaN%": isNaN,
      "$ %IteratorPrototype%": hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "$ %JSON%": typeof JSON === "object" ? JSON : undefined2,
      "$ %JSONParse%": typeof JSON === "object" ? JSON.parse : undefined2,
      "$ %Map%": typeof Map === "undefined" ? undefined2 : Map,
      "$ %MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "$ %MapPrototype%": typeof Map === "undefined" ? undefined2 : Map.prototype,
      "$ %Math%": Math,
      "$ %Number%": Number,
      "$ %NumberPrototype%": Number.prototype,
      "$ %Object%": Object,
      "$ %ObjectPrototype%": Object.prototype,
      "$ %ObjProto_toString%": Object.prototype.toString,
      "$ %ObjProto_valueOf%": Object.prototype.valueOf,
      "$ %parseFloat%": parseFloat,
      "$ %parseInt%": parseInt,
      "$ %Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "$ %PromisePrototype%": typeof Promise === "undefined" ? undefined2 : Promise.prototype,
      "$ %PromiseProto_then%": typeof Promise === "undefined" ? undefined2 : Promise.prototype.then,
      "$ %Promise_all%": typeof Promise === "undefined" ? undefined2 : Promise.all,
      "$ %Promise_reject%": typeof Promise === "undefined" ? undefined2 : Promise.reject,
      "$ %Promise_resolve%": typeof Promise === "undefined" ? undefined2 : Promise.resolve,
      "$ %Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "$ %RangeError%": RangeError,
      "$ %RangeErrorPrototype%": RangeError.prototype,
      "$ %ReferenceError%": ReferenceError,
      "$ %ReferenceErrorPrototype%": ReferenceError.prototype,
      "$ %Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "$ %RegExp%": RegExp,
      "$ %RegExpPrototype%": RegExp.prototype,
      "$ %Set%": typeof Set === "undefined" ? undefined2 : Set,
      "$ %SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "$ %SetPrototype%": typeof Set === "undefined" ? undefined2 : Set.prototype,
      "$ %SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "$ %SharedArrayBufferPrototype%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer.prototype,
      "$ %String%": String,
      "$ %StringIteratorPrototype%": hasSymbols ? getProto(""[Symbol.iterator]()) : undefined2,
      "$ %StringPrototype%": String.prototype,
      "$ %Symbol%": hasSymbols ? Symbol : undefined2,
      "$ %SymbolPrototype%": hasSymbols ? Symbol.prototype : undefined2,
      "$ %SyntaxError%": SyntaxError,
      "$ %SyntaxErrorPrototype%": SyntaxError.prototype,
      "$ %ThrowTypeError%": ThrowTypeError,
      "$ %TypedArray%": TypedArray,
      "$ %TypedArrayPrototype%": TypedArray ? TypedArray.prototype : undefined2,
      "$ %TypeError%": $TypeError,
      "$ %TypeErrorPrototype%": $TypeError.prototype,
      "$ %Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "$ %Uint8ArrayPrototype%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array.prototype,
      "$ %Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "$ %Uint8ClampedArrayPrototype%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray.prototype,
      "$ %Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "$ %Uint16ArrayPrototype%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array.prototype,
      "$ %Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "$ %Uint32ArrayPrototype%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array.prototype,
      "$ %URIError%": URIError,
      "$ %URIErrorPrototype%": URIError.prototype,
      "$ %WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "$ %WeakMapPrototype%": typeof WeakMap === "undefined" ? undefined2 : WeakMap.prototype,
      "$ %WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
      "$ %WeakSetPrototype%": typeof WeakSet === "undefined" ? undefined2 : WeakSet.prototype
    };
    var bind = require_function_bind();
    var $replace = bind.call(Function.call, String.prototype.replace);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var result = [];
      $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var key = "$ " + name;
      if (!(key in INTRINSICS)) {
        throw new SyntaxError("intrinsic " + name + " does not exist!");
      }
      if (typeof INTRINSICS[key] === "undefined" && !allowMissing) {
        throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
      }
      return INTRINSICS[key];
    };
    module2.exports = function GetIntrinsic(name, allowMissing) {
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new TypeError('"allowMissing" argument must be a boolean');
      }
      var parts = stringToPath(name);
      if (parts.length === 0) {
        return getBaseIntrinsic(name, allowMissing);
      }
      var value = getBaseIntrinsic("%" + parts[0] + "%", allowMissing);
      for (var i = 1; i < parts.length; i += 1) {
        if (value != null) {
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, parts[i]);
            value = desc ? desc.get || desc.value : value[parts[i]];
          } else {
            value = value[parts[i]];
          }
        }
      }
      return value;
    };
  }
});

// node_modules/es-abstract/helpers/callBind.js
var require_callBind = __commonJS({
  "node_modules/es-abstract/helpers/callBind.js"(exports, module2) {
    "use strict";
    var bind = require_function_bind();
    var GetIntrinsic = require_GetIntrinsic();
    var $Function = GetIntrinsic("%Function%");
    var $apply = $Function.apply;
    var $call = $Function.call;
    module2.exports = function callBind() {
      return bind.apply($call, arguments);
    };
    module2.exports.apply = function applyBind() {
      return bind.apply($apply, arguments);
    };
  }
});

// node_modules/regexp.prototype.flags/implementation.js
var require_implementation3 = __commonJS({
  "node_modules/regexp.prototype.flags/implementation.js"(exports, module2) {
    "use strict";
    var $Object = Object;
    var $TypeError = TypeError;
    module2.exports = function flags() {
      if (this != null && this !== $Object(this)) {
        throw new $TypeError("RegExp.prototype.flags getter called on non-object");
      }
      var result = "";
      if (this.global) {
        result += "g";
      }
      if (this.ignoreCase) {
        result += "i";
      }
      if (this.multiline) {
        result += "m";
      }
      if (this.dotAll) {
        result += "s";
      }
      if (this.unicode) {
        result += "u";
      }
      if (this.sticky) {
        result += "y";
      }
      return result;
    };
  }
});

// node_modules/regexp.prototype.flags/polyfill.js
var require_polyfill = __commonJS({
  "node_modules/regexp.prototype.flags/polyfill.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation3();
    var supportsDescriptors = require_define_properties().supportsDescriptors;
    var $gOPD = Object.getOwnPropertyDescriptor;
    var $TypeError = TypeError;
    module2.exports = function getPolyfill() {
      if (!supportsDescriptors) {
        throw new $TypeError("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");
      }
      if (/a/mig.flags === "gim") {
        var descriptor = $gOPD(RegExp.prototype, "flags");
        if (descriptor && typeof descriptor.get === "function" && typeof /a/.dotAll === "boolean") {
          return descriptor.get;
        }
      }
      return implementation;
    };
  }
});

// node_modules/regexp.prototype.flags/shim.js
var require_shim = __commonJS({
  "node_modules/regexp.prototype.flags/shim.js"(exports, module2) {
    "use strict";
    var supportsDescriptors = require_define_properties().supportsDescriptors;
    var getPolyfill = require_polyfill();
    var gOPD = Object.getOwnPropertyDescriptor;
    var defineProperty = Object.defineProperty;
    var TypeErr = TypeError;
    var getProto = Object.getPrototypeOf;
    var regex = /a/;
    module2.exports = function shimFlags() {
      if (!supportsDescriptors || !getProto) {
        throw new TypeErr("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");
      }
      var polyfill = getPolyfill();
      var proto = getProto(regex);
      var descriptor = gOPD(proto, "flags");
      if (!descriptor || descriptor.get !== polyfill) {
        defineProperty(proto, "flags", {
          configurable: true,
          enumerable: false,
          get: polyfill
        });
      }
      return polyfill;
    };
  }
});

// node_modules/regexp.prototype.flags/index.js
var require_regexp_prototype = __commonJS({
  "node_modules/regexp.prototype.flags/index.js"(exports, module2) {
    "use strict";
    var define2 = require_define_properties();
    var callBind = require_callBind();
    var implementation = require_implementation3();
    var getPolyfill = require_polyfill();
    var shim = require_shim();
    var flagsBound = callBind(implementation);
    define2(flagsBound, {
      getPolyfill,
      implementation,
      shim
    });
    module2.exports = flagsBound;
  }
});

// node_modules/is-date-object/index.js
var require_is_date_object = __commonJS({
  "node_modules/is-date-object/index.js"(exports, module2) {
    "use strict";
    var getDay = Date.prototype.getDay;
    var tryDateObject = function tryDateObject2(value) {
      try {
        getDay.call(value);
        return true;
      } catch (e) {
        return false;
      }
    };
    var toStr = Object.prototype.toString;
    var dateClass = "[object Date]";
    var hasToStringTag = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
    module2.exports = function isDateObject(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
    };
  }
});

// node_modules/deep-equal/index.js
var require_deep_equal = __commonJS({
  "node_modules/deep-equal/index.js"(exports, module2) {
    var objectKeys = require_object_keys();
    var isArguments = require_is_arguments();
    var is = require_object_is();
    var isRegex = require_is_regex();
    var flags = require_regexp_prototype();
    var isDate = require_is_date_object();
    var getTime = Date.prototype.getTime;
    function deepEqual(actual, expected, options) {
      var opts = options || {};
      if (opts.strict ? is(actual, expected) : actual === expected) {
        return true;
      }
      if (!actual || !expected || typeof actual !== "object" && typeof expected !== "object") {
        return opts.strict ? is(actual, expected) : actual == expected;
      }
      return objEquiv(actual, expected, opts);
    }
    function isUndefinedOrNull(value) {
      return value === null || value === void 0;
    }
    function isBuffer(x) {
      if (!x || typeof x !== "object" || typeof x.length !== "number") {
        return false;
      }
      if (typeof x.copy !== "function" || typeof x.slice !== "function") {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== "number") {
        return false;
      }
      return true;
    }
    function objEquiv(a, b, opts) {
      var i, key;
      if (typeof a !== typeof b) {
        return false;
      }
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
        return false;
      }
      if (a.prototype !== b.prototype) {
        return false;
      }
      if (isArguments(a) !== isArguments(b)) {
        return false;
      }
      var aIsRegex = isRegex(a);
      var bIsRegex = isRegex(b);
      if (aIsRegex !== bIsRegex) {
        return false;
      }
      if (aIsRegex || bIsRegex) {
        return a.source === b.source && flags(a) === flags(b);
      }
      if (isDate(a) && isDate(b)) {
        return getTime.call(a) === getTime.call(b);
      }
      var aIsBuffer = isBuffer(a);
      var bIsBuffer = isBuffer(b);
      if (aIsBuffer !== bIsBuffer) {
        return false;
      }
      if (aIsBuffer || bIsBuffer) {
        if (a.length !== b.length) {
          return false;
        }
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
            return false;
          }
        }
        return true;
      }
      if (typeof a !== typeof b) {
        return false;
      }
      try {
        var ka = objectKeys(a);
        var kb = objectKeys(b);
      } catch (e) {
        return false;
      }
      if (ka.length !== kb.length) {
        return false;
      }
      ka.sort();
      kb.sort();
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) {
          return false;
        }
      }
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) {
          return false;
        }
      }
      return true;
    }
    module2.exports = deepEqual;
  }
});

// node_modules/json5/lib/unicode.js
var require_unicode = __commonJS({
  "node_modules/json5/lib/unicode.js"(exports, module2) {
    module2.exports.Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
    module2.exports.ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
    module2.exports.ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;
  }
});

// node_modules/json5/lib/util.js
var require_util = __commonJS({
  "node_modules/json5/lib/util.js"(exports, module2) {
    var unicode = require_unicode();
    module2.exports = {
      isSpaceSeparator(c) {
        return typeof c === "string" && unicode.Space_Separator.test(c);
      },
      isIdStartChar(c) {
        return typeof c === "string" && (c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "$" || c === "_" || unicode.ID_Start.test(c));
      },
      isIdContinueChar(c) {
        return typeof c === "string" && (c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "$" || c === "_" || c === "\u200C" || c === "\u200D" || unicode.ID_Continue.test(c));
      },
      isDigit(c) {
        return typeof c === "string" && /[0-9]/.test(c);
      },
      isHexDigit(c) {
        return typeof c === "string" && /[0-9A-Fa-f]/.test(c);
      }
    };
  }
});

// node_modules/json5/lib/parse.js
var require_parse = __commonJS({
  "node_modules/json5/lib/parse.js"(exports, module2) {
    var util = require_util();
    var source;
    var parseState;
    var stack;
    var pos;
    var line;
    var column;
    var token;
    var key;
    var root;
    module2.exports = function parse2(text, reviver) {
      source = String(text);
      parseState = "start";
      stack = [];
      pos = 0;
      line = 1;
      column = 0;
      token = void 0;
      key = void 0;
      root = void 0;
      do {
        token = lex();
        parseStates[parseState]();
      } while (token.type !== "eof");
      if (typeof reviver === "function") {
        return internalize({ "": root }, "", reviver);
      }
      return root;
    };
    function internalize(holder, name, reviver) {
      const value = holder[name];
      if (value != null && typeof value === "object") {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const key2 = String(i);
            const replacement = internalize(value, key2, reviver);
            if (replacement === void 0) {
              delete value[key2];
            } else {
              Object.defineProperty(value, key2, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        } else {
          for (const key2 in value) {
            const replacement = internalize(value, key2, reviver);
            if (replacement === void 0) {
              delete value[key2];
            } else {
              Object.defineProperty(value, key2, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        }
      }
      return reviver.call(holder, name, value);
    }
    var lexState;
    var buffer;
    var doubleQuote;
    var sign;
    var c;
    function lex() {
      lexState = "default";
      buffer = "";
      doubleQuote = false;
      sign = 1;
      for (; ; ) {
        c = peek();
        const token2 = lexStates[lexState]();
        if (token2) {
          return token2;
        }
      }
    }
    function peek() {
      if (source[pos]) {
        return String.fromCodePoint(source.codePointAt(pos));
      }
    }
    function read() {
      const c2 = peek();
      if (c2 === "\n") {
        line++;
        column = 0;
      } else if (c2) {
        column += c2.length;
      } else {
        column++;
      }
      if (c2) {
        pos += c2.length;
      }
      return c2;
    }
    var lexStates = {
      default() {
        switch (c) {
          case "	":
          case "\v":
          case "\f":
          case " ":
          case "\xA0":
          case "\uFEFF":
          case "\n":
          case "\r":
          case "\u2028":
          case "\u2029":
            read();
            return;
          case "/":
            read();
            lexState = "comment";
            return;
          case void 0:
            read();
            return newToken("eof");
        }
        if (util.isSpaceSeparator(c)) {
          read();
          return;
        }
        return lexStates[parseState]();
      },
      comment() {
        switch (c) {
          case "*":
            read();
            lexState = "multiLineComment";
            return;
          case "/":
            read();
            lexState = "singleLineComment";
            return;
        }
        throw invalidChar(read());
      },
      multiLineComment() {
        switch (c) {
          case "*":
            read();
            lexState = "multiLineCommentAsterisk";
            return;
          case void 0:
            throw invalidChar(read());
        }
        read();
      },
      multiLineCommentAsterisk() {
        switch (c) {
          case "*":
            read();
            return;
          case "/":
            read();
            lexState = "default";
            return;
          case void 0:
            throw invalidChar(read());
        }
        read();
        lexState = "multiLineComment";
      },
      singleLineComment() {
        switch (c) {
          case "\n":
          case "\r":
          case "\u2028":
          case "\u2029":
            read();
            lexState = "default";
            return;
          case void 0:
            read();
            return newToken("eof");
        }
        read();
      },
      value() {
        switch (c) {
          case "{":
          case "[":
            return newToken("punctuator", read());
          case "n":
            read();
            literal("ull");
            return newToken("null", null);
          case "t":
            read();
            literal("rue");
            return newToken("boolean", true);
          case "f":
            read();
            literal("alse");
            return newToken("boolean", false);
          case "-":
          case "+":
            if (read() === "-") {
              sign = -1;
            }
            lexState = "sign";
            return;
          case ".":
            buffer = read();
            lexState = "decimalPointLeading";
            return;
          case "0":
            buffer = read();
            lexState = "zero";
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            buffer = read();
            lexState = "decimalInteger";
            return;
          case "I":
            read();
            literal("nfinity");
            return newToken("numeric", Infinity);
          case "N":
            read();
            literal("aN");
            return newToken("numeric", NaN);
          case '"':
          case "'":
            doubleQuote = read() === '"';
            buffer = "";
            lexState = "string";
            return;
        }
        throw invalidChar(read());
      },
      identifierNameStartEscape() {
        if (c !== "u") {
          throw invalidChar(read());
        }
        read();
        const u = unicodeEscape();
        switch (u) {
          case "$":
          case "_":
            break;
          default:
            if (!util.isIdStartChar(u)) {
              throw invalidIdentifier();
            }
            break;
        }
        buffer += u;
        lexState = "identifierName";
      },
      identifierName() {
        switch (c) {
          case "$":
          case "_":
          case "\u200C":
          case "\u200D":
            buffer += read();
            return;
          case "\\":
            read();
            lexState = "identifierNameEscape";
            return;
        }
        if (util.isIdContinueChar(c)) {
          buffer += read();
          return;
        }
        return newToken("identifier", buffer);
      },
      identifierNameEscape() {
        if (c !== "u") {
          throw invalidChar(read());
        }
        read();
        const u = unicodeEscape();
        switch (u) {
          case "$":
          case "_":
          case "\u200C":
          case "\u200D":
            break;
          default:
            if (!util.isIdContinueChar(u)) {
              throw invalidIdentifier();
            }
            break;
        }
        buffer += u;
        lexState = "identifierName";
      },
      sign() {
        switch (c) {
          case ".":
            buffer = read();
            lexState = "decimalPointLeading";
            return;
          case "0":
            buffer = read();
            lexState = "zero";
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            buffer = read();
            lexState = "decimalInteger";
            return;
          case "I":
            read();
            literal("nfinity");
            return newToken("numeric", sign * Infinity);
          case "N":
            read();
            literal("aN");
            return newToken("numeric", NaN);
        }
        throw invalidChar(read());
      },
      zero() {
        switch (c) {
          case ".":
            buffer += read();
            lexState = "decimalPoint";
            return;
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
          case "x":
          case "X":
            buffer += read();
            lexState = "hexadecimal";
            return;
        }
        return newToken("numeric", sign * 0);
      },
      decimalInteger() {
        switch (c) {
          case ".":
            buffer += read();
            lexState = "decimalPoint";
            return;
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalPointLeading() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalFraction";
          return;
        }
        throw invalidChar(read());
      },
      decimalPoint() {
        switch (c) {
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalFraction";
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalFraction() {
        switch (c) {
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalExponent() {
        switch (c) {
          case "+":
          case "-":
            buffer += read();
            lexState = "decimalExponentSign";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalExponentInteger";
          return;
        }
        throw invalidChar(read());
      },
      decimalExponentSign() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalExponentInteger";
          return;
        }
        throw invalidChar(read());
      },
      decimalExponentInteger() {
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      hexadecimal() {
        if (util.isHexDigit(c)) {
          buffer += read();
          lexState = "hexadecimalInteger";
          return;
        }
        throw invalidChar(read());
      },
      hexadecimalInteger() {
        if (util.isHexDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      string() {
        switch (c) {
          case "\\":
            read();
            buffer += escape();
            return;
          case '"':
            if (doubleQuote) {
              read();
              return newToken("string", buffer);
            }
            buffer += read();
            return;
          case "'":
            if (!doubleQuote) {
              read();
              return newToken("string", buffer);
            }
            buffer += read();
            return;
          case "\n":
          case "\r":
            throw invalidChar(read());
          case "\u2028":
          case "\u2029":
            separatorChar(c);
            break;
          case void 0:
            throw invalidChar(read());
        }
        buffer += read();
      },
      start() {
        switch (c) {
          case "{":
          case "[":
            return newToken("punctuator", read());
        }
        lexState = "value";
      },
      beforePropertyName() {
        switch (c) {
          case "$":
          case "_":
            buffer = read();
            lexState = "identifierName";
            return;
          case "\\":
            read();
            lexState = "identifierNameStartEscape";
            return;
          case "}":
            return newToken("punctuator", read());
          case '"':
          case "'":
            doubleQuote = read() === '"';
            lexState = "string";
            return;
        }
        if (util.isIdStartChar(c)) {
          buffer += read();
          lexState = "identifierName";
          return;
        }
        throw invalidChar(read());
      },
      afterPropertyName() {
        if (c === ":") {
          return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      beforePropertyValue() {
        lexState = "value";
      },
      afterPropertyValue() {
        switch (c) {
          case ",":
          case "}":
            return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      beforeArrayValue() {
        if (c === "]") {
          return newToken("punctuator", read());
        }
        lexState = "value";
      },
      afterArrayValue() {
        switch (c) {
          case ",":
          case "]":
            return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      end() {
        throw invalidChar(read());
      }
    };
    function newToken(type, value) {
      return {
        type,
        value,
        line,
        column
      };
    }
    function literal(s) {
      for (const c2 of s) {
        const p = peek();
        if (p !== c2) {
          throw invalidChar(read());
        }
        read();
      }
    }
    function escape() {
      const c2 = peek();
      switch (c2) {
        case "b":
          read();
          return "\b";
        case "f":
          read();
          return "\f";
        case "n":
          read();
          return "\n";
        case "r":
          read();
          return "\r";
        case "t":
          read();
          return "	";
        case "v":
          read();
          return "\v";
        case "0":
          read();
          if (util.isDigit(peek())) {
            throw invalidChar(read());
          }
          return "\0";
        case "x":
          read();
          return hexEscape();
        case "u":
          read();
          return unicodeEscape();
        case "\n":
        case "\u2028":
        case "\u2029":
          read();
          return "";
        case "\r":
          read();
          if (peek() === "\n") {
            read();
          }
          return "";
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          throw invalidChar(read());
        case void 0:
          throw invalidChar(read());
      }
      return read();
    }
    function hexEscape() {
      let buffer2 = "";
      let c2 = peek();
      if (!util.isHexDigit(c2)) {
        throw invalidChar(read());
      }
      buffer2 += read();
      c2 = peek();
      if (!util.isHexDigit(c2)) {
        throw invalidChar(read());
      }
      buffer2 += read();
      return String.fromCodePoint(parseInt(buffer2, 16));
    }
    function unicodeEscape() {
      let buffer2 = "";
      let count = 4;
      while (count-- > 0) {
        const c2 = peek();
        if (!util.isHexDigit(c2)) {
          throw invalidChar(read());
        }
        buffer2 += read();
      }
      return String.fromCodePoint(parseInt(buffer2, 16));
    }
    var parseStates = {
      start() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        push2();
      },
      beforePropertyName() {
        switch (token.type) {
          case "identifier":
          case "string":
            key = token.value;
            parseState = "afterPropertyName";
            return;
          case "punctuator":
            pop();
            return;
          case "eof":
            throw invalidEOF();
        }
      },
      afterPropertyName() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        parseState = "beforePropertyValue";
      },
      beforePropertyValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        push2();
      },
      beforeArrayValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        if (token.type === "punctuator" && token.value === "]") {
          pop();
          return;
        }
        push2();
      },
      afterPropertyValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        switch (token.value) {
          case ",":
            parseState = "beforePropertyName";
            return;
          case "}":
            pop();
        }
      },
      afterArrayValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        switch (token.value) {
          case ",":
            parseState = "beforeArrayValue";
            return;
          case "]":
            pop();
        }
      },
      end() {
      }
    };
    function push2() {
      let value;
      switch (token.type) {
        case "punctuator":
          switch (token.value) {
            case "{":
              value = {};
              break;
            case "[":
              value = [];
              break;
          }
          break;
        case "null":
        case "boolean":
        case "numeric":
        case "string":
          value = token.value;
          break;
      }
      if (root === void 0) {
        root = value;
      } else {
        const parent = stack[stack.length - 1];
        if (Array.isArray(parent)) {
          parent.push(value);
        } else {
          Object.defineProperty(parent, key, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      if (value !== null && typeof value === "object") {
        stack.push(value);
        if (Array.isArray(value)) {
          parseState = "beforeArrayValue";
        } else {
          parseState = "beforePropertyName";
        }
      } else {
        const current = stack[stack.length - 1];
        if (current == null) {
          parseState = "end";
        } else if (Array.isArray(current)) {
          parseState = "afterArrayValue";
        } else {
          parseState = "afterPropertyValue";
        }
      }
    }
    function pop() {
      stack.pop();
      const current = stack[stack.length - 1];
      if (current == null) {
        parseState = "end";
      } else if (Array.isArray(current)) {
        parseState = "afterArrayValue";
      } else {
        parseState = "afterPropertyValue";
      }
    }
    function invalidChar(c2) {
      if (c2 === void 0) {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
      }
      return syntaxError(`JSON5: invalid character '${formatChar(c2)}' at ${line}:${column}`);
    }
    function invalidEOF() {
      return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
    }
    function invalidIdentifier() {
      column -= 5;
      return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`);
    }
    function separatorChar(c2) {
      console.warn(`JSON5: '${formatChar(c2)}' in strings is not valid ECMAScript; consider escaping`);
    }
    function formatChar(c2) {
      const replacements = {
        "'": "\\'",
        '"': '\\"',
        "\\": "\\\\",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "	": "\\t",
        "\v": "\\v",
        "\0": "\\0",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029"
      };
      if (replacements[c2]) {
        return replacements[c2];
      }
      if (c2 < " ") {
        const hexString = c2.charCodeAt(0).toString(16);
        return "\\x" + ("00" + hexString).substring(hexString.length);
      }
      return c2;
    }
    function syntaxError(message) {
      const err = new SyntaxError(message);
      err.lineNumber = line;
      err.columnNumber = column;
      return err;
    }
  }
});

// node_modules/json5/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/json5/lib/stringify.js"(exports, module2) {
    var util = require_util();
    module2.exports = function stringify(value, replacer, space) {
      const stack = [];
      let indent = "";
      let propertyList;
      let replacerFunc;
      let gap = "";
      let quote;
      if (replacer != null && typeof replacer === "object" && !Array.isArray(replacer)) {
        space = replacer.space;
        quote = replacer.quote;
        replacer = replacer.replacer;
      }
      if (typeof replacer === "function") {
        replacerFunc = replacer;
      } else if (Array.isArray(replacer)) {
        propertyList = [];
        for (const v of replacer) {
          let item;
          if (typeof v === "string") {
            item = v;
          } else if (typeof v === "number" || v instanceof String || v instanceof Number) {
            item = String(v);
          }
          if (item !== void 0 && propertyList.indexOf(item) < 0) {
            propertyList.push(item);
          }
        }
      }
      if (space instanceof Number) {
        space = Number(space);
      } else if (space instanceof String) {
        space = String(space);
      }
      if (typeof space === "number") {
        if (space > 0) {
          space = Math.min(10, Math.floor(space));
          gap = "          ".substr(0, space);
        }
      } else if (typeof space === "string") {
        gap = space.substr(0, 10);
      }
      return serializeProperty("", { "": value });
      function serializeProperty(key, holder) {
        let value2 = holder[key];
        if (value2 != null) {
          if (typeof value2.toJSON5 === "function") {
            value2 = value2.toJSON5(key);
          } else if (typeof value2.toJSON === "function") {
            value2 = value2.toJSON(key);
          }
        }
        if (replacerFunc) {
          value2 = replacerFunc.call(holder, key, value2);
        }
        if (value2 instanceof Number) {
          value2 = Number(value2);
        } else if (value2 instanceof String) {
          value2 = String(value2);
        } else if (value2 instanceof Boolean) {
          value2 = value2.valueOf();
        }
        switch (value2) {
          case null:
            return "null";
          case true:
            return "true";
          case false:
            return "false";
        }
        if (typeof value2 === "string") {
          return quoteString(value2, false);
        }
        if (typeof value2 === "number") {
          return String(value2);
        }
        if (typeof value2 === "object") {
          return Array.isArray(value2) ? serializeArray(value2) : serializeObject(value2);
        }
        return void 0;
      }
      function quoteString(value2) {
        const quotes = {
          "'": 0.1,
          '"': 0.2
        };
        const replacements = {
          "'": "\\'",
          '"': '\\"',
          "\\": "\\\\",
          "\b": "\\b",
          "\f": "\\f",
          "\n": "\\n",
          "\r": "\\r",
          "	": "\\t",
          "\v": "\\v",
          "\0": "\\0",
          "\u2028": "\\u2028",
          "\u2029": "\\u2029"
        };
        let product = "";
        for (let i = 0; i < value2.length; i++) {
          const c = value2[i];
          switch (c) {
            case "'":
            case '"':
              quotes[c]++;
              product += c;
              continue;
            case "\0":
              if (util.isDigit(value2[i + 1])) {
                product += "\\x00";
                continue;
              }
          }
          if (replacements[c]) {
            product += replacements[c];
            continue;
          }
          if (c < " ") {
            let hexString = c.charCodeAt(0).toString(16);
            product += "\\x" + ("00" + hexString).substring(hexString.length);
            continue;
          }
          product += c;
        }
        const quoteChar = quote || Object.keys(quotes).reduce((a, b) => quotes[a] < quotes[b] ? a : b);
        product = product.replace(new RegExp(quoteChar, "g"), replacements[quoteChar]);
        return quoteChar + product + quoteChar;
      }
      function serializeObject(value2) {
        if (stack.indexOf(value2) >= 0) {
          throw TypeError("Converting circular structure to JSON5");
        }
        stack.push(value2);
        let stepback = indent;
        indent = indent + gap;
        let keys = propertyList || Object.keys(value2);
        let partial = [];
        for (const key of keys) {
          const propertyString = serializeProperty(key, value2);
          if (propertyString !== void 0) {
            let member = serializeKey(key) + ":";
            if (gap !== "") {
              member += " ";
            }
            member += propertyString;
            partial.push(member);
          }
        }
        let final;
        if (partial.length === 0) {
          final = "{}";
        } else {
          let properties;
          if (gap === "") {
            properties = partial.join(",");
            final = "{" + properties + "}";
          } else {
            let separator = ",\n" + indent;
            properties = partial.join(separator);
            final = "{\n" + indent + properties + ",\n" + stepback + "}";
          }
        }
        stack.pop();
        indent = stepback;
        return final;
      }
      function serializeKey(key) {
        if (key.length === 0) {
          return quoteString(key, true);
        }
        const firstChar = String.fromCodePoint(key.codePointAt(0));
        if (!util.isIdStartChar(firstChar)) {
          return quoteString(key, true);
        }
        for (let i = firstChar.length; i < key.length; i++) {
          if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
            return quoteString(key, true);
          }
        }
        return key;
      }
      function serializeArray(value2) {
        if (stack.indexOf(value2) >= 0) {
          throw TypeError("Converting circular structure to JSON5");
        }
        stack.push(value2);
        let stepback = indent;
        indent = indent + gap;
        let partial = [];
        for (let i = 0; i < value2.length; i++) {
          const propertyString = serializeProperty(String(i), value2);
          partial.push(propertyString !== void 0 ? propertyString : "null");
        }
        let final;
        if (partial.length === 0) {
          final = "[]";
        } else {
          if (gap === "") {
            let properties = partial.join(",");
            final = "[" + properties + "]";
          } else {
            let separator = ",\n" + indent;
            let properties = partial.join(separator);
            final = "[\n" + indent + properties + ",\n" + stepback + "]";
          }
        }
        stack.pop();
        indent = stepback;
        return final;
      }
    };
  }
});

// node_modules/json5/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/json5/lib/index.js"(exports, module2) {
    var parse2 = require_parse();
    var stringify = require_stringify();
    var JSON52 = {
      parse: parse2,
      stringify
    };
    module2.exports = JSON52;
  }
});

// node_modules/argparse/lib/sub.js
var require_sub = __commonJS({
  "node_modules/argparse/lib/sub.js"(exports, module2) {
    "use strict";
    var { inspect } = require("util");
    module2.exports = function sub(pattern, ...values) {
      let regex = /%(?:(%)|(-)?(\*)?(?:\((\w+)\))?([A-Za-z]))/g;
      let result = pattern.replace(regex, function(_, is_literal, is_left_align, is_padded, name, format) {
        if (is_literal)
          return "%";
        let padded_count = 0;
        if (is_padded) {
          if (values.length === 0)
            throw new TypeError("not enough arguments for format string");
          padded_count = values.shift();
          if (!Number.isInteger(padded_count))
            throw new TypeError("* wants int");
        }
        let str;
        if (name !== void 0) {
          let dict = values[0];
          if (typeof dict !== "object" || dict === null)
            throw new TypeError("format requires a mapping");
          if (!(name in dict))
            throw new TypeError(`no such key: '${name}'`);
          str = dict[name];
        } else {
          if (values.length === 0)
            throw new TypeError("not enough arguments for format string");
          str = values.shift();
        }
        switch (format) {
          case "s":
            str = String(str);
            break;
          case "r":
            str = inspect(str);
            break;
          case "d":
          case "i":
            if (typeof str !== "number") {
              throw new TypeError(`%${format} format: a number is required, not ${typeof str}`);
            }
            str = String(str.toFixed(0));
            break;
          default:
            throw new TypeError(`unsupported format character '${format}'`);
        }
        if (padded_count > 0) {
          return is_left_align ? str.padEnd(padded_count) : str.padStart(padded_count);
        } else {
          return str;
        }
      });
      if (values.length) {
        if (values.length === 1 && typeof values[0] === "object" && values[0] !== null) {
        } else {
          throw new TypeError("not all arguments converted during string formatting");
        }
      }
      return result;
    };
  }
});

// node_modules/argparse/lib/textwrap.js
var require_textwrap = __commonJS({
  "node_modules/argparse/lib/textwrap.js"(exports, module2) {
    "use strict";
    var wordsep_simple_re = /([\t\n\x0b\x0c\r ]+)/;
    var TextWrapper = class {
      /*
       *  Object for wrapping/filling text.  The public interface consists of
       *  the wrap() and fill() methods; the other methods are just there for
       *  subclasses to override in order to tweak the default behaviour.
       *  If you want to completely replace the main wrapping algorithm,
       *  you'll probably have to override _wrap_chunks().
       *
       *  Several instance attributes control various aspects of wrapping:
       *    width (default: 70)
       *      the maximum width of wrapped lines (unless break_long_words
       *      is false)
       *    initial_indent (default: "")
       *      string that will be prepended to the first line of wrapped
       *      output.  Counts towards the line's width.
       *    subsequent_indent (default: "")
       *      string that will be prepended to all lines save the first
       *      of wrapped output; also counts towards each line's width.
       *    expand_tabs (default: true)
       *      Expand tabs in input text to spaces before further processing.
       *      Each tab will become 0 .. 'tabsize' spaces, depending on its position
       *      in its line.  If false, each tab is treated as a single character.
       *    tabsize (default: 8)
       *      Expand tabs in input text to 0 .. 'tabsize' spaces, unless
       *      'expand_tabs' is false.
       *    replace_whitespace (default: true)
       *      Replace all whitespace characters in the input text by spaces
       *      after tab expansion.  Note that if expand_tabs is false and
       *      replace_whitespace is true, every tab will be converted to a
       *      single space!
       *    fix_sentence_endings (default: false)
       *      Ensure that sentence-ending punctuation is always followed
       *      by two spaces.  Off by default because the algorithm is
       *      (unavoidably) imperfect.
       *    break_long_words (default: true)
       *      Break words longer than 'width'.  If false, those words will not
       *      be broken, and some lines might be longer than 'width'.
       *    break_on_hyphens (default: true)
       *      Allow breaking hyphenated words. If true, wrapping will occur
       *      preferably on whitespaces and right after hyphens part of
       *      compound words.
       *    drop_whitespace (default: true)
       *      Drop leading and trailing whitespace from lines.
       *    max_lines (default: None)
       *      Truncate wrapped lines.
       *    placeholder (default: ' [...]')
       *      Append to the last line of truncated text.
       */
      constructor(options = {}) {
        let {
          width = 70,
          initial_indent = "",
          subsequent_indent = "",
          expand_tabs = true,
          replace_whitespace = true,
          fix_sentence_endings = false,
          break_long_words = true,
          drop_whitespace = true,
          break_on_hyphens = true,
          tabsize = 8,
          max_lines = void 0,
          placeholder = " [...]"
        } = options;
        this.width = width;
        this.initial_indent = initial_indent;
        this.subsequent_indent = subsequent_indent;
        this.expand_tabs = expand_tabs;
        this.replace_whitespace = replace_whitespace;
        this.fix_sentence_endings = fix_sentence_endings;
        this.break_long_words = break_long_words;
        this.drop_whitespace = drop_whitespace;
        this.break_on_hyphens = break_on_hyphens;
        this.tabsize = tabsize;
        this.max_lines = max_lines;
        this.placeholder = placeholder;
      }
      // -- Private methods -----------------------------------------------
      // (possibly useful for subclasses to override)
      _munge_whitespace(text) {
        if (this.expand_tabs) {
          text = text.replace(/\t/g, " ".repeat(this.tabsize));
        }
        if (this.replace_whitespace) {
          text = text.replace(/[\t\n\x0b\x0c\r]/g, " ");
        }
        return text;
      }
      _split(text) {
        let chunks = text.split(wordsep_simple_re);
        chunks = chunks.filter(Boolean);
        return chunks;
      }
      _handle_long_word(reversed_chunks, cur_line, cur_len, width) {
        let space_left;
        if (width < 1) {
          space_left = 1;
        } else {
          space_left = width - cur_len;
        }
        if (this.break_long_words) {
          cur_line.push(reversed_chunks[reversed_chunks.length - 1].slice(0, space_left));
          reversed_chunks[reversed_chunks.length - 1] = reversed_chunks[reversed_chunks.length - 1].slice(space_left);
        } else if (!cur_line) {
          cur_line.push(...reversed_chunks.pop());
        }
      }
      _wrap_chunks(chunks) {
        let lines = [];
        let indent;
        if (this.width <= 0) {
          throw Error(`invalid width ${this.width} (must be > 0)`);
        }
        if (this.max_lines !== void 0) {
          if (this.max_lines > 1) {
            indent = this.subsequent_indent;
          } else {
            indent = this.initial_indent;
          }
          if (indent.length + this.placeholder.trimStart().length > this.width) {
            throw Error("placeholder too large for max width");
          }
        }
        chunks = chunks.reverse();
        while (chunks.length > 0) {
          let cur_line = [];
          let cur_len = 0;
          let indent2;
          if (lines) {
            indent2 = this.subsequent_indent;
          } else {
            indent2 = this.initial_indent;
          }
          let width = this.width - indent2.length;
          if (this.drop_whitespace && chunks[chunks.length - 1].trim() === "" && lines.length > 0) {
            chunks.pop();
          }
          while (chunks.length > 0) {
            let l = chunks[chunks.length - 1].length;
            if (cur_len + l <= width) {
              cur_line.push(chunks.pop());
              cur_len += l;
            } else {
              break;
            }
          }
          if (chunks.length && chunks[chunks.length - 1].length > width) {
            this._handle_long_word(chunks, cur_line, cur_len, width);
            cur_len = cur_line.map((l) => l.length).reduce((a, b) => a + b, 0);
          }
          if (this.drop_whitespace && cur_line.length > 0 && cur_line[cur_line.length - 1].trim() === "") {
            cur_len -= cur_line[cur_line.length - 1].length;
            cur_line.pop();
          }
          if (cur_line) {
            if (this.max_lines === void 0 || lines.length + 1 < this.max_lines || (chunks.length === 0 || this.drop_whitespace && chunks.length === 1 && !chunks[0].trim()) && cur_len <= width) {
              lines.push(indent2 + cur_line.join(""));
            } else {
              let had_break = false;
              while (cur_line) {
                if (cur_line[cur_line.length - 1].trim() && cur_len + this.placeholder.length <= width) {
                  cur_line.push(this.placeholder);
                  lines.push(indent2 + cur_line.join(""));
                  had_break = true;
                  break;
                }
                cur_len -= cur_line[-1].length;
                cur_line.pop();
              }
              if (!had_break) {
                if (lines) {
                  let prev_line = lines[lines.length - 1].trimEnd();
                  if (prev_line.length + this.placeholder.length <= this.width) {
                    lines[lines.length - 1] = prev_line + this.placeholder;
                    break;
                  }
                }
                lines.push(indent2 + this.placeholder.lstrip());
              }
              break;
            }
          }
        }
        return lines;
      }
      _split_chunks(text) {
        text = this._munge_whitespace(text);
        return this._split(text);
      }
      // -- Public interface ----------------------------------------------
      wrap(text) {
        let chunks = this._split_chunks(text);
        return this._wrap_chunks(chunks);
      }
      fill(text) {
        return this.wrap(text).join("\n");
      }
    };
    function wrap(text, options = {}) {
      let { width = 70, ...kwargs } = options;
      let w = new TextWrapper(Object.assign({ width }, kwargs));
      return w.wrap(text);
    }
    function fill(text, options = {}) {
      let { width = 70, ...kwargs } = options;
      let w = new TextWrapper(Object.assign({ width }, kwargs));
      return w.fill(text);
    }
    var _whitespace_only_re = /^[ \t]+$/mg;
    var _leading_whitespace_re = /(^[ \t]*)(?:[^ \t\n])/mg;
    function dedent(text) {
      let margin = void 0;
      text = text.replace(_whitespace_only_re, "");
      let indents = text.match(_leading_whitespace_re) || [];
      for (let indent of indents) {
        indent = indent.slice(0, -1);
        if (margin === void 0) {
          margin = indent;
        } else if (indent.startsWith(margin)) {
        } else if (margin.startsWith(indent)) {
          margin = indent;
        } else {
          for (let i = 0; i < margin.length && i < indent.length; i++) {
            if (margin[i] !== indent[i]) {
              margin = margin.slice(0, i);
              break;
            }
          }
        }
      }
      if (margin) {
        text = text.replace(new RegExp("^" + margin, "mg"), "");
      }
      return text;
    }
    module2.exports = { wrap, fill, dedent };
  }
});

// node_modules/argparse/argparse.js
var require_argparse = __commonJS({
  "node_modules/argparse/argparse.js"(exports, module2) {
    "use strict";
    var SUPPRESS = "==SUPPRESS==";
    var OPTIONAL = "?";
    var ZERO_OR_MORE = "*";
    var ONE_OR_MORE = "+";
    var PARSER = "A...";
    var REMAINDER = "...";
    var _UNRECOGNIZED_ARGS_ATTR = "_unrecognized_args";
    var assert = require("assert");
    var util = require("util");
    var fs6 = require("fs");
    var sub = require_sub();
    var path4 = require("path");
    var repr = util.inspect;
    function get_argv() {
      return process.argv.slice(1);
    }
    function get_terminal_size() {
      return {
        columns: +process.env.COLUMNS || process.stdout.columns || 80
      };
    }
    function hasattr(object, name) {
      return Object.prototype.hasOwnProperty.call(object, name);
    }
    function getattr(object, name, value) {
      return hasattr(object, name) ? object[name] : value;
    }
    function setattr(object, name, value) {
      object[name] = value;
    }
    function setdefault(object, name, value) {
      if (!hasattr(object, name))
        object[name] = value;
      return object[name];
    }
    function delattr(object, name) {
      delete object[name];
    }
    function range(from, to, step = 1) {
      if (arguments.length === 1)
        [to, from] = [from, 0];
      if (typeof from !== "number" || typeof to !== "number" || typeof step !== "number") {
        throw new TypeError("argument cannot be interpreted as an integer");
      }
      if (step === 0)
        throw new TypeError("range() arg 3 must not be zero");
      let result = [];
      if (step > 0) {
        for (let i = from; i < to; i += step)
          result.push(i);
      } else {
        for (let i = from; i > to; i += step)
          result.push(i);
      }
      return result;
    }
    function splitlines(str, keepends = false) {
      let result;
      if (!keepends) {
        result = str.split(/\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/);
      } else {
        result = [];
        let parts = str.split(/(\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029])/);
        for (let i = 0; i < parts.length; i += 2) {
          result.push(parts[i] + (i + 1 < parts.length ? parts[i + 1] : ""));
        }
      }
      if (!result[result.length - 1])
        result.pop();
      return result;
    }
    function _string_lstrip(string, prefix_chars) {
      let idx = 0;
      while (idx < string.length && prefix_chars.includes(string[idx]))
        idx++;
      return idx ? string.slice(idx) : string;
    }
    function _string_split(string, sep, maxsplit) {
      let result = string.split(sep);
      if (result.length > maxsplit) {
        result = result.slice(0, maxsplit).concat([result.slice(maxsplit).join(sep)]);
      }
      return result;
    }
    function _array_equal(array1, array2) {
      if (array1.length !== array2.length)
        return false;
      for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i])
          return false;
      }
      return true;
    }
    function _array_remove(array, item) {
      let idx = array.indexOf(item);
      if (idx === -1)
        throw new TypeError(sub("%r not in list", item));
      array.splice(idx, 1);
    }
    function _choices_to_array(choices) {
      if (choices === void 0) {
        return [];
      } else if (Array.isArray(choices)) {
        return choices;
      } else if (choices !== null && typeof choices[Symbol.iterator] === "function") {
        return Array.from(choices);
      } else if (typeof choices === "object" && choices !== null) {
        return Object.keys(choices);
      } else {
        throw new Error(sub("invalid choices value: %r", choices));
      }
    }
    function _callable(cls) {
      let result = {
        // object is needed for inferred class name
        [cls.name]: function(...args2) {
          let this_class = new.target === result || !new.target;
          return Reflect.construct(cls, args2, this_class ? cls : new.target);
        }
      };
      result[cls.name].prototype = cls.prototype;
      cls.prototype[Symbol.toStringTag] = cls.name;
      return result[cls.name];
    }
    function _alias(object, from, to) {
      try {
        let name = object.constructor.name;
        Object.defineProperty(object, from, {
          value: util.deprecate(object[to], sub(
            "%s.%s() is renamed to %s.%s()",
            name,
            from,
            name,
            to
          )),
          enumerable: false
        });
      } catch {
      }
    }
    function _camelcase_alias(_class) {
      for (let name of Object.getOwnPropertyNames(_class.prototype)) {
        let camelcase = name.replace(/\w_[a-z]/g, (s) => s[0] + s[2].toUpperCase());
        if (camelcase !== name)
          _alias(_class.prototype, camelcase, name);
      }
      return _class;
    }
    function _to_legacy_name(key) {
      key = key.replace(/\w_[a-z]/g, (s) => s[0] + s[2].toUpperCase());
      if (key === "default")
        key = "defaultValue";
      if (key === "const")
        key = "constant";
      return key;
    }
    function _to_new_name(key) {
      if (key === "defaultValue")
        key = "default";
      if (key === "constant")
        key = "const";
      key = key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
      return key;
    }
    var no_default = Symbol("no_default_value");
    function _parse_opts(args2, descriptor) {
      function get_name() {
        let stack = new Error().stack.split("\n").map((x) => x.match(/^    at (.*) \(.*\)$/)).filter(Boolean).map((m) => m[1]).map((fn) => fn.match(/[^ .]*$/)[0]);
        if (stack.length && stack[0] === get_name.name)
          stack.shift();
        if (stack.length && stack[0] === _parse_opts.name)
          stack.shift();
        return stack.length ? stack[0] : "";
      }
      args2 = Array.from(args2);
      let kwargs = {};
      let result = [];
      let last_opt = args2.length && args2[args2.length - 1];
      if (typeof last_opt === "object" && last_opt !== null && !Array.isArray(last_opt) && (!last_opt.constructor || last_opt.constructor.name === "Object")) {
        kwargs = Object.assign({}, args2.pop());
      }
      let renames = [];
      for (let key of Object.keys(descriptor)) {
        let old_name = _to_legacy_name(key);
        if (old_name !== key && old_name in kwargs) {
          if (key in kwargs) {
          } else {
            kwargs[key] = kwargs[old_name];
          }
          renames.push([old_name, key]);
          delete kwargs[old_name];
        }
      }
      if (renames.length) {
        let name = get_name();
        deprecate("camelcase_" + name, sub(
          "%s(): following options are renamed: %s",
          name,
          renames.map(([a, b]) => sub("%r -> %r", a, b))
        ));
      }
      let missing_positionals = [];
      let positional_count = args2.length;
      for (let [key, def] of Object.entries(descriptor)) {
        if (key[0] === "*") {
          if (key.length > 0 && key[1] === "*") {
            let renames2 = [];
            for (let key2 of Object.keys(kwargs)) {
              let new_name = _to_new_name(key2);
              if (new_name !== key2 && key2 in kwargs) {
                if (new_name in kwargs) {
                } else {
                  kwargs[new_name] = kwargs[key2];
                }
                renames2.push([key2, new_name]);
                delete kwargs[key2];
              }
            }
            if (renames2.length) {
              let name = get_name();
              deprecate("camelcase_" + name, sub(
                "%s(): following options are renamed: %s",
                name,
                renames2.map(([a, b]) => sub("%r -> %r", a, b))
              ));
            }
            result.push(kwargs);
            kwargs = {};
          } else {
            result.push(args2);
            args2 = [];
          }
        } else if (key in kwargs && args2.length > 0) {
          throw new TypeError(sub("%s() got multiple values for argument %r", get_name(), key));
        } else if (key in kwargs) {
          result.push(kwargs[key]);
          delete kwargs[key];
        } else if (args2.length > 0) {
          result.push(args2.shift());
        } else if (def !== no_default) {
          result.push(def);
        } else {
          missing_positionals.push(key);
        }
      }
      if (Object.keys(kwargs).length) {
        throw new TypeError(sub(
          "%s() got an unexpected keyword argument %r",
          get_name(),
          Object.keys(kwargs)[0]
        ));
      }
      if (args2.length) {
        let from = Object.entries(descriptor).filter(([k, v]) => k[0] !== "*" && v !== no_default).length;
        let to = Object.entries(descriptor).filter(([k]) => k[0] !== "*").length;
        throw new TypeError(sub(
          "%s() takes %s positional argument%s but %s %s given",
          get_name(),
          from === to ? sub("from %s to %s", from, to) : to,
          from === to && to === 1 ? "" : "s",
          positional_count,
          positional_count === 1 ? "was" : "were"
        ));
      }
      if (missing_positionals.length) {
        let strs = missing_positionals.map(repr);
        if (strs.length > 1)
          strs[strs.length - 1] = "and " + strs[strs.length - 1];
        let str_joined = strs.join(strs.length === 2 ? "" : ", ");
        throw new TypeError(sub(
          "%s() missing %i required positional argument%s: %s",
          get_name(),
          strs.length,
          strs.length === 1 ? "" : "s",
          str_joined
        ));
      }
      return result;
    }
    var _deprecations = {};
    function deprecate(id, string) {
      _deprecations[id] = _deprecations[id] || util.deprecate(() => {
      }, string);
      _deprecations[id]();
    }
    function _AttributeHolder(cls = Object) {
      return class _AttributeHolder extends cls {
        [util.inspect.custom]() {
          let type_name = this.constructor.name;
          let arg_strings = [];
          let star_args = {};
          for (let arg of this._get_args()) {
            arg_strings.push(repr(arg));
          }
          for (let [name, value] of this._get_kwargs()) {
            if (/^[a-z_][a-z0-9_$]*$/i.test(name)) {
              arg_strings.push(sub("%s=%r", name, value));
            } else {
              star_args[name] = value;
            }
          }
          if (Object.keys(star_args).length) {
            arg_strings.push(sub("**%s", repr(star_args)));
          }
          return sub("%s(%s)", type_name, arg_strings.join(", "));
        }
        toString() {
          return this[util.inspect.custom]();
        }
        _get_kwargs() {
          return Object.entries(this);
        }
        _get_args() {
          return [];
        }
      };
    }
    function _copy_items(items) {
      if (items === void 0) {
        return [];
      }
      return items.slice(0);
    }
    var HelpFormatter = _camelcase_alias(_callable(class HelpFormatter {
      /*
       *  Formatter for generating usage messages and argument help strings.
       *
       *  Only the name of this class is considered a public API. All the methods
       *  provided by the class are considered an implementation detail.
       */
      constructor() {
        let [
          prog,
          indent_increment,
          max_help_position,
          width
        ] = _parse_opts(arguments, {
          prog: no_default,
          indent_increment: 2,
          max_help_position: 24,
          width: void 0
        });
        if (width === void 0) {
          width = get_terminal_size().columns;
          width -= 2;
        }
        this._prog = prog;
        this._indent_increment = indent_increment;
        this._max_help_position = Math.min(
          max_help_position,
          Math.max(width - 20, indent_increment * 2)
        );
        this._width = width;
        this._current_indent = 0;
        this._level = 0;
        this._action_max_length = 0;
        this._root_section = this._Section(this, void 0);
        this._current_section = this._root_section;
        this._whitespace_matcher = /[ \t\n\r\f\v]+/g;
        this._long_break_matcher = /\n\n\n+/g;
      }
      // ===============================
      // Section and indentation methods
      // ===============================
      _indent() {
        this._current_indent += this._indent_increment;
        this._level += 1;
      }
      _dedent() {
        this._current_indent -= this._indent_increment;
        assert(this._current_indent >= 0, "Indent decreased below 0.");
        this._level -= 1;
      }
      _add_item(func, args2) {
        this._current_section.items.push([func, args2]);
      }
      // ========================
      // Message building methods
      // ========================
      start_section(heading) {
        this._indent();
        let section = this._Section(this, this._current_section, heading);
        this._add_item(section.format_help.bind(section), []);
        this._current_section = section;
      }
      end_section() {
        this._current_section = this._current_section.parent;
        this._dedent();
      }
      add_text(text) {
        if (text !== SUPPRESS && text !== void 0) {
          this._add_item(this._format_text.bind(this), [text]);
        }
      }
      add_usage(usage, actions, groups, prefix = void 0) {
        if (usage !== SUPPRESS) {
          let args2 = [usage, actions, groups, prefix];
          this._add_item(this._format_usage.bind(this), args2);
        }
      }
      add_argument(action) {
        if (action.help !== SUPPRESS) {
          let invocations = [this._format_action_invocation(action)];
          for (let subaction of this._iter_indented_subactions(action)) {
            invocations.push(this._format_action_invocation(subaction));
          }
          let invocation_length = Math.max(...invocations.map((invocation) => invocation.length));
          let action_length = invocation_length + this._current_indent;
          this._action_max_length = Math.max(
            this._action_max_length,
            action_length
          );
          this._add_item(this._format_action.bind(this), [action]);
        }
      }
      add_arguments(actions) {
        for (let action of actions) {
          this.add_argument(action);
        }
      }
      // =======================
      // Help-formatting methods
      // =======================
      format_help() {
        let help = this._root_section.format_help();
        if (help) {
          help = help.replace(this._long_break_matcher, "\n\n");
          help = help.replace(/^\n+|\n+$/g, "") + "\n";
        }
        return help;
      }
      _join_parts(part_strings) {
        return part_strings.filter((part) => part && part !== SUPPRESS).join("");
      }
      _format_usage(usage, actions, groups, prefix) {
        if (prefix === void 0) {
          prefix = "usage: ";
        }
        if (usage !== void 0) {
          usage = sub(usage, { prog: this._prog });
        } else if (usage === void 0 && !actions.length) {
          usage = sub("%(prog)s", { prog: this._prog });
        } else if (usage === void 0) {
          let prog = sub("%(prog)s", { prog: this._prog });
          let optionals = [];
          let positionals = [];
          for (let action of actions) {
            if (action.option_strings.length) {
              optionals.push(action);
            } else {
              positionals.push(action);
            }
          }
          let action_usage = this._format_actions_usage([].concat(optionals).concat(positionals), groups);
          usage = [prog, action_usage].map(String).join(" ");
          let text_width = this._width - this._current_indent;
          if (prefix.length + usage.length > text_width) {
            let part_regexp = /\(.*?\)+(?=\s|$)|\[.*?\]+(?=\s|$)|\S+/g;
            let opt_usage = this._format_actions_usage(optionals, groups);
            let pos_usage = this._format_actions_usage(positionals, groups);
            let opt_parts = opt_usage.match(part_regexp) || [];
            let pos_parts = pos_usage.match(part_regexp) || [];
            assert(opt_parts.join(" ") === opt_usage);
            assert(pos_parts.join(" ") === pos_usage);
            let get_lines = (parts, indent, prefix2 = void 0) => {
              let lines2 = [];
              let line = [];
              let line_len;
              if (prefix2 !== void 0) {
                line_len = prefix2.length - 1;
              } else {
                line_len = indent.length - 1;
              }
              for (let part of parts) {
                if (line_len + 1 + part.length > text_width && line) {
                  lines2.push(indent + line.join(" "));
                  line = [];
                  line_len = indent.length - 1;
                }
                line.push(part);
                line_len += part.length + 1;
              }
              if (line.length) {
                lines2.push(indent + line.join(" "));
              }
              if (prefix2 !== void 0) {
                lines2[0] = lines2[0].slice(indent.length);
              }
              return lines2;
            };
            let lines;
            if (prefix.length + prog.length <= 0.75 * text_width) {
              let indent = " ".repeat(prefix.length + prog.length + 1);
              if (opt_parts.length) {
                lines = get_lines([prog].concat(opt_parts), indent, prefix);
                lines = lines.concat(get_lines(pos_parts, indent));
              } else if (pos_parts.length) {
                lines = get_lines([prog].concat(pos_parts), indent, prefix);
              } else {
                lines = [prog];
              }
            } else {
              let indent = " ".repeat(prefix.length);
              let parts = [].concat(opt_parts).concat(pos_parts);
              lines = get_lines(parts, indent);
              if (lines.length > 1) {
                lines = [];
                lines = lines.concat(get_lines(opt_parts, indent));
                lines = lines.concat(get_lines(pos_parts, indent));
              }
              lines = [prog].concat(lines);
            }
            usage = lines.join("\n");
          }
        }
        return sub("%s%s\n\n", prefix, usage);
      }
      _format_actions_usage(actions, groups) {
        let group_actions = /* @__PURE__ */ new Set();
        let inserts = {};
        for (let group of groups) {
          let start = actions.indexOf(group._group_actions[0]);
          if (start === -1) {
            continue;
          } else {
            let end = start + group._group_actions.length;
            if (_array_equal(actions.slice(start, end), group._group_actions)) {
              for (let action of group._group_actions) {
                group_actions.add(action);
              }
              if (!group.required) {
                if (start in inserts) {
                  inserts[start] += " [";
                } else {
                  inserts[start] = "[";
                }
                if (end in inserts) {
                  inserts[end] += "]";
                } else {
                  inserts[end] = "]";
                }
              } else {
                if (start in inserts) {
                  inserts[start] += " (";
                } else {
                  inserts[start] = "(";
                }
                if (end in inserts) {
                  inserts[end] += ")";
                } else {
                  inserts[end] = ")";
                }
              }
              for (let i of range(start + 1, end)) {
                inserts[i] = "|";
              }
            }
          }
        }
        let parts = [];
        for (let [i, action] of Object.entries(actions)) {
          if (action.help === SUPPRESS) {
            parts.push(void 0);
            if (inserts[+i] === "|") {
              delete inserts[+i];
            } else if (inserts[+i + 1] === "|") {
              delete inserts[+i + 1];
            }
          } else if (!action.option_strings.length) {
            let default_value = this._get_default_metavar_for_positional(action);
            let part = this._format_args(action, default_value);
            if (group_actions.has(action)) {
              if (part[0] === "[" && part[part.length - 1] === "]") {
                part = part.slice(1, -1);
              }
            }
            parts.push(part);
          } else {
            let option_string = action.option_strings[0];
            let part;
            if (action.nargs === 0) {
              part = action.format_usage();
            } else {
              let default_value = this._get_default_metavar_for_optional(action);
              let args_string = this._format_args(action, default_value);
              part = sub("%s %s", option_string, args_string);
            }
            if (!action.required && !group_actions.has(action)) {
              part = sub("[%s]", part);
            }
            parts.push(part);
          }
        }
        for (let i of Object.keys(inserts).map(Number).sort((a, b) => b - a)) {
          parts.splice(+i, 0, inserts[+i]);
        }
        let text = parts.filter(Boolean).join(" ");
        text = text.replace(/([\[(]) /g, "$1");
        text = text.replace(/ ([\])])/g, "$1");
        text = text.replace(/[\[(] *[\])]/g, "");
        text = text.replace(/\(([^|]*)\)/g, "$1", text);
        text = text.trim();
        return text;
      }
      _format_text(text) {
        if (text.includes("%(prog)")) {
          text = sub(text, { prog: this._prog });
        }
        let text_width = Math.max(this._width - this._current_indent, 11);
        let indent = " ".repeat(this._current_indent);
        return this._fill_text(text, text_width, indent) + "\n\n";
      }
      _format_action(action) {
        let help_position = Math.min(
          this._action_max_length + 2,
          this._max_help_position
        );
        let help_width = Math.max(this._width - help_position, 11);
        let action_width = help_position - this._current_indent - 2;
        let action_header = this._format_action_invocation(action);
        let indent_first;
        if (!action.help) {
          let tup = [this._current_indent, "", action_header];
          action_header = sub("%*s%s\n", ...tup);
        } else if (action_header.length <= action_width) {
          let tup = [this._current_indent, "", action_width, action_header];
          action_header = sub("%*s%-*s  ", ...tup);
          indent_first = 0;
        } else {
          let tup = [this._current_indent, "", action_header];
          action_header = sub("%*s%s\n", ...tup);
          indent_first = help_position;
        }
        let parts = [action_header];
        if (action.help) {
          let help_text = this._expand_help(action);
          let help_lines = this._split_lines(help_text, help_width);
          parts.push(sub("%*s%s\n", indent_first, "", help_lines[0]));
          for (let line of help_lines.slice(1)) {
            parts.push(sub("%*s%s\n", help_position, "", line));
          }
        } else if (!action_header.endsWith("\n")) {
          parts.push("\n");
        }
        for (let subaction of this._iter_indented_subactions(action)) {
          parts.push(this._format_action(subaction));
        }
        return this._join_parts(parts);
      }
      _format_action_invocation(action) {
        if (!action.option_strings.length) {
          let default_value = this._get_default_metavar_for_positional(action);
          let metavar = this._metavar_formatter(action, default_value)(1)[0];
          return metavar;
        } else {
          let parts = [];
          if (action.nargs === 0) {
            parts = parts.concat(action.option_strings);
          } else {
            let default_value = this._get_default_metavar_for_optional(action);
            let args_string = this._format_args(action, default_value);
            for (let option_string of action.option_strings) {
              parts.push(sub("%s %s", option_string, args_string));
            }
          }
          return parts.join(", ");
        }
      }
      _metavar_formatter(action, default_metavar) {
        let result;
        if (action.metavar !== void 0) {
          result = action.metavar;
        } else if (action.choices !== void 0) {
          let choice_strs = _choices_to_array(action.choices).map(String);
          result = sub("{%s}", choice_strs.join(","));
        } else {
          result = default_metavar;
        }
        function format(tuple_size) {
          if (Array.isArray(result)) {
            return result;
          } else {
            return Array(tuple_size).fill(result);
          }
        }
        return format;
      }
      _format_args(action, default_metavar) {
        let get_metavar = this._metavar_formatter(action, default_metavar);
        let result;
        if (action.nargs === void 0) {
          result = sub("%s", ...get_metavar(1));
        } else if (action.nargs === OPTIONAL) {
          result = sub("[%s]", ...get_metavar(1));
        } else if (action.nargs === ZERO_OR_MORE) {
          let metavar = get_metavar(1);
          if (metavar.length === 2) {
            result = sub("[%s [%s ...]]", ...metavar);
          } else {
            result = sub("[%s ...]", ...metavar);
          }
        } else if (action.nargs === ONE_OR_MORE) {
          result = sub("%s [%s ...]", ...get_metavar(2));
        } else if (action.nargs === REMAINDER) {
          result = "...";
        } else if (action.nargs === PARSER) {
          result = sub("%s ...", ...get_metavar(1));
        } else if (action.nargs === SUPPRESS) {
          result = "";
        } else {
          let formats;
          try {
            formats = range(action.nargs).map(() => "%s");
          } catch (err) {
            throw new TypeError("invalid nargs value");
          }
          result = sub(formats.join(" "), ...get_metavar(action.nargs));
        }
        return result;
      }
      _expand_help(action) {
        let params = Object.assign({ prog: this._prog }, action);
        for (let name of Object.keys(params)) {
          if (params[name] === SUPPRESS) {
            delete params[name];
          }
        }
        for (let name of Object.keys(params)) {
          if (params[name] && params[name].name) {
            params[name] = params[name].name;
          }
        }
        if (params.choices !== void 0) {
          let choices_str = _choices_to_array(params.choices).map(String).join(", ");
          params.choices = choices_str;
        }
        for (let key of Object.keys(params)) {
          let old_name = _to_legacy_name(key);
          if (old_name !== key) {
            params[old_name] = params[key];
          }
        }
        return sub(this._get_help_string(action), params);
      }
      *_iter_indented_subactions(action) {
        if (typeof action._get_subactions === "function") {
          this._indent();
          yield* action._get_subactions();
          this._dedent();
        }
      }
      _split_lines(text, width) {
        text = text.replace(this._whitespace_matcher, " ").trim();
        let textwrap = require_textwrap();
        return textwrap.wrap(text, { width });
      }
      _fill_text(text, width, indent) {
        text = text.replace(this._whitespace_matcher, " ").trim();
        let textwrap = require_textwrap();
        return textwrap.fill(text, {
          width,
          initial_indent: indent,
          subsequent_indent: indent
        });
      }
      _get_help_string(action) {
        return action.help;
      }
      _get_default_metavar_for_optional(action) {
        return action.dest.toUpperCase();
      }
      _get_default_metavar_for_positional(action) {
        return action.dest;
      }
    }));
    HelpFormatter.prototype._Section = _callable(class _Section {
      constructor(formatter, parent, heading = void 0) {
        this.formatter = formatter;
        this.parent = parent;
        this.heading = heading;
        this.items = [];
      }
      format_help() {
        if (this.parent !== void 0) {
          this.formatter._indent();
        }
        let item_help = this.formatter._join_parts(this.items.map(([func, args2]) => func.apply(null, args2)));
        if (this.parent !== void 0) {
          this.formatter._dedent();
        }
        if (!item_help) {
          return "";
        }
        let heading;
        if (this.heading !== SUPPRESS && this.heading !== void 0) {
          let current_indent = this.formatter._current_indent;
          heading = sub("%*s%s:\n", current_indent, "", this.heading);
        } else {
          heading = "";
        }
        return this.formatter._join_parts(["\n", heading, item_help, "\n"]);
      }
    });
    var RawDescriptionHelpFormatter = _camelcase_alias(_callable(class RawDescriptionHelpFormatter extends HelpFormatter {
      /*
       *  Help message formatter which retains any formatting in descriptions.
       *
       *  Only the name of this class is considered a public API. All the methods
       *  provided by the class are considered an implementation detail.
       */
      _fill_text(text, width, indent) {
        return splitlines(text, true).map((line) => indent + line).join("");
      }
    }));
    var RawTextHelpFormatter = _camelcase_alias(_callable(class RawTextHelpFormatter extends RawDescriptionHelpFormatter {
      /*
       *  Help message formatter which retains formatting of all help text.
       *
       *  Only the name of this class is considered a public API. All the methods
       *  provided by the class are considered an implementation detail.
       */
      _split_lines(text) {
        return splitlines(text);
      }
    }));
    var ArgumentDefaultsHelpFormatter = _camelcase_alias(_callable(class ArgumentDefaultsHelpFormatter extends HelpFormatter {
      /*
       *  Help message formatter which adds default values to argument help.
       *
       *  Only the name of this class is considered a public API. All the methods
       *  provided by the class are considered an implementation detail.
       */
      _get_help_string(action) {
        let help = action.help;
        if (!action.help.includes("%(default)") && !action.help.includes("%(defaultValue)")) {
          if (action.default !== SUPPRESS) {
            let defaulting_nargs = [OPTIONAL, ZERO_OR_MORE];
            if (action.option_strings.length || defaulting_nargs.includes(action.nargs)) {
              help += " (default: %(default)s)";
            }
          }
        }
        return help;
      }
    }));
    var MetavarTypeHelpFormatter = _camelcase_alias(_callable(class MetavarTypeHelpFormatter extends HelpFormatter {
      /*
       *  Help message formatter which uses the argument 'type' as the default
       *  metavar value (instead of the argument 'dest')
       *
       *  Only the name of this class is considered a public API. All the methods
       *  provided by the class are considered an implementation detail.
       */
      _get_default_metavar_for_optional(action) {
        return typeof action.type === "function" ? action.type.name : action.type;
      }
      _get_default_metavar_for_positional(action) {
        return typeof action.type === "function" ? action.type.name : action.type;
      }
    }));
    function _get_action_name(argument) {
      if (argument === void 0) {
        return void 0;
      } else if (argument.option_strings.length) {
        return argument.option_strings.join("/");
      } else if (![void 0, SUPPRESS].includes(argument.metavar)) {
        return argument.metavar;
      } else if (![void 0, SUPPRESS].includes(argument.dest)) {
        return argument.dest;
      } else {
        return void 0;
      }
    }
    var ArgumentError = _callable(class ArgumentError extends Error {
      /*
       *  An error from creating or using an argument (optional or positional).
       *
       *  The string value of this exception is the message, augmented with
       *  information about the argument that caused it.
       */
      constructor(argument, message) {
        super();
        this.name = "ArgumentError";
        this._argument_name = _get_action_name(argument);
        this._message = message;
        this.message = this.str();
      }
      str() {
        let format;
        if (this._argument_name === void 0) {
          format = "%(message)s";
        } else {
          format = "argument %(argument_name)s: %(message)s";
        }
        return sub(format, {
          message: this._message,
          argument_name: this._argument_name
        });
      }
    });
    var ArgumentTypeError = _callable(class ArgumentTypeError extends Error {
      /*
       * An error from trying to convert a command line string to a type.
       */
      constructor(message) {
        super(message);
        this.name = "ArgumentTypeError";
      }
    });
    var Action = _camelcase_alias(_callable(class Action extends _AttributeHolder(Function) {
      /*
       *  Information about how to convert command line strings to Python objects.
       *
       *  Action objects are used by an ArgumentParser to represent the information
       *  needed to parse a single argument from one or more strings from the
       *  command line. The keyword arguments to the Action constructor are also
       *  all attributes of Action instances.
       *
       *  Keyword Arguments:
       *
       *      - option_strings -- A list of command-line option strings which
       *          should be associated with this action.
       *
       *      - dest -- The name of the attribute to hold the created object(s)
       *
       *      - nargs -- The number of command-line arguments that should be
       *          consumed. By default, one argument will be consumed and a single
       *          value will be produced.  Other values include:
       *              - N (an integer) consumes N arguments (and produces a list)
       *              - '?' consumes zero or one arguments
       *              - '*' consumes zero or more arguments (and produces a list)
       *              - '+' consumes one or more arguments (and produces a list)
       *          Note that the difference between the default and nargs=1 is that
       *          with the default, a single value will be produced, while with
       *          nargs=1, a list containing a single value will be produced.
       *
       *      - const -- The value to be produced if the option is specified and the
       *          option uses an action that takes no values.
       *
       *      - default -- The value to be produced if the option is not specified.
       *
       *      - type -- A callable that accepts a single string argument, and
       *          returns the converted value.  The standard Python types str, int,
       *          float, and complex are useful examples of such callables.  If None,
       *          str is used.
       *
       *      - choices -- A container of values that should be allowed. If not None,
       *          after a command-line argument has been converted to the appropriate
       *          type, an exception will be raised if it is not a member of this
       *          collection.
       *
       *      - required -- True if the action must always be specified at the
       *          command line. This is only meaningful for optional command-line
       *          arguments.
       *
       *      - help -- The help string describing the argument.
       *
       *      - metavar -- The name to be used for the option's argument with the
       *          help string. If None, the 'dest' value will be used as the name.
       */
      constructor() {
        let [
          option_strings,
          dest,
          nargs,
          const_value,
          default_value,
          type,
          choices,
          required,
          help,
          metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          nargs: void 0,
          const: void 0,
          default: void 0,
          type: void 0,
          choices: void 0,
          required: false,
          help: void 0,
          metavar: void 0
        });
        super("return arguments.callee.call.apply(arguments.callee, arguments)");
        this.option_strings = option_strings;
        this.dest = dest;
        this.nargs = nargs;
        this.const = const_value;
        this.default = default_value;
        this.type = type;
        this.choices = choices;
        this.required = required;
        this.help = help;
        this.metavar = metavar;
      }
      _get_kwargs() {
        let names = [
          "option_strings",
          "dest",
          "nargs",
          "const",
          "default",
          "type",
          "choices",
          "help",
          "metavar"
        ];
        return names.map((name) => [name, getattr(this, name)]);
      }
      format_usage() {
        return this.option_strings[0];
      }
      call() {
        throw new Error(".call() not defined");
      }
    }));
    var BooleanOptionalAction = _camelcase_alias(_callable(class BooleanOptionalAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          default_value,
          type,
          choices,
          required,
          help,
          metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          default: void 0,
          type: void 0,
          choices: void 0,
          required: false,
          help: void 0,
          metavar: void 0
        });
        let _option_strings = [];
        for (let option_string of option_strings) {
          _option_strings.push(option_string);
          if (option_string.startsWith("--")) {
            option_string = "--no-" + option_string.slice(2);
            _option_strings.push(option_string);
          }
        }
        if (help !== void 0 && default_value !== void 0) {
          help += ` (default: ${default_value})`;
        }
        super({
          option_strings: _option_strings,
          dest,
          nargs: 0,
          default: default_value,
          type,
          choices,
          required,
          help,
          metavar
        });
      }
      call(parser2, namespace, values, option_string = void 0) {
        if (this.option_strings.includes(option_string)) {
          setattr(namespace, this.dest, !option_string.startsWith("--no-"));
        }
      }
      format_usage() {
        return this.option_strings.join(" | ");
      }
    }));
    var _StoreAction = _callable(class _StoreAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          nargs,
          const_value,
          default_value,
          type,
          choices,
          required,
          help,
          metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          nargs: void 0,
          const: void 0,
          default: void 0,
          type: void 0,
          choices: void 0,
          required: false,
          help: void 0,
          metavar: void 0
        });
        if (nargs === 0) {
          throw new TypeError("nargs for store actions must be != 0; if you have nothing to store, actions such as store true or store const may be more appropriate");
        }
        if (const_value !== void 0 && nargs !== OPTIONAL) {
          throw new TypeError(sub("nargs must be %r to supply const", OPTIONAL));
        }
        super({
          option_strings,
          dest,
          nargs,
          const: const_value,
          default: default_value,
          type,
          choices,
          required,
          help,
          metavar
        });
      }
      call(parser2, namespace, values) {
        setattr(namespace, this.dest, values);
      }
    });
    var _StoreConstAction = _callable(class _StoreConstAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          const_value,
          default_value,
          required,
          help
          //, metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          const: no_default,
          default: void 0,
          required: false,
          help: void 0,
          metavar: void 0
        });
        super({
          option_strings,
          dest,
          nargs: 0,
          const: const_value,
          default: default_value,
          required,
          help
        });
      }
      call(parser2, namespace) {
        setattr(namespace, this.dest, this.const);
      }
    });
    var _StoreTrueAction = _callable(class _StoreTrueAction extends _StoreConstAction {
      constructor() {
        let [
          option_strings,
          dest,
          default_value,
          required,
          help
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          default: false,
          required: false,
          help: void 0
        });
        super({
          option_strings,
          dest,
          const: true,
          default: default_value,
          required,
          help
        });
      }
    });
    var _StoreFalseAction = _callable(class _StoreFalseAction extends _StoreConstAction {
      constructor() {
        let [
          option_strings,
          dest,
          default_value,
          required,
          help
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          default: true,
          required: false,
          help: void 0
        });
        super({
          option_strings,
          dest,
          const: false,
          default: default_value,
          required,
          help
        });
      }
    });
    var _AppendAction = _callable(class _AppendAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          nargs,
          const_value,
          default_value,
          type,
          choices,
          required,
          help,
          metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          nargs: void 0,
          const: void 0,
          default: void 0,
          type: void 0,
          choices: void 0,
          required: false,
          help: void 0,
          metavar: void 0
        });
        if (nargs === 0) {
          throw new TypeError("nargs for append actions must be != 0; if arg strings are not supplying the value to append, the append const action may be more appropriate");
        }
        if (const_value !== void 0 && nargs !== OPTIONAL) {
          throw new TypeError(sub("nargs must be %r to supply const", OPTIONAL));
        }
        super({
          option_strings,
          dest,
          nargs,
          const: const_value,
          default: default_value,
          type,
          choices,
          required,
          help,
          metavar
        });
      }
      call(parser2, namespace, values) {
        let items = getattr(namespace, this.dest, void 0);
        items = _copy_items(items);
        items.push(values);
        setattr(namespace, this.dest, items);
      }
    });
    var _AppendConstAction = _callable(class _AppendConstAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          const_value,
          default_value,
          required,
          help,
          metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          const: no_default,
          default: void 0,
          required: false,
          help: void 0,
          metavar: void 0
        });
        super({
          option_strings,
          dest,
          nargs: 0,
          const: const_value,
          default: default_value,
          required,
          help,
          metavar
        });
      }
      call(parser2, namespace) {
        let items = getattr(namespace, this.dest, void 0);
        items = _copy_items(items);
        items.push(this.const);
        setattr(namespace, this.dest, items);
      }
    });
    var _CountAction = _callable(class _CountAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          default_value,
          required,
          help
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: no_default,
          default: void 0,
          required: false,
          help: void 0
        });
        super({
          option_strings,
          dest,
          nargs: 0,
          default: default_value,
          required,
          help
        });
      }
      call(parser2, namespace) {
        let count = getattr(namespace, this.dest, void 0);
        if (count === void 0) {
          count = 0;
        }
        setattr(namespace, this.dest, count + 1);
      }
    });
    var _HelpAction = _callable(class _HelpAction extends Action {
      constructor() {
        let [
          option_strings,
          dest,
          default_value,
          help
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          dest: SUPPRESS,
          default: SUPPRESS,
          help: void 0
        });
        super({
          option_strings,
          dest,
          default: default_value,
          nargs: 0,
          help
        });
      }
      call(parser2) {
        parser2.print_help();
        parser2.exit();
      }
    });
    var _VersionAction = _callable(class _VersionAction extends Action {
      constructor() {
        let [
          option_strings,
          version,
          dest,
          default_value,
          help
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          version: void 0,
          dest: SUPPRESS,
          default: SUPPRESS,
          help: "show program's version number and exit"
        });
        super({
          option_strings,
          dest,
          default: default_value,
          nargs: 0,
          help
        });
        this.version = version;
      }
      call(parser2) {
        let version = this.version;
        if (version === void 0) {
          version = parser2.version;
        }
        let formatter = parser2._get_formatter();
        formatter.add_text(version);
        parser2._print_message(formatter.format_help(), process.stdout);
        parser2.exit();
      }
    });
    var _SubParsersAction = _camelcase_alias(_callable(class _SubParsersAction extends Action {
      constructor() {
        let [
          option_strings,
          prog,
          parser_class,
          dest,
          required,
          help,
          metavar
        ] = _parse_opts(arguments, {
          option_strings: no_default,
          prog: no_default,
          parser_class: no_default,
          dest: SUPPRESS,
          required: false,
          help: void 0,
          metavar: void 0
        });
        let name_parser_map = {};
        super({
          option_strings,
          dest,
          nargs: PARSER,
          choices: name_parser_map,
          required,
          help,
          metavar
        });
        this._prog_prefix = prog;
        this._parser_class = parser_class;
        this._name_parser_map = name_parser_map;
        this._choices_actions = [];
      }
      add_parser() {
        let [
          name,
          kwargs
        ] = _parse_opts(arguments, {
          name: no_default,
          "**kwargs": no_default
        });
        if (kwargs.prog === void 0) {
          kwargs.prog = sub("%s %s", this._prog_prefix, name);
        }
        let aliases = getattr(kwargs, "aliases", []);
        delete kwargs.aliases;
        if ("help" in kwargs) {
          let help = kwargs.help;
          delete kwargs.help;
          let choice_action = this._ChoicesPseudoAction(name, aliases, help);
          this._choices_actions.push(choice_action);
        }
        let parser2 = new this._parser_class(kwargs);
        this._name_parser_map[name] = parser2;
        for (let alias of aliases) {
          this._name_parser_map[alias] = parser2;
        }
        return parser2;
      }
      _get_subactions() {
        return this._choices_actions;
      }
      call(parser2, namespace, values) {
        let parser_name = values[0];
        let arg_strings = values.slice(1);
        if (this.dest !== SUPPRESS) {
          setattr(namespace, this.dest, parser_name);
        }
        if (hasattr(this._name_parser_map, parser_name)) {
          parser2 = this._name_parser_map[parser_name];
        } else {
          let args2 = {
            parser_name,
            choices: this._name_parser_map.join(", ")
          };
          let msg = sub("unknown parser %(parser_name)r (choices: %(choices)s)", args2);
          throw new ArgumentError(this, msg);
        }
        let subnamespace;
        [subnamespace, arg_strings] = parser2.parse_known_args(arg_strings, void 0);
        for (let [key, value] of Object.entries(subnamespace)) {
          setattr(namespace, key, value);
        }
        if (arg_strings.length) {
          setdefault(namespace, _UNRECOGNIZED_ARGS_ATTR, []);
          getattr(namespace, _UNRECOGNIZED_ARGS_ATTR).push(...arg_strings);
        }
      }
    }));
    _SubParsersAction.prototype._ChoicesPseudoAction = _callable(class _ChoicesPseudoAction extends Action {
      constructor(name, aliases, help) {
        let metavar = name, dest = name;
        if (aliases.length) {
          metavar += sub(" (%s)", aliases.join(", "));
        }
        super({ option_strings: [], dest, help, metavar });
      }
    });
    var _ExtendAction = _callable(class _ExtendAction extends _AppendAction {
      call(parser2, namespace, values) {
        let items = getattr(namespace, this.dest, void 0);
        items = _copy_items(items);
        items = items.concat(values);
        setattr(namespace, this.dest, items);
      }
    });
    var FileType = _callable(class FileType extends Function {
      /*
       *  Factory for creating file object types
       *
       *  Instances of FileType are typically passed as type= arguments to the
       *  ArgumentParser add_argument() method.
       *
       *  Keyword Arguments:
       *      - mode -- A string indicating how the file is to be opened. Accepts the
       *          same values as the builtin open() function.
       *      - bufsize -- The file's desired buffer size. Accepts the same values as
       *          the builtin open() function.
       *      - encoding -- The file's encoding. Accepts the same values as the
       *          builtin open() function.
       *      - errors -- A string indicating how encoding and decoding errors are to
       *          be handled. Accepts the same value as the builtin open() function.
       */
      constructor() {
        let [
          flags,
          encoding,
          mode,
          autoClose,
          emitClose,
          start,
          end,
          highWaterMark,
          fs7
        ] = _parse_opts(arguments, {
          flags: "r",
          encoding: void 0,
          mode: void 0,
          // 0o666
          autoClose: void 0,
          // true
          emitClose: void 0,
          // false
          start: void 0,
          // 0
          end: void 0,
          // Infinity
          highWaterMark: void 0,
          // 64 * 1024
          fs: void 0
        });
        super("return arguments.callee.call.apply(arguments.callee, arguments)");
        Object.defineProperty(this, "name", {
          get() {
            return sub("FileType(%r)", flags);
          }
        });
        this._flags = flags;
        this._options = {};
        if (encoding !== void 0)
          this._options.encoding = encoding;
        if (mode !== void 0)
          this._options.mode = mode;
        if (autoClose !== void 0)
          this._options.autoClose = autoClose;
        if (emitClose !== void 0)
          this._options.emitClose = emitClose;
        if (start !== void 0)
          this._options.start = start;
        if (end !== void 0)
          this._options.end = end;
        if (highWaterMark !== void 0)
          this._options.highWaterMark = highWaterMark;
        if (fs7 !== void 0)
          this._options.fs = fs7;
      }
      call(string) {
        if (string === "-") {
          if (this._flags.includes("r")) {
            return process.stdin;
          } else if (this._flags.includes("w")) {
            return process.stdout;
          } else {
            let msg = sub('argument "-" with mode %r', this._flags);
            throw new TypeError(msg);
          }
        }
        let fd;
        try {
          fd = fs6.openSync(string, this._flags, this._options.mode);
        } catch (e) {
          let args2 = { filename: string, error: e.message };
          let message = "can't open '%(filename)s': %(error)s";
          throw new ArgumentTypeError(sub(message, args2));
        }
        let options = Object.assign({ fd, flags: this._flags }, this._options);
        if (this._flags.includes("r")) {
          return fs6.createReadStream(void 0, options);
        } else if (this._flags.includes("w")) {
          return fs6.createWriteStream(void 0, options);
        } else {
          let msg = sub('argument "%s" with mode %r', string, this._flags);
          throw new TypeError(msg);
        }
      }
      [util.inspect.custom]() {
        let args2 = [this._flags];
        let kwargs = Object.entries(this._options).map(([k, v]) => {
          if (k === "mode")
            v = { value: v, [util.inspect.custom]() {
              return "0o" + this.value.toString(8);
            } };
          return [k, v];
        });
        let args_str = [].concat(args2.filter((arg) => arg !== -1).map(repr)).concat(kwargs.filter(([, arg]) => arg !== void 0).map(([kw, arg]) => sub("%s=%r", kw, arg))).join(", ");
        return sub("%s(%s)", this.constructor.name, args_str);
      }
      toString() {
        return this[util.inspect.custom]();
      }
    });
    var Namespace = _callable(class Namespace extends _AttributeHolder() {
      /*
       *  Simple object for storing attributes.
       *
       *  Implements equality by attribute names and values, and provides a simple
       *  string representation.
       */
      constructor(options = {}) {
        super();
        Object.assign(this, options);
      }
    });
    Namespace.prototype[Symbol.toStringTag] = void 0;
    var _ActionsContainer = _camelcase_alias(_callable(class _ActionsContainer {
      constructor() {
        let [
          description,
          prefix_chars,
          argument_default,
          conflict_handler
        ] = _parse_opts(arguments, {
          description: no_default,
          prefix_chars: no_default,
          argument_default: no_default,
          conflict_handler: no_default
        });
        this.description = description;
        this.argument_default = argument_default;
        this.prefix_chars = prefix_chars;
        this.conflict_handler = conflict_handler;
        this._registries = {};
        this.register("action", void 0, _StoreAction);
        this.register("action", "store", _StoreAction);
        this.register("action", "store_const", _StoreConstAction);
        this.register("action", "store_true", _StoreTrueAction);
        this.register("action", "store_false", _StoreFalseAction);
        this.register("action", "append", _AppendAction);
        this.register("action", "append_const", _AppendConstAction);
        this.register("action", "count", _CountAction);
        this.register("action", "help", _HelpAction);
        this.register("action", "version", _VersionAction);
        this.register("action", "parsers", _SubParsersAction);
        this.register("action", "extend", _ExtendAction);
        ["storeConst", "storeTrue", "storeFalse", "appendConst"].forEach((old_name) => {
          let new_name = _to_new_name(old_name);
          this.register("action", old_name, util.deprecate(
            this._registry_get("action", new_name),
            sub('{action: "%s"} is renamed to {action: "%s"}', old_name, new_name)
          ));
        });
        this._get_handler();
        this._actions = [];
        this._option_string_actions = {};
        this._action_groups = [];
        this._mutually_exclusive_groups = [];
        this._defaults = {};
        this._negative_number_matcher = /^-\d+$|^-\d*\.\d+$/;
        this._has_negative_number_optionals = [];
      }
      // ====================
      // Registration methods
      // ====================
      register(registry_name, value, object) {
        let registry = setdefault(this._registries, registry_name, {});
        registry[value] = object;
      }
      _registry_get(registry_name, value, default_value = void 0) {
        return getattr(this._registries[registry_name], value, default_value);
      }
      // ==================================
      // Namespace default accessor methods
      // ==================================
      set_defaults(kwargs) {
        Object.assign(this._defaults, kwargs);
        for (let action of this._actions) {
          if (action.dest in kwargs) {
            action.default = kwargs[action.dest];
          }
        }
      }
      get_default(dest) {
        for (let action of this._actions) {
          if (action.dest === dest && action.default !== void 0) {
            return action.default;
          }
        }
        return this._defaults[dest];
      }
      // =======================
      // Adding argument actions
      // =======================
      add_argument() {
        let [
          args2,
          kwargs
        ] = _parse_opts(arguments, {
          "*args": no_default,
          "**kwargs": no_default
        });
        if (args2.length === 1 && Array.isArray(args2[0])) {
          args2 = args2[0];
          deprecate(
            "argument-array",
            sub("use add_argument(%(args)s, {...}) instead of add_argument([ %(args)s ], { ... })", {
              args: args2.map(repr).join(", ")
            })
          );
        }
        let chars = this.prefix_chars;
        if (!args2.length || args2.length === 1 && !chars.includes(args2[0][0])) {
          if (args2.length && "dest" in kwargs) {
            throw new TypeError("dest supplied twice for positional argument");
          }
          kwargs = this._get_positional_kwargs(...args2, kwargs);
        } else {
          kwargs = this._get_optional_kwargs(...args2, kwargs);
        }
        if (!("default" in kwargs)) {
          let dest = kwargs.dest;
          if (dest in this._defaults) {
            kwargs.default = this._defaults[dest];
          } else if (this.argument_default !== void 0) {
            kwargs.default = this.argument_default;
          }
        }
        let action_class = this._pop_action_class(kwargs);
        if (typeof action_class !== "function") {
          throw new TypeError(sub('unknown action "%s"', action_class));
        }
        let action = new action_class(kwargs);
        let type_func = this._registry_get("type", action.type, action.type);
        if (typeof type_func !== "function") {
          throw new TypeError(sub("%r is not callable", type_func));
        }
        if (type_func === FileType) {
          throw new TypeError(sub("%r is a FileType class object, instance of it must be passed", type_func));
        }
        if ("_get_formatter" in this) {
          try {
            this._get_formatter()._format_args(action, void 0);
          } catch (err) {
            if (err instanceof TypeError && err.message !== "invalid nargs value") {
              throw new TypeError("length of metavar tuple does not match nargs");
            } else {
              throw err;
            }
          }
        }
        return this._add_action(action);
      }
      add_argument_group() {
        let group = _ArgumentGroup(this, ...arguments);
        this._action_groups.push(group);
        return group;
      }
      add_mutually_exclusive_group() {
        let group = _MutuallyExclusiveGroup(this, ...arguments);
        this._mutually_exclusive_groups.push(group);
        return group;
      }
      _add_action(action) {
        this._check_conflict(action);
        this._actions.push(action);
        action.container = this;
        for (let option_string of action.option_strings) {
          this._option_string_actions[option_string] = action;
        }
        for (let option_string of action.option_strings) {
          if (this._negative_number_matcher.test(option_string)) {
            if (!this._has_negative_number_optionals.length) {
              this._has_negative_number_optionals.push(true);
            }
          }
        }
        return action;
      }
      _remove_action(action) {
        _array_remove(this._actions, action);
      }
      _add_container_actions(container) {
        let title_group_map = {};
        for (let group of this._action_groups) {
          if (group.title in title_group_map) {
            let msg = "cannot merge actions - two groups are named %r";
            throw new TypeError(sub(msg, group.title));
          }
          title_group_map[group.title] = group;
        }
        let group_map = /* @__PURE__ */ new Map();
        for (let group of container._action_groups) {
          if (!(group.title in title_group_map)) {
            title_group_map[group.title] = this.add_argument_group({
              title: group.title,
              description: group.description,
              conflict_handler: group.conflict_handler
            });
          }
          for (let action of group._group_actions) {
            group_map.set(action, title_group_map[group.title]);
          }
        }
        for (let group of container._mutually_exclusive_groups) {
          let mutex_group = this.add_mutually_exclusive_group({
            required: group.required
          });
          for (let action of group._group_actions) {
            group_map.set(action, mutex_group);
          }
        }
        for (let action of container._actions) {
          group_map.get(action)._add_action(action);
        }
      }
      _get_positional_kwargs() {
        let [
          dest,
          kwargs
        ] = _parse_opts(arguments, {
          dest: no_default,
          "**kwargs": no_default
        });
        if ("required" in kwargs) {
          let msg = "'required' is an invalid argument for positionals";
          throw new TypeError(msg);
        }
        if (![OPTIONAL, ZERO_OR_MORE].includes(kwargs.nargs)) {
          kwargs.required = true;
        }
        if (kwargs.nargs === ZERO_OR_MORE && !("default" in kwargs)) {
          kwargs.required = true;
        }
        return Object.assign(kwargs, { dest, option_strings: [] });
      }
      _get_optional_kwargs() {
        let [
          args2,
          kwargs
        ] = _parse_opts(arguments, {
          "*args": no_default,
          "**kwargs": no_default
        });
        let option_strings = [];
        let long_option_strings = [];
        let option_string;
        for (option_string of args2) {
          if (!this.prefix_chars.includes(option_string[0])) {
            let args3 = {
              option: option_string,
              prefix_chars: this.prefix_chars
            };
            let msg = "invalid option string %(option)r: must start with a character %(prefix_chars)r";
            throw new TypeError(sub(msg, args3));
          }
          option_strings.push(option_string);
          if (option_string.length > 1 && this.prefix_chars.includes(option_string[1])) {
            long_option_strings.push(option_string);
          }
        }
        let dest = kwargs.dest;
        delete kwargs.dest;
        if (dest === void 0) {
          let dest_option_string;
          if (long_option_strings.length) {
            dest_option_string = long_option_strings[0];
          } else {
            dest_option_string = option_strings[0];
          }
          dest = _string_lstrip(dest_option_string, this.prefix_chars);
          if (!dest) {
            let msg = "dest= is required for options like %r";
            throw new TypeError(sub(msg, option_string));
          }
          dest = dest.replace(/-/g, "_");
        }
        return Object.assign(kwargs, { dest, option_strings });
      }
      _pop_action_class(kwargs, default_value = void 0) {
        let action = getattr(kwargs, "action", default_value);
        delete kwargs.action;
        return this._registry_get("action", action, action);
      }
      _get_handler() {
        let handler_func_name = sub("_handle_conflict_%s", this.conflict_handler);
        if (typeof this[handler_func_name] === "function") {
          return this[handler_func_name];
        } else {
          let msg = "invalid conflict_resolution value: %r";
          throw new TypeError(sub(msg, this.conflict_handler));
        }
      }
      _check_conflict(action) {
        let confl_optionals = [];
        for (let option_string of action.option_strings) {
          if (hasattr(this._option_string_actions, option_string)) {
            let confl_optional = this._option_string_actions[option_string];
            confl_optionals.push([option_string, confl_optional]);
          }
        }
        if (confl_optionals.length) {
          let conflict_handler = this._get_handler();
          conflict_handler.call(this, action, confl_optionals);
        }
      }
      _handle_conflict_error(action, conflicting_actions) {
        let message = conflicting_actions.length === 1 ? "conflicting option string: %s" : "conflicting option strings: %s";
        let conflict_string = conflicting_actions.map(([
          option_string
          /*, action*/
        ]) => option_string).join(", ");
        throw new ArgumentError(action, sub(message, conflict_string));
      }
      _handle_conflict_resolve(action, conflicting_actions) {
        for (let [option_string, action2] of conflicting_actions) {
          _array_remove(action2.option_strings, option_string);
          delete this._option_string_actions[option_string];
          if (!action2.option_strings.length) {
            action2.container._remove_action(action2);
          }
        }
      }
    }));
    var _ArgumentGroup = _callable(class _ArgumentGroup extends _ActionsContainer {
      constructor() {
        let [
          container,
          title,
          description,
          kwargs
        ] = _parse_opts(arguments, {
          container: no_default,
          title: void 0,
          description: void 0,
          "**kwargs": no_default
        });
        setdefault(kwargs, "conflict_handler", container.conflict_handler);
        setdefault(kwargs, "prefix_chars", container.prefix_chars);
        setdefault(kwargs, "argument_default", container.argument_default);
        super(Object.assign({ description }, kwargs));
        this.title = title;
        this._group_actions = [];
        this._registries = container._registries;
        this._actions = container._actions;
        this._option_string_actions = container._option_string_actions;
        this._defaults = container._defaults;
        this._has_negative_number_optionals = container._has_negative_number_optionals;
        this._mutually_exclusive_groups = container._mutually_exclusive_groups;
      }
      _add_action(action) {
        action = super._add_action(action);
        this._group_actions.push(action);
        return action;
      }
      _remove_action(action) {
        super._remove_action(action);
        _array_remove(this._group_actions, action);
      }
    });
    var _MutuallyExclusiveGroup = _callable(class _MutuallyExclusiveGroup extends _ArgumentGroup {
      constructor() {
        let [
          container,
          required
        ] = _parse_opts(arguments, {
          container: no_default,
          required: false
        });
        super(container);
        this.required = required;
        this._container = container;
      }
      _add_action(action) {
        if (action.required) {
          let msg = "mutually exclusive arguments must be optional";
          throw new TypeError(msg);
        }
        action = this._container._add_action(action);
        this._group_actions.push(action);
        return action;
      }
      _remove_action(action) {
        this._container._remove_action(action);
        _array_remove(this._group_actions, action);
      }
    });
    var ArgumentParser2 = _camelcase_alias(_callable(class ArgumentParser extends _AttributeHolder(_ActionsContainer) {
      /*
       *  Object for parsing command line strings into Python objects.
       *
       *  Keyword Arguments:
       *      - prog -- The name of the program (default: sys.argv[0])
       *      - usage -- A usage message (default: auto-generated from arguments)
       *      - description -- A description of what the program does
       *      - epilog -- Text following the argument descriptions
       *      - parents -- Parsers whose arguments should be copied into this one
       *      - formatter_class -- HelpFormatter class for printing help messages
       *      - prefix_chars -- Characters that prefix optional arguments
       *      - fromfile_prefix_chars -- Characters that prefix files containing
       *          additional arguments
       *      - argument_default -- The default value for all arguments
       *      - conflict_handler -- String indicating how to handle conflicts
       *      - add_help -- Add a -h/-help option
       *      - allow_abbrev -- Allow long options to be abbreviated unambiguously
       *      - exit_on_error -- Determines whether or not ArgumentParser exits with
       *          error info when an error occurs
       */
      constructor() {
        let [
          prog,
          usage,
          description,
          epilog,
          parents,
          formatter_class,
          prefix_chars,
          fromfile_prefix_chars,
          argument_default,
          conflict_handler,
          add_help,
          allow_abbrev,
          exit_on_error,
          debug4,
          // LEGACY (v1 compatibility), debug mode
          version
          // LEGACY (v1 compatibility), version
        ] = _parse_opts(arguments, {
          prog: void 0,
          usage: void 0,
          description: void 0,
          epilog: void 0,
          parents: [],
          formatter_class: HelpFormatter,
          prefix_chars: "-",
          fromfile_prefix_chars: void 0,
          argument_default: void 0,
          conflict_handler: "error",
          add_help: true,
          allow_abbrev: true,
          exit_on_error: true,
          debug: void 0,
          // LEGACY (v1 compatibility), debug mode
          version: void 0
          // LEGACY (v1 compatibility), version
        });
        if (debug4 !== void 0) {
          deprecate(
            "debug",
            'The "debug" argument to ArgumentParser is deprecated. Please override ArgumentParser.exit function instead.'
          );
        }
        if (version !== void 0) {
          deprecate(
            "version",
            `The "version" argument to ArgumentParser is deprecated. Please use add_argument(..., { action: 'version', version: 'N', ... }) instead.`
          );
        }
        super({
          description,
          prefix_chars,
          argument_default,
          conflict_handler
        });
        if (prog === void 0) {
          prog = path4.basename(get_argv()[0] || "");
        }
        this.prog = prog;
        this.usage = usage;
        this.epilog = epilog;
        this.formatter_class = formatter_class;
        this.fromfile_prefix_chars = fromfile_prefix_chars;
        this.add_help = add_help;
        this.allow_abbrev = allow_abbrev;
        this.exit_on_error = exit_on_error;
        this.debug = debug4;
        this._positionals = this.add_argument_group("positional arguments");
        this._optionals = this.add_argument_group("optional arguments");
        this._subparsers = void 0;
        function identity(string) {
          return string;
        }
        this.register("type", void 0, identity);
        this.register("type", null, identity);
        this.register("type", "auto", identity);
        this.register("type", "int", function(x) {
          let result = Number(x);
          if (!Number.isInteger(result)) {
            throw new TypeError(sub("could not convert string to int: %r", x));
          }
          return result;
        });
        this.register("type", "float", function(x) {
          let result = Number(x);
          if (isNaN(result)) {
            throw new TypeError(sub("could not convert string to float: %r", x));
          }
          return result;
        });
        this.register("type", "str", String);
        this.register(
          "type",
          "string",
          util.deprecate(String, 'use {type:"str"} or {type:String} instead of {type:"string"}')
        );
        let default_prefix = prefix_chars.includes("-") ? "-" : prefix_chars[0];
        if (this.add_help) {
          this.add_argument(
            default_prefix + "h",
            default_prefix.repeat(2) + "help",
            {
              action: "help",
              default: SUPPRESS,
              help: "show this help message and exit"
            }
          );
        }
        if (version) {
          this.add_argument(
            default_prefix + "v",
            default_prefix.repeat(2) + "version",
            {
              action: "version",
              default: SUPPRESS,
              version: this.version,
              help: "show program's version number and exit"
            }
          );
        }
        for (let parent of parents) {
          this._add_container_actions(parent);
          Object.assign(this._defaults, parent._defaults);
        }
      }
      // =======================
      // Pretty __repr__ methods
      // =======================
      _get_kwargs() {
        let names = [
          "prog",
          "usage",
          "description",
          "formatter_class",
          "conflict_handler",
          "add_help"
        ];
        return names.map((name) => [name, getattr(this, name)]);
      }
      // ==================================
      // Optional/Positional adding methods
      // ==================================
      add_subparsers() {
        let [
          kwargs
        ] = _parse_opts(arguments, {
          "**kwargs": no_default
        });
        if (this._subparsers !== void 0) {
          this.error("cannot have multiple subparser arguments");
        }
        setdefault(kwargs, "parser_class", this.constructor);
        if ("title" in kwargs || "description" in kwargs) {
          let title = getattr(kwargs, "title", "subcommands");
          let description = getattr(kwargs, "description", void 0);
          delete kwargs.title;
          delete kwargs.description;
          this._subparsers = this.add_argument_group(title, description);
        } else {
          this._subparsers = this._positionals;
        }
        if (kwargs.prog === void 0) {
          let formatter = this._get_formatter();
          let positionals = this._get_positional_actions();
          let groups = this._mutually_exclusive_groups;
          formatter.add_usage(this.usage, positionals, groups, "");
          kwargs.prog = formatter.format_help().trim();
        }
        let parsers_class = this._pop_action_class(kwargs, "parsers");
        let action = new parsers_class(Object.assign({ option_strings: [] }, kwargs));
        this._subparsers._add_action(action);
        return action;
      }
      _add_action(action) {
        if (action.option_strings.length) {
          this._optionals._add_action(action);
        } else {
          this._positionals._add_action(action);
        }
        return action;
      }
      _get_optional_actions() {
        return this._actions.filter((action) => action.option_strings.length);
      }
      _get_positional_actions() {
        return this._actions.filter((action) => !action.option_strings.length);
      }
      // =====================================
      // Command line argument parsing methods
      // =====================================
      parse_args(args2 = void 0, namespace = void 0) {
        let argv;
        [args2, argv] = this.parse_known_args(args2, namespace);
        if (argv && argv.length > 0) {
          let msg = "unrecognized arguments: %s";
          this.error(sub(msg, argv.join(" ")));
        }
        return args2;
      }
      parse_known_args(args2 = void 0, namespace = void 0) {
        if (args2 === void 0) {
          args2 = get_argv().slice(1);
        }
        if (namespace === void 0) {
          namespace = new Namespace();
        }
        for (let action of this._actions) {
          if (action.dest !== SUPPRESS) {
            if (!hasattr(namespace, action.dest)) {
              if (action.default !== SUPPRESS) {
                setattr(namespace, action.dest, action.default);
              }
            }
          }
        }
        for (let dest of Object.keys(this._defaults)) {
          if (!hasattr(namespace, dest)) {
            setattr(namespace, dest, this._defaults[dest]);
          }
        }
        if (this.exit_on_error) {
          try {
            [namespace, args2] = this._parse_known_args(args2, namespace);
          } catch (err) {
            if (err instanceof ArgumentError) {
              this.error(err.message);
            } else {
              throw err;
            }
          }
        } else {
          [namespace, args2] = this._parse_known_args(args2, namespace);
        }
        if (hasattr(namespace, _UNRECOGNIZED_ARGS_ATTR)) {
          args2 = args2.concat(getattr(namespace, _UNRECOGNIZED_ARGS_ATTR));
          delattr(namespace, _UNRECOGNIZED_ARGS_ATTR);
        }
        return [namespace, args2];
      }
      _parse_known_args(arg_strings, namespace) {
        if (this.fromfile_prefix_chars !== void 0) {
          arg_strings = this._read_args_from_files(arg_strings);
        }
        let action_conflicts = /* @__PURE__ */ new Map();
        for (let mutex_group of this._mutually_exclusive_groups) {
          let group_actions = mutex_group._group_actions;
          for (let [i, mutex_action] of Object.entries(mutex_group._group_actions)) {
            let conflicts = action_conflicts.get(mutex_action) || [];
            conflicts = conflicts.concat(group_actions.slice(0, +i));
            conflicts = conflicts.concat(group_actions.slice(+i + 1));
            action_conflicts.set(mutex_action, conflicts);
          }
        }
        let option_string_indices = {};
        let arg_string_pattern_parts = [];
        let arg_strings_iter = Object.entries(arg_strings)[Symbol.iterator]();
        for (let [i, arg_string] of arg_strings_iter) {
          if (arg_string === "--") {
            arg_string_pattern_parts.push("-");
            for ([i, arg_string] of arg_strings_iter) {
              arg_string_pattern_parts.push("A");
            }
          } else {
            let option_tuple = this._parse_optional(arg_string);
            let pattern;
            if (option_tuple === void 0) {
              pattern = "A";
            } else {
              option_string_indices[i] = option_tuple;
              pattern = "O";
            }
            arg_string_pattern_parts.push(pattern);
          }
        }
        let arg_strings_pattern = arg_string_pattern_parts.join("");
        let seen_actions = /* @__PURE__ */ new Set();
        let seen_non_default_actions = /* @__PURE__ */ new Set();
        let extras;
        let take_action = (action, argument_strings, option_string = void 0) => {
          seen_actions.add(action);
          let argument_values = this._get_values(action, argument_strings);
          if (argument_values !== action.default) {
            seen_non_default_actions.add(action);
            for (let conflict_action of action_conflicts.get(action) || []) {
              if (seen_non_default_actions.has(conflict_action)) {
                let msg = "not allowed with argument %s";
                let action_name = _get_action_name(conflict_action);
                throw new ArgumentError(action, sub(msg, action_name));
              }
            }
          }
          if (argument_values !== SUPPRESS) {
            action(this, namespace, argument_values, option_string);
          }
        };
        let consume_optional = (start_index2) => {
          let option_tuple = option_string_indices[start_index2];
          let [action, option_string, explicit_arg] = option_tuple;
          let action_tuples = [];
          let stop;
          for (; ; ) {
            if (action === void 0) {
              extras.push(arg_strings[start_index2]);
              return start_index2 + 1;
            }
            if (explicit_arg !== void 0) {
              let arg_count = this._match_argument(action, "A");
              let chars = this.prefix_chars;
              if (arg_count === 0 && !chars.includes(option_string[1])) {
                action_tuples.push([action, [], option_string]);
                let char = option_string[0];
                option_string = char + explicit_arg[0];
                let new_explicit_arg = explicit_arg.slice(1) || void 0;
                let optionals_map = this._option_string_actions;
                if (hasattr(optionals_map, option_string)) {
                  action = optionals_map[option_string];
                  explicit_arg = new_explicit_arg;
                } else {
                  let msg = "ignored explicit argument %r";
                  throw new ArgumentError(action, sub(msg, explicit_arg));
                }
              } else if (arg_count === 1) {
                stop = start_index2 + 1;
                let args2 = [explicit_arg];
                action_tuples.push([action, args2, option_string]);
                break;
              } else {
                let msg = "ignored explicit argument %r";
                throw new ArgumentError(action, sub(msg, explicit_arg));
              }
            } else {
              let start = start_index2 + 1;
              let selected_patterns = arg_strings_pattern.slice(start);
              let arg_count = this._match_argument(action, selected_patterns);
              stop = start + arg_count;
              let args2 = arg_strings.slice(start, stop);
              action_tuples.push([action, args2, option_string]);
              break;
            }
          }
          assert(action_tuples.length);
          for (let [action2, args2, option_string2] of action_tuples) {
            take_action(action2, args2, option_string2);
          }
          return stop;
        };
        let positionals = this._get_positional_actions();
        let consume_positionals = (start_index2) => {
          let selected_pattern = arg_strings_pattern.slice(start_index2);
          let arg_counts = this._match_arguments_partial(positionals, selected_pattern);
          for (let i = 0; i < positionals.length && i < arg_counts.length; i++) {
            let action = positionals[i];
            let arg_count = arg_counts[i];
            let args2 = arg_strings.slice(start_index2, start_index2 + arg_count);
            start_index2 += arg_count;
            take_action(action, args2);
          }
          positionals = positionals.slice(arg_counts.length);
          return start_index2;
        };
        extras = [];
        let start_index = 0;
        let max_option_string_index = Math.max(-1, ...Object.keys(option_string_indices).map(Number));
        while (start_index <= max_option_string_index) {
          let next_option_string_index = Math.min(
            ...Object.keys(option_string_indices).map(Number).filter((index) => index >= start_index)
          );
          if (start_index !== next_option_string_index) {
            let positionals_end_index = consume_positionals(start_index);
            if (positionals_end_index > start_index) {
              start_index = positionals_end_index;
              continue;
            } else {
              start_index = positionals_end_index;
            }
          }
          if (!(start_index in option_string_indices)) {
            let strings = arg_strings.slice(start_index, next_option_string_index);
            extras = extras.concat(strings);
            start_index = next_option_string_index;
          }
          start_index = consume_optional(start_index);
        }
        let stop_index = consume_positionals(start_index);
        extras = extras.concat(arg_strings.slice(stop_index));
        let required_actions = [];
        for (let action of this._actions) {
          if (!seen_actions.has(action)) {
            if (action.required) {
              required_actions.push(_get_action_name(action));
            } else {
              if (action.default !== void 0 && typeof action.default === "string" && hasattr(namespace, action.dest) && action.default === getattr(namespace, action.dest)) {
                setattr(
                  namespace,
                  action.dest,
                  this._get_value(action, action.default)
                );
              }
            }
          }
        }
        if (required_actions.length) {
          this.error(sub(
            "the following arguments are required: %s",
            required_actions.join(", ")
          ));
        }
        for (let group of this._mutually_exclusive_groups) {
          if (group.required) {
            let no_actions_used = true;
            for (let action of group._group_actions) {
              if (seen_non_default_actions.has(action)) {
                no_actions_used = false;
                break;
              }
            }
            if (no_actions_used) {
              let names = group._group_actions.filter((action) => action.help !== SUPPRESS).map((action) => _get_action_name(action));
              let msg = "one of the arguments %s is required";
              this.error(sub(msg, names.join(" ")));
            }
          }
        }
        return [namespace, extras];
      }
      _read_args_from_files(arg_strings) {
        let new_arg_strings = [];
        for (let arg_string of arg_strings) {
          if (!arg_string || !this.fromfile_prefix_chars.includes(arg_string[0])) {
            new_arg_strings.push(arg_string);
          } else {
            try {
              let args_file = fs6.readFileSync(arg_string.slice(1), "utf8");
              let arg_strings2 = [];
              for (let arg_line of splitlines(args_file)) {
                for (let arg of this.convert_arg_line_to_args(arg_line)) {
                  arg_strings2.push(arg);
                }
              }
              arg_strings2 = this._read_args_from_files(arg_strings2);
              new_arg_strings = new_arg_strings.concat(arg_strings2);
            } catch (err) {
              this.error(err.message);
            }
          }
        }
        return new_arg_strings;
      }
      convert_arg_line_to_args(arg_line) {
        return [arg_line];
      }
      _match_argument(action, arg_strings_pattern) {
        let nargs_pattern = this._get_nargs_pattern(action);
        let match = arg_strings_pattern.match(new RegExp("^" + nargs_pattern));
        if (match === null) {
          let nargs_errors = {
            undefined: "expected one argument",
            [OPTIONAL]: "expected at most one argument",
            [ONE_OR_MORE]: "expected at least one argument"
          };
          let msg = nargs_errors[action.nargs];
          if (msg === void 0) {
            msg = sub(action.nargs === 1 ? "expected %s argument" : "expected %s arguments", action.nargs);
          }
          throw new ArgumentError(action, msg);
        }
        return match[1].length;
      }
      _match_arguments_partial(actions, arg_strings_pattern) {
        let result = [];
        for (let i of range(actions.length, 0, -1)) {
          let actions_slice = actions.slice(0, i);
          let pattern = actions_slice.map((action) => this._get_nargs_pattern(action)).join("");
          let match = arg_strings_pattern.match(new RegExp("^" + pattern));
          if (match !== null) {
            result = result.concat(match.slice(1).map((string) => string.length));
            break;
          }
        }
        return result;
      }
      _parse_optional(arg_string) {
        if (!arg_string) {
          return void 0;
        }
        if (!this.prefix_chars.includes(arg_string[0])) {
          return void 0;
        }
        if (arg_string in this._option_string_actions) {
          let action = this._option_string_actions[arg_string];
          return [action, arg_string, void 0];
        }
        if (arg_string.length === 1) {
          return void 0;
        }
        if (arg_string.includes("=")) {
          let [option_string, explicit_arg] = _string_split(arg_string, "=", 1);
          if (option_string in this._option_string_actions) {
            let action = this._option_string_actions[option_string];
            return [action, option_string, explicit_arg];
          }
        }
        let option_tuples = this._get_option_tuples(arg_string);
        if (option_tuples.length > 1) {
          let options = option_tuples.map(([
            ,
            option_string
            /*, explicit_arg*/
          ]) => option_string).join(", ");
          let args2 = { option: arg_string, matches: options };
          let msg = "ambiguous option: %(option)s could match %(matches)s";
          this.error(sub(msg, args2));
        } else if (option_tuples.length === 1) {
          let [option_tuple] = option_tuples;
          return option_tuple;
        }
        if (this._negative_number_matcher.test(arg_string)) {
          if (!this._has_negative_number_optionals.length) {
            return void 0;
          }
        }
        if (arg_string.includes(" ")) {
          return void 0;
        }
        return [void 0, arg_string, void 0];
      }
      _get_option_tuples(option_string) {
        let result = [];
        let chars = this.prefix_chars;
        if (chars.includes(option_string[0]) && chars.includes(option_string[1])) {
          if (this.allow_abbrev) {
            let option_prefix, explicit_arg;
            if (option_string.includes("=")) {
              [option_prefix, explicit_arg] = _string_split(option_string, "=", 1);
            } else {
              option_prefix = option_string;
              explicit_arg = void 0;
            }
            for (let option_string2 of Object.keys(this._option_string_actions)) {
              if (option_string2.startsWith(option_prefix)) {
                let action = this._option_string_actions[option_string2];
                let tup = [action, option_string2, explicit_arg];
                result.push(tup);
              }
            }
          }
        } else if (chars.includes(option_string[0]) && !chars.includes(option_string[1])) {
          let option_prefix = option_string;
          let explicit_arg = void 0;
          let short_option_prefix = option_string.slice(0, 2);
          let short_explicit_arg = option_string.slice(2);
          for (let option_string2 of Object.keys(this._option_string_actions)) {
            if (option_string2 === short_option_prefix) {
              let action = this._option_string_actions[option_string2];
              let tup = [action, option_string2, short_explicit_arg];
              result.push(tup);
            } else if (option_string2.startsWith(option_prefix)) {
              let action = this._option_string_actions[option_string2];
              let tup = [action, option_string2, explicit_arg];
              result.push(tup);
            }
          }
        } else {
          this.error(sub("unexpected option string: %s", option_string));
        }
        return result;
      }
      _get_nargs_pattern(action) {
        let nargs = action.nargs;
        let nargs_pattern;
        if (nargs === void 0) {
          nargs_pattern = "(-*A-*)";
        } else if (nargs === OPTIONAL) {
          nargs_pattern = "(-*A?-*)";
        } else if (nargs === ZERO_OR_MORE) {
          nargs_pattern = "(-*[A-]*)";
        } else if (nargs === ONE_OR_MORE) {
          nargs_pattern = "(-*A[A-]*)";
        } else if (nargs === REMAINDER) {
          nargs_pattern = "([-AO]*)";
        } else if (nargs === PARSER) {
          nargs_pattern = "(-*A[-AO]*)";
        } else if (nargs === SUPPRESS) {
          nargs_pattern = "(-*-*)";
        } else {
          nargs_pattern = sub("(-*%s-*)", "A".repeat(nargs).split("").join("-*"));
        }
        if (action.option_strings.length) {
          nargs_pattern = nargs_pattern.replace(/-\*/g, "");
          nargs_pattern = nargs_pattern.replace(/-/g, "");
        }
        return nargs_pattern;
      }
      // ========================
      // Alt command line argument parsing, allowing free intermix
      // ========================
      parse_intermixed_args(args2 = void 0, namespace = void 0) {
        let argv;
        [args2, argv] = this.parse_known_intermixed_args(args2, namespace);
        if (argv.length) {
          let msg = "unrecognized arguments: %s";
          this.error(sub(msg, argv.join(" ")));
        }
        return args2;
      }
      parse_known_intermixed_args(args2 = void 0, namespace = void 0) {
        let extras;
        let positionals = this._get_positional_actions();
        let a = positionals.filter((action) => [PARSER, REMAINDER].includes(action.nargs));
        if (a.length) {
          throw new TypeError(sub("parse_intermixed_args: positional arg with nargs=%s", a[0].nargs));
        }
        for (let group of this._mutually_exclusive_groups) {
          for (let action of group._group_actions) {
            if (positionals.includes(action)) {
              throw new TypeError("parse_intermixed_args: positional in mutuallyExclusiveGroup");
            }
          }
        }
        let save_usage;
        try {
          save_usage = this.usage;
          let remaining_args;
          try {
            if (this.usage === void 0) {
              this.usage = this.format_usage().slice(7);
            }
            for (let action of positionals) {
              action.save_nargs = action.nargs;
              action.nargs = SUPPRESS;
              action.save_default = action.default;
              action.default = SUPPRESS;
            }
            [namespace, remaining_args] = this.parse_known_args(
              args2,
              namespace
            );
            for (let action of positionals) {
              let attr = getattr(namespace, action.dest);
              if (Array.isArray(attr) && attr.length === 0) {
                console.warn(sub("Do not expect %s in %s", action.dest, namespace));
                delattr(namespace, action.dest);
              }
            }
          } finally {
            for (let action of positionals) {
              action.nargs = action.save_nargs;
              action.default = action.save_default;
            }
          }
          let optionals = this._get_optional_actions();
          try {
            for (let action of optionals) {
              action.save_required = action.required;
              action.required = false;
            }
            for (let group of this._mutually_exclusive_groups) {
              group.save_required = group.required;
              group.required = false;
            }
            [namespace, extras] = this.parse_known_args(
              remaining_args,
              namespace
            );
          } finally {
            for (let action of optionals) {
              action.required = action.save_required;
            }
            for (let group of this._mutually_exclusive_groups) {
              group.required = group.save_required;
            }
          }
        } finally {
          this.usage = save_usage;
        }
        return [namespace, extras];
      }
      // ========================
      // Value conversion methods
      // ========================
      _get_values(action, arg_strings) {
        if (![PARSER, REMAINDER].includes(action.nargs)) {
          try {
            _array_remove(arg_strings, "--");
          } catch (err) {
          }
        }
        let value;
        if (!arg_strings.length && action.nargs === OPTIONAL) {
          if (action.option_strings.length) {
            value = action.const;
          } else {
            value = action.default;
          }
          if (typeof value === "string") {
            value = this._get_value(action, value);
            this._check_value(action, value);
          }
        } else if (!arg_strings.length && action.nargs === ZERO_OR_MORE && !action.option_strings.length) {
          if (action.default !== void 0) {
            value = action.default;
          } else {
            value = arg_strings;
          }
          this._check_value(action, value);
        } else if (arg_strings.length === 1 && [void 0, OPTIONAL].includes(action.nargs)) {
          let arg_string = arg_strings[0];
          value = this._get_value(action, arg_string);
          this._check_value(action, value);
        } else if (action.nargs === REMAINDER) {
          value = arg_strings.map((v) => this._get_value(action, v));
        } else if (action.nargs === PARSER) {
          value = arg_strings.map((v) => this._get_value(action, v));
          this._check_value(action, value[0]);
        } else if (action.nargs === SUPPRESS) {
          value = SUPPRESS;
        } else {
          value = arg_strings.map((v) => this._get_value(action, v));
          for (let v of value) {
            this._check_value(action, v);
          }
        }
        return value;
      }
      _get_value(action, arg_string) {
        let type_func = this._registry_get("type", action.type, action.type);
        if (typeof type_func !== "function") {
          let msg = "%r is not callable";
          throw new ArgumentError(action, sub(msg, type_func));
        }
        let result;
        try {
          try {
            result = type_func(arg_string);
          } catch (err) {
            if (err instanceof TypeError && /Class constructor .* cannot be invoked without 'new'/.test(err.message)) {
              result = new type_func(arg_string);
            } else {
              throw err;
            }
          }
        } catch (err) {
          if (err instanceof ArgumentTypeError) {
            let msg = err.message;
            throw new ArgumentError(action, msg);
          } else if (err instanceof TypeError) {
            let name = getattr(action.type, "name", repr(action.type));
            let args2 = { type: name, value: arg_string };
            let msg = "invalid %(type)s value: %(value)r";
            throw new ArgumentError(action, sub(msg, args2));
          } else {
            throw err;
          }
        }
        return result;
      }
      _check_value(action, value) {
        if (action.choices !== void 0 && !_choices_to_array(action.choices).includes(value)) {
          let args2 = {
            value,
            choices: _choices_to_array(action.choices).map(repr).join(", ")
          };
          let msg = "invalid choice: %(value)r (choose from %(choices)s)";
          throw new ArgumentError(action, sub(msg, args2));
        }
      }
      // =======================
      // Help-formatting methods
      // =======================
      format_usage() {
        let formatter = this._get_formatter();
        formatter.add_usage(
          this.usage,
          this._actions,
          this._mutually_exclusive_groups
        );
        return formatter.format_help();
      }
      format_help() {
        let formatter = this._get_formatter();
        formatter.add_usage(
          this.usage,
          this._actions,
          this._mutually_exclusive_groups
        );
        formatter.add_text(this.description);
        for (let action_group of this._action_groups) {
          formatter.start_section(action_group.title);
          formatter.add_text(action_group.description);
          formatter.add_arguments(action_group._group_actions);
          formatter.end_section();
        }
        formatter.add_text(this.epilog);
        return formatter.format_help();
      }
      _get_formatter() {
        return new this.formatter_class({ prog: this.prog });
      }
      // =====================
      // Help-printing methods
      // =====================
      print_usage(file = void 0) {
        if (file === void 0)
          file = process.stdout;
        this._print_message(this.format_usage(), file);
      }
      print_help(file = void 0) {
        if (file === void 0)
          file = process.stdout;
        this._print_message(this.format_help(), file);
      }
      _print_message(message, file = void 0) {
        if (message) {
          if (file === void 0)
            file = process.stderr;
          file.write(message);
        }
      }
      // ===============
      // Exiting methods
      // ===============
      exit(status = 0, message = void 0) {
        if (message) {
          this._print_message(message, process.stderr);
        }
        process.exit(status);
      }
      error(message) {
        if (this.debug === true)
          throw new Error(message);
        this.print_usage(process.stderr);
        let args2 = { prog: this.prog, message };
        this.exit(2, sub("%(prog)s: error: %(message)s\n", args2));
      }
    }));
    module2.exports = {
      ArgumentParser: ArgumentParser2,
      ArgumentError,
      ArgumentTypeError,
      BooleanOptionalAction,
      FileType,
      HelpFormatter,
      ArgumentDefaultsHelpFormatter,
      RawDescriptionHelpFormatter,
      RawTextHelpFormatter,
      MetavarTypeHelpFormatter,
      Namespace,
      Action,
      ONE_OR_MORE,
      OPTIONAL,
      PARSER,
      REMAINDER,
      SUPPRESS,
      ZERO_OR_MORE
    };
    Object.defineProperty(module2.exports, "Const", {
      get() {
        let result = {};
        Object.entries({ ONE_OR_MORE, OPTIONAL, PARSER, REMAINDER, SUPPRESS, ZERO_OR_MORE }).forEach(([n, v]) => {
          Object.defineProperty(result, n, {
            get() {
              deprecate(n, sub("use argparse.%s instead of argparse.Const.%s", n, n));
              return v;
            }
          });
        });
        Object.entries({ _UNRECOGNIZED_ARGS_ATTR }).forEach(([n, v]) => {
          Object.defineProperty(result, n, {
            get() {
              deprecate(n, sub("argparse.Const.%s is an internal symbol and will no longer be available", n));
              return v;
            }
          });
        });
        return result;
      },
      enumerable: false
    });
  }
});

// node_modules/color-name/index.js
var require_color_name = __commonJS({
  "node_modules/color-name/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
  "node_modules/color-convert/conversions.js"(exports, module2) {
    var cssKeywords = require_color_name();
    var reverseKeywords = {};
    for (const key of Object.keys(cssKeywords)) {
      reverseKeywords[cssKeywords[key]] = key;
    }
    var convert = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] }
    };
    module2.exports = convert;
    for (const model of Object.keys(convert)) {
      if (!("channels" in convert[model])) {
        throw new Error("missing channels property: " + model);
      }
      if (!("labels" in convert[model])) {
        throw new Error("missing channel labels property: " + model);
      }
      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error("channel and label counts mismatch: " + model);
      }
      const { channels, labels } = convert[model];
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], "channels", { value: channels });
      Object.defineProperty(convert[model], "labels", { value: labels });
    }
    convert.rgb.hsl = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      const delta = max - min;
      let h;
      let s;
      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) {
        h += 360;
      }
      const l = (min + max) / 2;
      if (max === min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }
      return [h, s * 100, l * 100];
    };
    convert.rgb.hsv = function(rgb) {
      let rdif;
      let gdif;
      let bdif;
      let h;
      let s;
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const v = Math.max(r, g, b);
      const diff = v - Math.min(r, g, b);
      const diffc = function(c) {
        return (v - c) / 6 / diff + 1 / 2;
      };
      if (diff === 0) {
        h = 0;
        s = 0;
      } else {
        s = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);
        if (r === v) {
          h = bdif - gdif;
        } else if (g === v) {
          h = 1 / 3 + rdif - bdif;
        } else if (b === v) {
          h = 2 / 3 + gdif - rdif;
        }
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }
      return [
        h * 360,
        s * 100,
        v * 100
      ];
    };
    convert.rgb.hwb = function(rgb) {
      const r = rgb[0];
      const g = rgb[1];
      let b = rgb[2];
      const h = convert.rgb.hsl(rgb)[0];
      const w = 1 / 255 * Math.min(r, Math.min(g, b));
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
      return [h, w * 100, b * 100];
    };
    convert.rgb.cmyk = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const k = Math.min(1 - r, 1 - g, 1 - b);
      const c = (1 - r - k) / (1 - k) || 0;
      const m = (1 - g - k) / (1 - k) || 0;
      const y = (1 - b - k) / (1 - k) || 0;
      return [c * 100, m * 100, y * 100, k * 100];
    };
    function comparativeDistance(x, y) {
      return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
    }
    convert.rgb.keyword = function(rgb) {
      const reversed = reverseKeywords[rgb];
      if (reversed) {
        return reversed;
      }
      let currentClosestDistance = Infinity;
      let currentClosestKeyword;
      for (const keyword of Object.keys(cssKeywords)) {
        const value = cssKeywords[keyword];
        const distance = comparativeDistance(rgb, value);
        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
      return currentClosestKeyword;
    };
    convert.keyword.rgb = function(keyword) {
      return cssKeywords[keyword];
    };
    convert.rgb.xyz = function(rgb) {
      let r = rgb[0] / 255;
      let g = rgb[1] / 255;
      let b = rgb[2] / 255;
      r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
      g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
      b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
      const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return [x * 100, y * 100, z * 100];
    };
    convert.rgb.lab = function(rgb) {
      const xyz = convert.rgb.xyz(rgb);
      let x = xyz[0];
      let y = xyz[1];
      let z = xyz[2];
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);
      return [l, a, b];
    };
    convert.hsl.rgb = function(hsl) {
      const h = hsl[0] / 360;
      const s = hsl[1] / 100;
      const l = hsl[2] / 100;
      let t2;
      let t3;
      let val;
      if (s === 0) {
        val = l * 255;
        return [val, val, val];
      }
      if (l < 0.5) {
        t2 = l * (1 + s);
      } else {
        t2 = l + s - l * s;
      }
      const t1 = 2 * l - t2;
      const rgb = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }
        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        rgb[i] = val * 255;
      }
      return rgb;
    };
    convert.hsl.hsv = function(hsl) {
      const h = hsl[0];
      let s = hsl[1] / 100;
      let l = hsl[2] / 100;
      let smin = s;
      const lmin = Math.max(l, 0.01);
      l *= 2;
      s *= l <= 1 ? l : 2 - l;
      smin *= lmin <= 1 ? lmin : 2 - lmin;
      const v = (l + s) / 2;
      const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
      return [h, sv * 100, v * 100];
    };
    convert.hsv.rgb = function(hsv) {
      const h = hsv[0] / 60;
      const s = hsv[1] / 100;
      let v = hsv[2] / 100;
      const hi = Math.floor(h) % 6;
      const f = h - Math.floor(h);
      const p = 255 * v * (1 - s);
      const q = 255 * v * (1 - s * f);
      const t = 255 * v * (1 - s * (1 - f));
      v *= 255;
      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q];
      }
    };
    convert.hsv.hsl = function(hsv) {
      const h = hsv[0];
      const s = hsv[1] / 100;
      const v = hsv[2] / 100;
      const vmin = Math.max(v, 0.01);
      let sl;
      let l;
      l = (2 - s) * v;
      const lmin = (2 - s) * vmin;
      sl = s * vmin;
      sl /= lmin <= 1 ? lmin : 2 - lmin;
      sl = sl || 0;
      l /= 2;
      return [h, sl * 100, l * 100];
    };
    convert.hwb.rgb = function(hwb) {
      const h = hwb[0] / 360;
      let wh = hwb[1] / 100;
      let bl = hwb[2] / 100;
      const ratio = wh + bl;
      let f;
      if (ratio > 1) {
        wh /= ratio;
        bl /= ratio;
      }
      const i = Math.floor(6 * h);
      const v = 1 - bl;
      f = 6 * h - i;
      if ((i & 1) !== 0) {
        f = 1 - f;
      }
      const n = wh + f * (v - wh);
      let r;
      let g;
      let b;
      switch (i) {
        default:
        case 6:
        case 0:
          r = v;
          g = n;
          b = wh;
          break;
        case 1:
          r = n;
          g = v;
          b = wh;
          break;
        case 2:
          r = wh;
          g = v;
          b = n;
          break;
        case 3:
          r = wh;
          g = n;
          b = v;
          break;
        case 4:
          r = n;
          g = wh;
          b = v;
          break;
        case 5:
          r = v;
          g = wh;
          b = n;
          break;
      }
      return [r * 255, g * 255, b * 255];
    };
    convert.cmyk.rgb = function(cmyk) {
      const c = cmyk[0] / 100;
      const m = cmyk[1] / 100;
      const y = cmyk[2] / 100;
      const k = cmyk[3] / 100;
      const r = 1 - Math.min(1, c * (1 - k) + k);
      const g = 1 - Math.min(1, m * (1 - k) + k);
      const b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.rgb = function(xyz) {
      const x = xyz[0] / 100;
      const y = xyz[1] / 100;
      const z = xyz[2] / 100;
      let r;
      let g;
      let b;
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
      g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
      b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
      r = Math.min(Math.max(0, r), 1);
      g = Math.min(Math.max(0, g), 1);
      b = Math.min(Math.max(0, b), 1);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.lab = function(xyz) {
      let x = xyz[0];
      let y = xyz[1];
      let z = xyz[2];
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);
      return [l, a, b];
    };
    convert.lab.xyz = function(lab) {
      const l = lab[0];
      const a = lab[1];
      const b = lab[2];
      let x;
      let y;
      let z;
      y = (l + 16) / 116;
      x = a / 500 + y;
      z = y - b / 200;
      const y2 = y ** 3;
      const x2 = x ** 3;
      const z2 = z ** 3;
      y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
      x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
      z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
      x *= 95.047;
      y *= 100;
      z *= 108.883;
      return [x, y, z];
    };
    convert.lab.lch = function(lab) {
      const l = lab[0];
      const a = lab[1];
      const b = lab[2];
      let h;
      const hr = Math.atan2(b, a);
      h = hr * 360 / 2 / Math.PI;
      if (h < 0) {
        h += 360;
      }
      const c = Math.sqrt(a * a + b * b);
      return [l, c, h];
    };
    convert.lch.lab = function(lch) {
      const l = lch[0];
      const c = lch[1];
      const h = lch[2];
      const hr = h / 360 * 2 * Math.PI;
      const a = c * Math.cos(hr);
      const b = c * Math.sin(hr);
      return [l, a, b];
    };
    convert.rgb.ansi16 = function(args2, saturation = null) {
      const [r, g, b] = args2;
      let value = saturation === null ? convert.rgb.hsv(args2)[2] : saturation;
      value = Math.round(value / 50);
      if (value === 0) {
        return 30;
      }
      let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
      if (value === 2) {
        ansi += 60;
      }
      return ansi;
    };
    convert.hsv.ansi16 = function(args2) {
      return convert.rgb.ansi16(convert.hsv.rgb(args2), args2[2]);
    };
    convert.rgb.ansi256 = function(args2) {
      const r = args2[0];
      const g = args2[1];
      const b = args2[2];
      if (r === g && g === b) {
        if (r < 8) {
          return 16;
        }
        if (r > 248) {
          return 231;
        }
        return Math.round((r - 8) / 247 * 24) + 232;
      }
      const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
      return ansi;
    };
    convert.ansi16.rgb = function(args2) {
      let color = args2 % 10;
      if (color === 0 || color === 7) {
        if (args2 > 50) {
          color += 3.5;
        }
        color = color / 10.5 * 255;
        return [color, color, color];
      }
      const mult = (~~(args2 > 50) + 1) * 0.5;
      const r = (color & 1) * mult * 255;
      const g = (color >> 1 & 1) * mult * 255;
      const b = (color >> 2 & 1) * mult * 255;
      return [r, g, b];
    };
    convert.ansi256.rgb = function(args2) {
      if (args2 >= 232) {
        const c = (args2 - 232) * 10 + 8;
        return [c, c, c];
      }
      args2 -= 16;
      let rem;
      const r = Math.floor(args2 / 36) / 5 * 255;
      const g = Math.floor((rem = args2 % 36) / 6) / 5 * 255;
      const b = rem % 6 / 5 * 255;
      return [r, g, b];
    };
    convert.rgb.hex = function(args2) {
      const integer = ((Math.round(args2[0]) & 255) << 16) + ((Math.round(args2[1]) & 255) << 8) + (Math.round(args2[2]) & 255);
      const string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.hex.rgb = function(args2) {
      const match = args2.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!match) {
        return [0, 0, 0];
      }
      let colorString = match[0];
      if (match[0].length === 3) {
        colorString = colorString.split("").map((char) => {
          return char + char;
        }).join("");
      }
      const integer = parseInt(colorString, 16);
      const r = integer >> 16 & 255;
      const g = integer >> 8 & 255;
      const b = integer & 255;
      return [r, g, b];
    };
    convert.rgb.hcg = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const max = Math.max(Math.max(r, g), b);
      const min = Math.min(Math.min(r, g), b);
      const chroma = max - min;
      let grayscale;
      let hue;
      if (chroma < 1) {
        grayscale = min / (1 - chroma);
      } else {
        grayscale = 0;
      }
      if (chroma <= 0) {
        hue = 0;
      } else if (max === r) {
        hue = (g - b) / chroma % 6;
      } else if (max === g) {
        hue = 2 + (b - r) / chroma;
      } else {
        hue = 4 + (r - g) / chroma;
      }
      hue /= 6;
      hue %= 1;
      return [hue * 360, chroma * 100, grayscale * 100];
    };
    convert.hsl.hcg = function(hsl) {
      const s = hsl[1] / 100;
      const l = hsl[2] / 100;
      const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
      let f = 0;
      if (c < 1) {
        f = (l - 0.5 * c) / (1 - c);
      }
      return [hsl[0], c * 100, f * 100];
    };
    convert.hsv.hcg = function(hsv) {
      const s = hsv[1] / 100;
      const v = hsv[2] / 100;
      const c = s * v;
      let f = 0;
      if (c < 1) {
        f = (v - c) / (1 - c);
      }
      return [hsv[0], c * 100, f * 100];
    };
    convert.hcg.rgb = function(hcg) {
      const h = hcg[0] / 360;
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      if (c === 0) {
        return [g * 255, g * 255, g * 255];
      }
      const pure = [0, 0, 0];
      const hi = h % 1 * 6;
      const v = hi % 1;
      const w = 1 - v;
      let mg = 0;
      switch (Math.floor(hi)) {
        case 0:
          pure[0] = 1;
          pure[1] = v;
          pure[2] = 0;
          break;
        case 1:
          pure[0] = w;
          pure[1] = 1;
          pure[2] = 0;
          break;
        case 2:
          pure[0] = 0;
          pure[1] = 1;
          pure[2] = v;
          break;
        case 3:
          pure[0] = 0;
          pure[1] = w;
          pure[2] = 1;
          break;
        case 4:
          pure[0] = v;
          pure[1] = 0;
          pure[2] = 1;
          break;
        default:
          pure[0] = 1;
          pure[1] = 0;
          pure[2] = w;
      }
      mg = (1 - c) * g;
      return [
        (c * pure[0] + mg) * 255,
        (c * pure[1] + mg) * 255,
        (c * pure[2] + mg) * 255
      ];
    };
    convert.hcg.hsv = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const v = c + g * (1 - c);
      let f = 0;
      if (v > 0) {
        f = c / v;
      }
      return [hcg[0], f * 100, v * 100];
    };
    convert.hcg.hsl = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const l = g * (1 - c) + 0.5 * c;
      let s = 0;
      if (l > 0 && l < 0.5) {
        s = c / (2 * l);
      } else if (l >= 0.5 && l < 1) {
        s = c / (2 * (1 - l));
      }
      return [hcg[0], s * 100, l * 100];
    };
    convert.hcg.hwb = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const v = c + g * (1 - c);
      return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };
    convert.hwb.hcg = function(hwb) {
      const w = hwb[1] / 100;
      const b = hwb[2] / 100;
      const v = 1 - b;
      const c = v - w;
      let g = 0;
      if (c < 1) {
        g = (v - c) / (1 - c);
      }
      return [hwb[0], c * 100, g * 100];
    };
    convert.apple.rgb = function(apple) {
      return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
    };
    convert.rgb.apple = function(rgb) {
      return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
    };
    convert.gray.rgb = function(args2) {
      return [args2[0] / 100 * 255, args2[0] / 100 * 255, args2[0] / 100 * 255];
    };
    convert.gray.hsl = function(args2) {
      return [0, 0, args2[0]];
    };
    convert.gray.hsv = convert.gray.hsl;
    convert.gray.hwb = function(gray) {
      return [0, 100, gray[0]];
    };
    convert.gray.cmyk = function(gray) {
      return [0, 0, 0, gray[0]];
    };
    convert.gray.lab = function(gray) {
      return [gray[0], 0, 0];
    };
    convert.gray.hex = function(gray) {
      const val = Math.round(gray[0] / 100 * 255) & 255;
      const integer = (val << 16) + (val << 8) + val;
      const string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.rgb.gray = function(rgb) {
      const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
      return [val / 255 * 100];
    };
  }
});

// node_modules/color-convert/route.js
var require_route = __commonJS({
  "node_modules/color-convert/route.js"(exports, module2) {
    var conversions = require_conversions();
    function buildGraph() {
      const graph = {};
      const models = Object.keys(conversions);
      for (let len = models.length, i = 0; i < len; i++) {
        graph[models[i]] = {
          // http://jsperf.com/1-vs-infinity
          // micro-opt, but this is simple.
          distance: -1,
          parent: null
        };
      }
      return graph;
    }
    function deriveBFS(fromModel) {
      const graph = buildGraph();
      const queue = [fromModel];
      graph[fromModel].distance = 0;
      while (queue.length) {
        const current = queue.pop();
        const adjacents = Object.keys(conversions[current]);
        for (let len = adjacents.length, i = 0; i < len; i++) {
          const adjacent = adjacents[i];
          const node = graph[adjacent];
          if (node.distance === -1) {
            node.distance = graph[current].distance + 1;
            node.parent = current;
            queue.unshift(adjacent);
          }
        }
      }
      return graph;
    }
    function link(from, to) {
      return function(args2) {
        return to(from(args2));
      };
    }
    function wrapConversion(toModel, graph) {
      const path4 = [graph[toModel].parent, toModel];
      let fn = conversions[graph[toModel].parent][toModel];
      let cur = graph[toModel].parent;
      while (graph[cur].parent) {
        path4.unshift(graph[cur].parent);
        fn = link(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
      }
      fn.conversion = path4;
      return fn;
    }
    module2.exports = function(fromModel) {
      const graph = deriveBFS(fromModel);
      const conversion = {};
      const models = Object.keys(graph);
      for (let len = models.length, i = 0; i < len; i++) {
        const toModel = models[i];
        const node = graph[toModel];
        if (node.parent === null) {
          continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
      }
      return conversion;
    };
  }
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS({
  "node_modules/color-convert/index.js"(exports, module2) {
    var conversions = require_conversions();
    var route = require_route();
    var convert = {};
    var models = Object.keys(conversions);
    function wrapRaw(fn) {
      const wrappedFn = function(...args2) {
        const arg0 = args2[0];
        if (arg0 === void 0 || arg0 === null) {
          return arg0;
        }
        if (arg0.length > 1) {
          args2 = arg0;
        }
        return fn(args2);
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    function wrapRounded(fn) {
      const wrappedFn = function(...args2) {
        const arg0 = args2[0];
        if (arg0 === void 0 || arg0 === null) {
          return arg0;
        }
        if (arg0.length > 1) {
          args2 = arg0;
        }
        const result = fn(args2);
        if (typeof result === "object") {
          for (let len = result.length, i = 0; i < len; i++) {
            result[i] = Math.round(result[i]);
          }
        }
        return result;
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    models.forEach((fromModel) => {
      convert[fromModel] = {};
      Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
      Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
      const routes = route(fromModel);
      const routeModels = Object.keys(routes);
      routeModels.forEach((toModel) => {
        const fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
      });
    });
    module2.exports = convert;
  }
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS({
  "node_modules/ansi-styles/index.js"(exports, module2) {
    "use strict";
    var wrapAnsi16 = (fn, offset) => (...args2) => {
      const code = fn(...args2);
      return `\x1B[${code + offset}m`;
    };
    var wrapAnsi256 = (fn, offset) => (...args2) => {
      const code = fn(...args2);
      return `\x1B[${38 + offset};5;${code}m`;
    };
    var wrapAnsi16m = (fn, offset) => (...args2) => {
      const rgb = fn(...args2);
      return `\x1B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
    };
    var ansi2ansi = (n) => n;
    var rgb2rgb = (r, g, b) => [r, g, b];
    var setLazyProperty = (object, property, get) => {
      Object.defineProperty(object, property, {
        get: () => {
          const value = get();
          Object.defineProperty(object, property, {
            value,
            enumerable: true,
            configurable: true
          });
          return value;
        },
        enumerable: true,
        configurable: true
      });
    };
    var colorConvert;
    var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
      if (colorConvert === void 0) {
        colorConvert = require_color_convert();
      }
      const offset = isBackground ? 10 : 0;
      const styles = {};
      for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
        const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
        if (sourceSpace === targetSpace) {
          styles[name] = wrap(identity, offset);
        } else if (typeof suite === "object") {
          styles[name] = wrap(suite[targetSpace], offset);
        }
      }
      return styles;
    };
    function assembleStyles() {
      const codes = /* @__PURE__ */ new Map();
      const styles = {
        modifier: {
          reset: [0, 0],
          // 21 isn't widely supported and 22 does the same thing
          bold: [1, 22],
          dim: [2, 22],
          italic: [3, 23],
          underline: [4, 24],
          inverse: [7, 27],
          hidden: [8, 28],
          strikethrough: [9, 29]
        },
        color: {
          black: [30, 39],
          red: [31, 39],
          green: [32, 39],
          yellow: [33, 39],
          blue: [34, 39],
          magenta: [35, 39],
          cyan: [36, 39],
          white: [37, 39],
          // Bright color
          blackBright: [90, 39],
          redBright: [91, 39],
          greenBright: [92, 39],
          yellowBright: [93, 39],
          blueBright: [94, 39],
          magentaBright: [95, 39],
          cyanBright: [96, 39],
          whiteBright: [97, 39]
        },
        bgColor: {
          bgBlack: [40, 49],
          bgRed: [41, 49],
          bgGreen: [42, 49],
          bgYellow: [43, 49],
          bgBlue: [44, 49],
          bgMagenta: [45, 49],
          bgCyan: [46, 49],
          bgWhite: [47, 49],
          // Bright color
          bgBlackBright: [100, 49],
          bgRedBright: [101, 49],
          bgGreenBright: [102, 49],
          bgYellowBright: [103, 49],
          bgBlueBright: [104, 49],
          bgMagentaBright: [105, 49],
          bgCyanBright: [106, 49],
          bgWhiteBright: [107, 49]
        }
      };
      styles.color.gray = styles.color.blackBright;
      styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
      styles.color.grey = styles.color.blackBright;
      styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
      for (const [groupName, group] of Object.entries(styles)) {
        for (const [styleName, style] of Object.entries(group)) {
          styles[styleName] = {
            open: `\x1B[${style[0]}m`,
            close: `\x1B[${style[1]}m`
          };
          group[styleName] = styles[styleName];
          codes.set(style[0], style[1]);
        }
        Object.defineProperty(styles, groupName, {
          value: group,
          enumerable: false
        });
      }
      Object.defineProperty(styles, "codes", {
        value: codes,
        enumerable: false
      });
      styles.color.close = "\x1B[39m";
      styles.bgColor.close = "\x1B[49m";
      setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
      setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
      setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
      setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
      setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
      setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
      return styles;
    }
    Object.defineProperty(module2, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports, module2) {
    "use strict";
    module2.exports = (flag, argv = process.argv) => {
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const position = argv.indexOf(prefix + flag);
      const terminatorPosition = argv.indexOf("--");
      return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var tty = require("tty");
    var hasFlag = require_has_flag();
    var { env } = process;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      forceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = 1;
    }
    if ("FORCE_COLOR" in env) {
      if (env.FORCE_COLOR === "true") {
        forceColor = 1;
      } else if (env.FORCE_COLOR === "false") {
        forceColor = 0;
      } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
      }
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(haveStream, streamIsTTY) {
      if (forceColor === 0) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (haveStream && !streamIsTTY && forceColor === void 0) {
        return 0;
      }
      const min = forceColor || 0;
      if (env.TERM === "dumb") {
        return min;
      }
      if (process.platform === "win32") {
        const osRelease = os.release().split(".");
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream, stream && stream.isTTY);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: translateLevel(supportsColor(true, tty.isatty(1))),
      stderr: translateLevel(supportsColor(true, tty.isatty(2)))
    };
  }
});

// node_modules/chalk/source/util.js
var require_util2 = __commonJS({
  "node_modules/chalk/source/util.js"(exports, module2) {
    "use strict";
    var stringReplaceAll = (string, substring, replacer) => {
      let index = string.indexOf(substring);
      if (index === -1) {
        return string;
      }
      const substringLength = substring.length;
      let endIndex = 0;
      let returnValue = "";
      do {
        returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
        endIndex = index + substringLength;
        index = string.indexOf(substring, endIndex);
      } while (index !== -1);
      returnValue += string.substr(endIndex);
      return returnValue;
    };
    var stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
      let endIndex = 0;
      let returnValue = "";
      do {
        const gotCR = string[index - 1] === "\r";
        returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
        endIndex = index + 1;
        index = string.indexOf("\n", endIndex);
      } while (index !== -1);
      returnValue += string.substr(endIndex);
      return returnValue;
    };
    module2.exports = {
      stringReplaceAll,
      stringEncaseCRLFWithFirstIndex
    };
  }
});

// node_modules/chalk/source/templates.js
var require_templates = __commonJS({
  "node_modules/chalk/source/templates.js"(exports, module2) {
    "use strict";
    var TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
    var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
    var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
    var ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
    var ESCAPES = /* @__PURE__ */ new Map([
      ["n", "\n"],
      ["r", "\r"],
      ["t", "	"],
      ["b", "\b"],
      ["f", "\f"],
      ["v", "\v"],
      ["0", "\0"],
      ["\\", "\\"],
      ["e", "\x1B"],
      ["a", "\x07"]
    ]);
    function unescape(c) {
      const u = c[0] === "u";
      const bracket = c[1] === "{";
      if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
        return String.fromCharCode(parseInt(c.slice(1), 16));
      }
      if (u && bracket) {
        return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
      }
      return ESCAPES.get(c) || c;
    }
    function parseArguments(name, arguments_) {
      const results = [];
      const chunks = arguments_.trim().split(/\s*,\s*/g);
      let matches;
      for (const chunk of chunks) {
        const number = Number(chunk);
        if (!Number.isNaN(number)) {
          results.push(number);
        } else if (matches = chunk.match(STRING_REGEX)) {
          results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
        } else {
          throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
        }
      }
      return results;
    }
    function parseStyle(style) {
      STYLE_REGEX.lastIndex = 0;
      const results = [];
      let matches;
      while ((matches = STYLE_REGEX.exec(style)) !== null) {
        const name = matches[1];
        if (matches[2]) {
          const args2 = parseArguments(name, matches[2]);
          results.push([name].concat(args2));
        } else {
          results.push([name]);
        }
      }
      return results;
    }
    function buildStyle(chalk4, styles) {
      const enabled = {};
      for (const layer of styles) {
        for (const style of layer.styles) {
          enabled[style[0]] = layer.inverse ? null : style.slice(1);
        }
      }
      let current = chalk4;
      for (const [styleName, styles2] of Object.entries(enabled)) {
        if (!Array.isArray(styles2)) {
          continue;
        }
        if (!(styleName in current)) {
          throw new Error(`Unknown Chalk style: ${styleName}`);
        }
        current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
      }
      return current;
    }
    module2.exports = (chalk4, temporary) => {
      const styles = [];
      const chunks = [];
      let chunk = [];
      temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
        if (escapeCharacter) {
          chunk.push(unescape(escapeCharacter));
        } else if (style) {
          const string = chunk.join("");
          chunk = [];
          chunks.push(styles.length === 0 ? string : buildStyle(chalk4, styles)(string));
          styles.push({ inverse, styles: parseStyle(style) });
        } else if (close) {
          if (styles.length === 0) {
            throw new Error("Found extraneous } in Chalk template literal");
          }
          chunks.push(buildStyle(chalk4, styles)(chunk.join("")));
          chunk = [];
          styles.pop();
        } else {
          chunk.push(character);
        }
      });
      chunks.push(chunk.join(""));
      if (styles.length > 0) {
        const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
        throw new Error(errMessage);
      }
      return chunks.join("");
    };
  }
});

// node_modules/chalk/source/index.js
var require_source = __commonJS({
  "node_modules/chalk/source/index.js"(exports, module2) {
    "use strict";
    var ansiStyles = require_ansi_styles();
    var { stdout: stdoutColor, stderr: stderrColor } = require_supports_color();
    var {
      stringReplaceAll,
      stringEncaseCRLFWithFirstIndex
    } = require_util2();
    var { isArray } = Array;
    var levelMapping = [
      "ansi",
      "ansi",
      "ansi256",
      "ansi16m"
    ];
    var styles = /* @__PURE__ */ Object.create(null);
    var applyOptions = (object, options = {}) => {
      if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
        throw new Error("The `level` option should be an integer from 0 to 3");
      }
      const colorLevel = stdoutColor ? stdoutColor.level : 0;
      object.level = options.level === void 0 ? colorLevel : options.level;
    };
    var ChalkClass = class {
      constructor(options) {
        return chalkFactory(options);
      }
    };
    var chalkFactory = (options) => {
      const chalk5 = {};
      applyOptions(chalk5, options);
      chalk5.template = (...arguments_) => chalkTag(chalk5.template, ...arguments_);
      Object.setPrototypeOf(chalk5, Chalk.prototype);
      Object.setPrototypeOf(chalk5.template, chalk5);
      chalk5.template.constructor = () => {
        throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
      };
      chalk5.template.Instance = ChalkClass;
      return chalk5.template;
    };
    function Chalk(options) {
      return chalkFactory(options);
    }
    for (const [styleName, style] of Object.entries(ansiStyles)) {
      styles[styleName] = {
        get() {
          const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
          Object.defineProperty(this, styleName, { value: builder });
          return builder;
        }
      };
    }
    styles.visible = {
      get() {
        const builder = createBuilder(this, this._styler, true);
        Object.defineProperty(this, "visible", { value: builder });
        return builder;
      }
    };
    var usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
    for (const model of usedModels) {
      styles[model] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
            return createBuilder(this, styler, this._isEmpty);
          };
        }
      };
    }
    for (const model of usedModels) {
      const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
      styles[bgModel] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
            return createBuilder(this, styler, this._isEmpty);
          };
        }
      };
    }
    var proto = Object.defineProperties(() => {
    }, {
      ...styles,
      level: {
        enumerable: true,
        get() {
          return this._generator.level;
        },
        set(level) {
          this._generator.level = level;
        }
      }
    });
    var createStyler = (open, close, parent) => {
      let openAll;
      let closeAll;
      if (parent === void 0) {
        openAll = open;
        closeAll = close;
      } else {
        openAll = parent.openAll + open;
        closeAll = close + parent.closeAll;
      }
      return {
        open,
        close,
        openAll,
        closeAll,
        parent
      };
    };
    var createBuilder = (self2, _styler, _isEmpty) => {
      const builder = (...arguments_) => {
        if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
          return applyStyle(builder, chalkTag(builder, ...arguments_));
        }
        return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
      };
      Object.setPrototypeOf(builder, proto);
      builder._generator = self2;
      builder._styler = _styler;
      builder._isEmpty = _isEmpty;
      return builder;
    };
    var applyStyle = (self2, string) => {
      if (self2.level <= 0 || !string) {
        return self2._isEmpty ? "" : string;
      }
      let styler = self2._styler;
      if (styler === void 0) {
        return string;
      }
      const { openAll, closeAll } = styler;
      if (string.indexOf("\x1B") !== -1) {
        while (styler !== void 0) {
          string = stringReplaceAll(string, styler.close, styler.open);
          styler = styler.parent;
        }
      }
      const lfIndex = string.indexOf("\n");
      if (lfIndex !== -1) {
        string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
      }
      return openAll + string + closeAll;
    };
    var template;
    var chalkTag = (chalk5, ...strings) => {
      const [firstString] = strings;
      if (!isArray(firstString) || !isArray(firstString.raw)) {
        return strings.join(" ");
      }
      const arguments_ = strings.slice(1);
      const parts = [firstString.raw[0]];
      for (let i = 1; i < firstString.length; i++) {
        parts.push(
          String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"),
          String(firstString.raw[i])
        );
      }
      if (template === void 0) {
        template = require_templates();
      }
      return template(chalk5, parts.join(""));
    };
    Object.defineProperties(Chalk.prototype, styles);
    var chalk4 = Chalk();
    chalk4.supportsColor = stdoutColor;
    chalk4.stderr = Chalk({ level: stderrColor ? stderrColor.level : 0 });
    chalk4.stderr.supportsColor = stderrColor;
    module2.exports = chalk4;
  }
});

// node_modules/deepmerge/dist/umd.js
var require_umd = __commonJS({
  "node_modules/deepmerge/dist/umd.js"(exports, module2) {
    (function(global2, factory) {
      typeof exports === "object" && typeof module2 !== "undefined" ? module2.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = global2 || self, global2.deepmerge = factory());
    })(exports, function() {
      "use strict";
      var isMergeableObject = function isMergeableObject2(value) {
        return isNonNullObject(value) && !isSpecial(value);
      };
      function isNonNullObject(value) {
        return !!value && typeof value === "object";
      }
      function isSpecial(value) {
        var stringValue = Object.prototype.toString.call(value);
        return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
      }
      var canUseSymbol = typeof Symbol === "function" && Symbol.for;
      var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
      function isReactElement(value) {
        return value.$$typeof === REACT_ELEMENT_TYPE;
      }
      function emptyTarget(val) {
        return Array.isArray(val) ? [] : {};
      }
      function cloneUnlessOtherwiseSpecified(value, options) {
        return options.clone !== false && options.isMergeableObject(value) ? deepmerge2(emptyTarget(value), value, options) : value;
      }
      function defaultArrayMerge(target, source, options) {
        return target.concat(source).map(function(element) {
          return cloneUnlessOtherwiseSpecified(element, options);
        });
      }
      function getMergeFunction(key, options) {
        if (!options.customMerge) {
          return deepmerge2;
        }
        var customMerge = options.customMerge(key);
        return typeof customMerge === "function" ? customMerge : deepmerge2;
      }
      function getEnumerableOwnPropertySymbols(target) {
        return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
          return target.propertyIsEnumerable(symbol);
        }) : [];
      }
      function getKeys(target) {
        return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
      }
      function mergeObject(target, source, options) {
        var destination = {};
        if (options.isMergeableObject(target)) {
          getKeys(target).forEach(function(key) {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
          });
        }
        getKeys(source).forEach(function(key) {
          if (!options.isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
          } else {
            destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
          }
        });
        return destination;
      }
      function deepmerge2(target, source, options) {
        options = options || {};
        options.arrayMerge = options.arrayMerge || defaultArrayMerge;
        options.isMergeableObject = options.isMergeableObject || isMergeableObject;
        var sourceIsArray = Array.isArray(source);
        var targetIsArray = Array.isArray(target);
        var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
        if (!sourceAndTargetTypesMatch) {
          return cloneUnlessOtherwiseSpecified(source, options);
        } else if (sourceIsArray) {
          return options.arrayMerge(target, source, options);
        } else {
          return mergeObject(target, source, options);
        }
      }
      deepmerge2.all = function deepmergeAll(array, options) {
        if (!Array.isArray(array)) {
          throw new Error("first argument should be an array");
        }
        return array.reduce(function(prev, next) {
          return deepmerge2(prev, next, options);
        }, {});
      };
      var deepmerge_1 = deepmerge2;
      return deepmerge_1;
    });
  }
});

// node_modules/is/index.js
var require_is = __commonJS({
  "node_modules/is/index.js"(exports, module2) {
    "use strict";
    var objProto = Object.prototype;
    var owns = objProto.hasOwnProperty;
    var toStr = objProto.toString;
    var symbolValueOf;
    if (typeof Symbol === "function") {
      symbolValueOf = Symbol.prototype.valueOf;
    }
    var bigIntValueOf;
    if (typeof BigInt === "function") {
      bigIntValueOf = BigInt.prototype.valueOf;
    }
    var isActualNaN = function(value) {
      return value !== value;
    };
    var NON_HOST_TYPES = {
      "boolean": 1,
      number: 1,
      string: 1,
      undefined: 1
    };
    var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
    var hexRegex = /^[A-Fa-f0-9]+$/;
    var is = {};
    is.a = is.type = function(value, type) {
      return typeof value === type;
    };
    is.defined = function(value) {
      return typeof value !== "undefined";
    };
    is.empty = function(value) {
      var type = toStr.call(value);
      var key;
      if (type === "[object Array]" || type === "[object Arguments]" || type === "[object String]") {
        return value.length === 0;
      }
      if (type === "[object Object]") {
        for (key in value) {
          if (owns.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      return !value;
    };
    is.equal = function equal(value, other) {
      if (value === other) {
        return true;
      }
      var type = toStr.call(value);
      var key;
      if (type !== toStr.call(other)) {
        return false;
      }
      if (type === "[object Object]") {
        for (key in value) {
          if (!is.equal(value[key], other[key]) || !(key in other)) {
            return false;
          }
        }
        for (key in other) {
          if (!is.equal(value[key], other[key]) || !(key in value)) {
            return false;
          }
        }
        return true;
      }
      if (type === "[object Array]") {
        key = value.length;
        if (key !== other.length) {
          return false;
        }
        while (key--) {
          if (!is.equal(value[key], other[key])) {
            return false;
          }
        }
        return true;
      }
      if (type === "[object Function]") {
        return value.prototype === other.prototype;
      }
      if (type === "[object Date]") {
        return value.getTime() === other.getTime();
      }
      return false;
    };
    is.hosted = function(value, host) {
      var type = typeof host[value];
      return type === "object" ? !!host[value] : !NON_HOST_TYPES[type];
    };
    is.instance = is["instanceof"] = function(value, constructor) {
      return value instanceof constructor;
    };
    is.nil = is["null"] = function(value) {
      return value === null;
    };
    is.undef = is.undefined = function(value) {
      return typeof value === "undefined";
    };
    is.args = is.arguments = function(value) {
      var isStandardArguments = toStr.call(value) === "[object Arguments]";
      var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
      return isStandardArguments || isOldArguments;
    };
    is.array = Array.isArray || function(value) {
      return toStr.call(value) === "[object Array]";
    };
    is.args.empty = function(value) {
      return is.args(value) && value.length === 0;
    };
    is.array.empty = function(value) {
      return is.array(value) && value.length === 0;
    };
    is.arraylike = function(value) {
      return !!value && !is.bool(value) && owns.call(value, "length") && isFinite(value.length) && is.number(value.length) && value.length >= 0;
    };
    is.bool = is["boolean"] = function(value) {
      return toStr.call(value) === "[object Boolean]";
    };
    is["false"] = function(value) {
      return is.bool(value) && Boolean(Number(value)) === false;
    };
    is["true"] = function(value) {
      return is.bool(value) && Boolean(Number(value)) === true;
    };
    is.date = function(value) {
      return toStr.call(value) === "[object Date]";
    };
    is.date.valid = function(value) {
      return is.date(value) && !isNaN(Number(value));
    };
    is.element = function(value) {
      return value !== void 0 && typeof HTMLElement !== "undefined" && value instanceof HTMLElement && value.nodeType === 1;
    };
    is.error = function(value) {
      return toStr.call(value) === "[object Error]";
    };
    is.fn = is["function"] = function(value) {
      var isAlert = typeof window !== "undefined" && value === window.alert;
      if (isAlert) {
        return true;
      }
      var str = toStr.call(value);
      return str === "[object Function]" || str === "[object GeneratorFunction]" || str === "[object AsyncFunction]";
    };
    is.number = function(value) {
      return toStr.call(value) === "[object Number]";
    };
    is.infinite = function(value) {
      return value === Infinity || value === -Infinity;
    };
    is.decimal = function(value) {
      return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
    };
    is.divisibleBy = function(value, n) {
      var isDividendInfinite = is.infinite(value);
      var isDivisorInfinite = is.infinite(n);
      var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
      return isDividendInfinite || isDivisorInfinite || isNonZeroNumber && value % n === 0;
    };
    is.integer = is["int"] = function(value) {
      return is.number(value) && !isActualNaN(value) && value % 1 === 0;
    };
    is.maximum = function(value, others) {
      if (isActualNaN(value)) {
        throw new TypeError("NaN is not a valid value");
      } else if (!is.arraylike(others)) {
        throw new TypeError("second argument must be array-like");
      }
      var len = others.length;
      while (--len >= 0) {
        if (value < others[len]) {
          return false;
        }
      }
      return true;
    };
    is.minimum = function(value, others) {
      if (isActualNaN(value)) {
        throw new TypeError("NaN is not a valid value");
      } else if (!is.arraylike(others)) {
        throw new TypeError("second argument must be array-like");
      }
      var len = others.length;
      while (--len >= 0) {
        if (value > others[len]) {
          return false;
        }
      }
      return true;
    };
    is.nan = function(value) {
      return !is.number(value) || value !== value;
    };
    is.even = function(value) {
      return is.infinite(value) || is.number(value) && value === value && value % 2 === 0;
    };
    is.odd = function(value) {
      return is.infinite(value) || is.number(value) && value === value && value % 2 !== 0;
    };
    is.ge = function(value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError("NaN is not a valid value");
      }
      return !is.infinite(value) && !is.infinite(other) && value >= other;
    };
    is.gt = function(value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError("NaN is not a valid value");
      }
      return !is.infinite(value) && !is.infinite(other) && value > other;
    };
    is.le = function(value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError("NaN is not a valid value");
      }
      return !is.infinite(value) && !is.infinite(other) && value <= other;
    };
    is.lt = function(value, other) {
      if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError("NaN is not a valid value");
      }
      return !is.infinite(value) && !is.infinite(other) && value < other;
    };
    is.within = function(value, start, finish) {
      if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
        throw new TypeError("NaN is not a valid value");
      } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
        throw new TypeError("all arguments must be numbers");
      }
      var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
      return isAnyInfinite || value >= start && value <= finish;
    };
    is.object = function(value) {
      return toStr.call(value) === "[object Object]";
    };
    is.primitive = function isPrimitive(value) {
      if (!value) {
        return true;
      }
      if (typeof value === "object" || is.object(value) || is.fn(value) || is.array(value)) {
        return false;
      }
      return true;
    };
    is.hash = function(value) {
      return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
    };
    is.regexp = function(value) {
      return toStr.call(value) === "[object RegExp]";
    };
    is.string = function(value) {
      return toStr.call(value) === "[object String]";
    };
    is.base64 = function(value) {
      return is.string(value) && (!value.length || base64Regex.test(value));
    };
    is.hex = function(value) {
      return is.string(value) && (!value.length || hexRegex.test(value));
    };
    is.symbol = function(value) {
      return typeof Symbol === "function" && toStr.call(value) === "[object Symbol]" && typeof symbolValueOf.call(value) === "symbol";
    };
    is.bigint = function(value) {
      return typeof BigInt === "function" && toStr.call(value) === "[object BigInt]" && typeof bigIntValueOf.call(value) === "bigint";
    };
    module2.exports = is;
  }
});

// node_modules/node.extend/lib/extend.js
var require_extend = __commonJS({
  "node_modules/node.extend/lib/extend.js"(exports, module2) {
    "use strict";
    var is = require_is();
    var has = require_src();
    var defineProperty = Object.defineProperty;
    var gOPD = Object.getOwnPropertyDescriptor;
    var setProperty = function setP(target, name, value) {
      if (defineProperty && name === "__proto__") {
        defineProperty(target, name, {
          enumerable: true,
          configurable: true,
          value,
          writable: true
        });
      } else {
        target[name] = value;
      }
    };
    var getProperty = function getP(obj, name) {
      if (name === "__proto__") {
        if (!has(obj, name)) {
          return void 0;
        } else if (gOPD) {
          return gOPD(obj, name).value;
        }
      }
      return obj[name];
    };
    module2.exports = function extend() {
      var target = arguments[0] || {};
      var i = 1;
      var length = arguments.length;
      var deep = false;
      var options, name, src, copy, copyIsArray, clone2;
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
      }
      if (typeof target !== "object" && !is.fn(target)) {
        target = {};
      }
      for (; i < length; i++) {
        options = arguments[i];
        if (options != null) {
          if (typeof options === "string") {
            options = options.split("");
          }
          for (name in options) {
            src = getProperty(target, name);
            copy = getProperty(options, name);
            if (target === copy) {
              continue;
            }
            if (deep && copy && (is.hash(copy) || (copyIsArray = is.array(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone2 = src && is.array(src) ? src : [];
              } else {
                clone2 = src && is.hash(src) ? src : {};
              }
              setProperty(target, name, extend(deep, clone2, copy));
            } else if (typeof copy !== "undefined") {
              setProperty(target, name, copy);
            }
          }
        }
      }
      return target;
    };
  }
});

// node_modules/node.extend/index.js
var require_node = __commonJS({
  "node_modules/node.extend/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_extend();
  }
});

// node_modules/object.assign/implementation.js
var require_implementation4 = __commonJS({
  "node_modules/object.assign/implementation.js"(exports, module2) {
    "use strict";
    var keys = require_object_keys();
    var bind = require_function_bind();
    var canBeObject = function(obj) {
      return typeof obj !== "undefined" && obj !== null;
    };
    var hasSymbols = require_shams()();
    var toObject = Object;
    var push2 = bind.call(Function.call, Array.prototype.push);
    var propIsEnumerable = bind.call(Function.call, Object.prototype.propertyIsEnumerable);
    var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;
    module2.exports = function assign(target, source1) {
      if (!canBeObject(target)) {
        throw new TypeError("target must be an object");
      }
      var objTarget = toObject(target);
      var s, source, i, props, syms, value, key;
      for (s = 1; s < arguments.length; ++s) {
        source = toObject(arguments[s]);
        props = keys(source);
        var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
        if (getSymbols) {
          syms = getSymbols(source);
          for (i = 0; i < syms.length; ++i) {
            key = syms[i];
            if (propIsEnumerable(source, key)) {
              push2(props, key);
            }
          }
        }
        for (i = 0; i < props.length; ++i) {
          key = props[i];
          value = source[key];
          if (propIsEnumerable(source, key)) {
            objTarget[key] = value;
          }
        }
      }
      return objTarget;
    };
  }
});

// node_modules/object.assign/polyfill.js
var require_polyfill2 = __commonJS({
  "node_modules/object.assign/polyfill.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation4();
    var lacksProperEnumerationOrder = function() {
      if (!Object.assign) {
        return false;
      }
      var str = "abcdefghijklmnopqrst";
      var letters = str.split("");
      var map = {};
      for (var i = 0; i < letters.length; ++i) {
        map[letters[i]] = letters[i];
      }
      var obj = Object.assign({}, map);
      var actual = "";
      for (var k in obj) {
        actual += k;
      }
      return str !== actual;
    };
    var assignHasPendingExceptions = function() {
      if (!Object.assign || !Object.preventExtensions) {
        return false;
      }
      var thrower = Object.preventExtensions({ 1: 2 });
      try {
        Object.assign(thrower, "xy");
      } catch (e) {
        return thrower[1] === "y";
      }
      return false;
    };
    module2.exports = function getPolyfill() {
      if (!Object.assign) {
        return implementation;
      }
      if (lacksProperEnumerationOrder()) {
        return implementation;
      }
      if (assignHasPendingExceptions()) {
        return implementation;
      }
      return Object.assign;
    };
  }
});

// node_modules/object.assign/shim.js
var require_shim2 = __commonJS({
  "node_modules/object.assign/shim.js"(exports, module2) {
    "use strict";
    var define2 = require_define_properties();
    var getPolyfill = require_polyfill2();
    module2.exports = function shimAssign() {
      var polyfill = getPolyfill();
      define2(
        Object,
        { assign: polyfill },
        { assign: function() {
          return Object.assign !== polyfill;
        } }
      );
      return polyfill;
    };
  }
});

// node_modules/object.assign/index.js
var require_object = __commonJS({
  "node_modules/object.assign/index.js"(exports, module2) {
    "use strict";
    var defineProperties = require_define_properties();
    var implementation = require_implementation4();
    var getPolyfill = require_polyfill2();
    var shim = require_shim2();
    var polyfill = getPolyfill();
    defineProperties(polyfill, {
      getPolyfill,
      implementation,
      shim
    });
    module2.exports = polyfill;
  }
});

// node_modules/asap/raw.js
var require_raw = __commonJS({
  "node_modules/asap/raw.js"(exports, module2) {
    "use strict";
    var domain;
    var hasSetImmediate = typeof setImmediate === "function";
    module2.exports = rawAsap;
    function rawAsap(task) {
      if (!queue.length) {
        requestFlush();
        flushing = true;
      }
      queue[queue.length] = task;
    }
    var queue = [];
    var flushing = false;
    var index = 0;
    var capacity = 1024;
    function flush() {
      while (index < queue.length) {
        var currentIndex = index;
        index = index + 1;
        queue[currentIndex].call();
        if (index > capacity) {
          for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
            queue[scan] = queue[scan + index];
          }
          queue.length -= index;
          index = 0;
        }
      }
      queue.length = 0;
      index = 0;
      flushing = false;
    }
    rawAsap.requestFlush = requestFlush;
    function requestFlush() {
      var parentDomain = process.domain;
      if (parentDomain) {
        if (!domain) {
          domain = require("domain");
        }
        domain.active = process.domain = null;
      }
      if (flushing && hasSetImmediate) {
        setImmediate(flush);
      } else {
        process.nextTick(flush);
      }
      if (parentDomain) {
        domain.active = process.domain = parentDomain;
      }
    }
  }
});

// node_modules/promise/lib/core.js
var require_core = __commonJS({
  "node_modules/promise/lib/core.js"(exports, module2) {
    "use strict";
    var asap = require_raw();
    function noop() {
    }
    var LAST_ERROR = null;
    var IS_ERROR = {};
    function getThen(obj) {
      try {
        return obj.then;
      } catch (ex) {
        LAST_ERROR = ex;
        return IS_ERROR;
      }
    }
    function tryCallOne(fn, a) {
      try {
        return fn(a);
      } catch (ex) {
        LAST_ERROR = ex;
        return IS_ERROR;
      }
    }
    function tryCallTwo(fn, a, b) {
      try {
        fn(a, b);
      } catch (ex) {
        LAST_ERROR = ex;
        return IS_ERROR;
      }
    }
    module2.exports = Promise2;
    function Promise2(fn) {
      if (typeof this !== "object") {
        throw new TypeError("Promises must be constructed via new");
      }
      if (typeof fn !== "function") {
        throw new TypeError("Promise constructor's argument is not a function");
      }
      this._40 = 0;
      this._65 = 0;
      this._55 = null;
      this._72 = null;
      if (fn === noop)
        return;
      doResolve(fn, this);
    }
    Promise2._37 = null;
    Promise2._87 = null;
    Promise2._61 = noop;
    Promise2.prototype.then = function(onFulfilled, onRejected) {
      if (this.constructor !== Promise2) {
        return safeThen(this, onFulfilled, onRejected);
      }
      var res = new Promise2(noop);
      handle(this, new Handler(onFulfilled, onRejected, res));
      return res;
    };
    function safeThen(self2, onFulfilled, onRejected) {
      return new self2.constructor(function(resolve3, reject2) {
        var res = new Promise2(noop);
        res.then(resolve3, reject2);
        handle(self2, new Handler(onFulfilled, onRejected, res));
      });
    }
    function handle(self2, deferred) {
      while (self2._65 === 3) {
        self2 = self2._55;
      }
      if (Promise2._37) {
        Promise2._37(self2);
      }
      if (self2._65 === 0) {
        if (self2._40 === 0) {
          self2._40 = 1;
          self2._72 = deferred;
          return;
        }
        if (self2._40 === 1) {
          self2._40 = 2;
          self2._72 = [self2._72, deferred];
          return;
        }
        self2._72.push(deferred);
        return;
      }
      handleResolved(self2, deferred);
    }
    function handleResolved(self2, deferred) {
      asap(function() {
        var cb = self2._65 === 1 ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          if (self2._65 === 1) {
            resolve2(deferred.promise, self2._55);
          } else {
            reject(deferred.promise, self2._55);
          }
          return;
        }
        var ret = tryCallOne(cb, self2._55);
        if (ret === IS_ERROR) {
          reject(deferred.promise, LAST_ERROR);
        } else {
          resolve2(deferred.promise, ret);
        }
      });
    }
    function resolve2(self2, newValue) {
      if (newValue === self2) {
        return reject(
          self2,
          new TypeError("A promise cannot be resolved with itself.")
        );
      }
      if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
        var then = getThen(newValue);
        if (then === IS_ERROR) {
          return reject(self2, LAST_ERROR);
        }
        if (then === self2.then && newValue instanceof Promise2) {
          self2._65 = 3;
          self2._55 = newValue;
          finale(self2);
          return;
        } else if (typeof then === "function") {
          doResolve(then.bind(newValue), self2);
          return;
        }
      }
      self2._65 = 1;
      self2._55 = newValue;
      finale(self2);
    }
    function reject(self2, newValue) {
      self2._65 = 2;
      self2._55 = newValue;
      if (Promise2._87) {
        Promise2._87(self2, newValue);
      }
      finale(self2);
    }
    function finale(self2) {
      if (self2._40 === 1) {
        handle(self2, self2._72);
        self2._72 = null;
      }
      if (self2._40 === 2) {
        for (var i = 0; i < self2._72.length; i++) {
          handle(self2, self2._72[i]);
        }
        self2._72 = null;
      }
    }
    function Handler(onFulfilled, onRejected, promise) {
      this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
      this.onRejected = typeof onRejected === "function" ? onRejected : null;
      this.promise = promise;
    }
    function doResolve(fn, promise) {
      var done = false;
      var res = tryCallTwo(fn, function(value) {
        if (done)
          return;
        done = true;
        resolve2(promise, value);
      }, function(reason) {
        if (done)
          return;
        done = true;
        reject(promise, reason);
      });
      if (!done && res === IS_ERROR) {
        done = true;
        reject(promise, LAST_ERROR);
      }
    }
  }
});

// node_modules/promise/lib/es6-extensions.js
var require_es6_extensions = __commonJS({
  "node_modules/promise/lib/es6-extensions.js"(exports, module2) {
    "use strict";
    var Promise2 = require_core();
    module2.exports = Promise2;
    var TRUE = valuePromise(true);
    var FALSE = valuePromise(false);
    var NULL = valuePromise(null);
    var UNDEFINED = valuePromise(void 0);
    var ZERO = valuePromise(0);
    var EMPTYSTRING = valuePromise("");
    function valuePromise(value) {
      var p = new Promise2(Promise2._61);
      p._65 = 1;
      p._55 = value;
      return p;
    }
    Promise2.resolve = function(value) {
      if (value instanceof Promise2)
        return value;
      if (value === null)
        return NULL;
      if (value === void 0)
        return UNDEFINED;
      if (value === true)
        return TRUE;
      if (value === false)
        return FALSE;
      if (value === 0)
        return ZERO;
      if (value === "")
        return EMPTYSTRING;
      if (typeof value === "object" || typeof value === "function") {
        try {
          var then = value.then;
          if (typeof then === "function") {
            return new Promise2(then.bind(value));
          }
        } catch (ex) {
          return new Promise2(function(resolve2, reject) {
            reject(ex);
          });
        }
      }
      return valuePromise(value);
    };
    Promise2.all = function(arr) {
      var args2 = Array.prototype.slice.call(arr);
      return new Promise2(function(resolve2, reject) {
        if (args2.length === 0)
          return resolve2([]);
        var remaining = args2.length;
        function res(i2, val) {
          if (val && (typeof val === "object" || typeof val === "function")) {
            if (val instanceof Promise2 && val.then === Promise2.prototype.then) {
              while (val._65 === 3) {
                val = val._55;
              }
              if (val._65 === 1)
                return res(i2, val._55);
              if (val._65 === 2)
                reject(val._55);
              val.then(function(val2) {
                res(i2, val2);
              }, reject);
              return;
            } else {
              var then = val.then;
              if (typeof then === "function") {
                var p = new Promise2(then.bind(val));
                p.then(function(val2) {
                  res(i2, val2);
                }, reject);
                return;
              }
            }
          }
          args2[i2] = val;
          if (--remaining === 0) {
            resolve2(args2);
          }
        }
        for (var i = 0; i < args2.length; i++) {
          res(i, args2[i]);
        }
      });
    };
    Promise2.reject = function(value) {
      return new Promise2(function(resolve2, reject) {
        reject(value);
      });
    };
    Promise2.race = function(values) {
      return new Promise2(function(resolve2, reject) {
        values.forEach(function(value) {
          Promise2.resolve(value).then(resolve2, reject);
        });
      });
    };
    Promise2.prototype["catch"] = function(onRejected) {
      return this.then(null, onRejected);
    };
  }
});

// node_modules/promise-deferred/index.js
var require_promise_deferred = __commonJS({
  "node_modules/promise-deferred/index.js"(exports, module2) {
    "use strict";
    var Promise2 = require_es6_extensions();
    var Deferred = function Deferred2() {
      if (!(this instanceof Deferred2)) {
        return new Deferred2();
      }
      var self2 = this;
      self2.promise = new Promise2(function(resolve2, reject) {
        self2.resolve = resolve2;
        self2.reject = reject;
      });
      return self2;
    };
    Deferred.Promise = Promise2;
    module2.exports = Deferred;
  }
});

// node_modules/is-callable/index.js
var require_is_callable = __commonJS({
  "node_modules/is-callable/index.js"(exports, module2) {
    "use strict";
    var fnToStr = Function.prototype.toString;
    var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
    var badArrayLike;
    var isCallableMarker;
    if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") {
      try {
        badArrayLike = Object.defineProperty({}, "length", {
          get: function() {
            throw isCallableMarker;
          }
        });
        isCallableMarker = {};
        reflectApply(function() {
          throw 42;
        }, null, badArrayLike);
      } catch (_) {
        if (_ !== isCallableMarker) {
          reflectApply = null;
        }
      }
    } else {
      reflectApply = null;
    }
    var constructorRegex = /^\s*class\b/;
    var isES6ClassFn = function isES6ClassFunction(value) {
      try {
        var fnStr = fnToStr.call(value);
        return constructorRegex.test(fnStr);
      } catch (e) {
        return false;
      }
    };
    var tryFunctionObject = function tryFunctionToStr(value) {
      try {
        if (isES6ClassFn(value)) {
          return false;
        }
        fnToStr.call(value);
        return true;
      } catch (e) {
        return false;
      }
    };
    var toStr = Object.prototype.toString;
    var objectClass = "[object Object]";
    var fnClass = "[object Function]";
    var genClass = "[object GeneratorFunction]";
    var ddaClass = "[object HTMLAllCollection]";
    var ddaClass2 = "[object HTML document.all class]";
    var ddaClass3 = "[object HTMLCollection]";
    var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
    var isIE68 = !(0 in [,]);
    var isDDA = function isDocumentDotAll() {
      return false;
    };
    if (typeof document === "object") {
      all = document.all;
      if (toStr.call(all) === toStr.call(document.all)) {
        isDDA = function isDocumentDotAll(value) {
          if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) {
            try {
              var str = toStr.call(value);
              return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
            } catch (e) {
            }
          }
          return false;
        };
      }
    }
    var all;
    module2.exports = reflectApply ? function isCallable(value) {
      if (isDDA(value)) {
        return true;
      }
      if (!value) {
        return false;
      }
      if (typeof value !== "function" && typeof value !== "object") {
        return false;
      }
      try {
        reflectApply(value, null, badArrayLike);
      } catch (e) {
        if (e !== isCallableMarker) {
          return false;
        }
      }
      return !isES6ClassFn(value) && tryFunctionObject(value);
    } : function isCallable(value) {
      if (isDDA(value)) {
        return true;
      }
      if (!value) {
        return false;
      }
      if (typeof value !== "function" && typeof value !== "object") {
        return false;
      }
      if (hasToStringTag) {
        return tryFunctionObject(value);
      }
      if (isES6ClassFn(value)) {
        return false;
      }
      var strClass = toStr.call(value);
      if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) {
        return false;
      }
      return tryFunctionObject(value);
    };
  }
});

// node_modules/promiseback/index.js
var require_promiseback = __commonJS({
  "node_modules/promiseback/index.js"(exports, module2) {
    "use strict";
    var Deferred = require_promise_deferred();
    var Promise2 = Deferred.Promise;
    var isCallable = require_is_callable();
    module2.exports = function promiseback() {
      var promise, callback;
      if (arguments.length > 1) {
        promise = Promise2.resolve(arguments[0]);
        callback = arguments[1];
      } else if (arguments.length > 0) {
        callback = arguments[0];
      }
      var callbackIsFn = isCallable(callback);
      if (callback != null && !callbackIsFn) {
        throw new TypeError("callback must be a function if present");
      }
      var promisebacked = new Deferred();
      if (callbackIsFn) {
        promisebacked.promise.then(
          function(v) {
            callback(null, v);
          },
          function(e) {
            callback(e);
          }
        );
      }
      if (promise) {
        promise.then(promisebacked.resolve, promisebacked.reject);
      }
      return promise ? promisebacked.promise : promisebacked;
    };
    module2.exports.Deferred = Deferred;
  }
});

// node_modules/safer-buffer/safer.js
var require_safer = __commonJS({
  "node_modules/safer-buffer/safer.js"(exports, module2) {
    "use strict";
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    var safer = {};
    var key;
    for (key in buffer) {
      if (!buffer.hasOwnProperty(key))
        continue;
      if (key === "SlowBuffer" || key === "Buffer")
        continue;
      safer[key] = buffer[key];
    }
    var Safer = safer.Buffer = {};
    for (key in Buffer2) {
      if (!Buffer2.hasOwnProperty(key))
        continue;
      if (key === "allocUnsafe" || key === "allocUnsafeSlow")
        continue;
      Safer[key] = Buffer2[key];
    }
    safer.Buffer.prototype = Buffer2.prototype;
    if (!Safer.from || Safer.from === Uint8Array.from) {
      Safer.from = function(value, encodingOrOffset, length) {
        if (typeof value === "number") {
          throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value);
        }
        if (value && typeof value.length === "undefined") {
          throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
        }
        return Buffer2(value, encodingOrOffset, length);
      };
    }
    if (!Safer.alloc) {
      Safer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size);
        }
        if (size < 0 || size >= 2 * (1 << 30)) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
        var buf = Buffer2(size);
        if (!fill || fill.length === 0) {
          buf.fill(0);
        } else if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
        return buf;
      };
    }
    if (!safer.kStringMaxLength) {
      try {
        safer.kStringMaxLength = process.binding("buffer").kStringMaxLength;
      } catch (e) {
      }
    }
    if (!safer.constants) {
      safer.constants = {
        MAX_LENGTH: safer.kMaxLength
      };
      if (safer.kStringMaxLength) {
        safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
      }
    }
    module2.exports = safer;
  }
});

// node_modules/json-file-plus/index.js
var require_json_file_plus = __commonJS({
  "node_modules/json-file-plus/index.js"(exports, module2) {
    "use strict";
    var fs6 = require("fs");
    var path4 = require("path");
    var extend = require_node();
    var assign = require_object();
    var is = require_is();
    var promiseback = require_promiseback();
    var Promise2 = promiseback.Deferred.Promise;
    var Buffer2 = require_safer().Buffer;
    var checkKey = function checkKey2(key) {
      if ((typeof key !== "string" || key.length === 0) && typeof key !== "symbol") {
        throw new TypeError("key must be a Symbol, or a nonempty string");
      }
    };
    var JSONData = function JSONData2(raw) {
      var hasTrailingNewline = /\n\n$/.test(raw);
      var indentMatch = String(raw).match(/^[ \t]+/m);
      var indent = indentMatch ? indentMatch[0] : 2;
      this.format = {
        indent,
        trailing: hasTrailingNewline
      };
      if (raw) {
        this.data = JSON.parse(raw);
      }
    };
    JSONData.prototype.get = function(key, callback) {
      var data = assign({}, this.data);
      if (is.fn(key)) {
        callback = key;
        key = null;
      }
      var value = key ? data[key] : data;
      if (is.hash(value)) {
        value = assign({}, value);
      }
      var deferred = promiseback(callback);
      deferred.resolve(value);
      return deferred.promise;
    };
    JSONData.prototype.set = function(obj) {
      if (!is.hash(obj)) {
        throw new TypeError("object must be a plain object");
      }
      extend(true, this.data, obj);
    };
    JSONData.prototype.remove = function(key, callback) {
      var data = this.data;
      var deletion = Promise2.resolve().then(function() {
        checkKey(key);
        var status = delete data[key];
        if (!status) {
          return Promise2.reject(new Error("deletion failed"));
        }
        return void 0;
      });
      return promiseback(deletion, callback);
    };
    JSONData.prototype.stringify = function stringify() {
      var endingNewlines = this.format.trailing ? "\n\n" : "\n";
      var indent = this.format.indent || 2;
      return Buffer2.from(JSON.stringify(this.data, null, indent) + endingNewlines);
    };
    var JSONFile2 = function JSONFile3(filename, raw) {
      JSONData.call(this, raw);
      this.filename = filename;
    };
    JSONFile2.prototype = new JSONData();
    JSONFile2.prototype.save = function(callback) {
      var deferred = promiseback(callback);
      fs6.writeFile(this.filename, this.stringify(), function(err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
      });
      return deferred.promise;
    };
    JSONFile2.prototype.saveSync = function() {
      fs6.writeFileSync(this.filename, this.stringify());
    };
    var readJSON = function readJSON2(filename) {
      var callback;
      if (arguments.length > 1) {
        callback = arguments[1];
        if (!is.fn(callback)) {
          throw new TypeError("callback must be a function if provided");
        }
      }
      var deferred = promiseback(callback);
      fs6.readFile(path4.resolve(filename), { encoding: "utf8" }, function(err, raw) {
        var file;
        if (err) {
          deferred.reject(err);
        } else {
          try {
            file = new JSONFile2(filename, raw);
            deferred.resolve(file);
          } catch (e) {
            deferred.reject(e);
          }
        }
      });
      return deferred.promise;
    };
    var readJSONSync = function readJSONSync2(filename) {
      var raw = fs6.readFileSync(filename, "utf8");
      return new JSONFile2(filename, raw);
    };
    readJSON.sync = readJSONSync;
    readJSON.JSONFile = JSONFile2;
    readJSON.JSONData = JSONData;
    module2.exports = readJSON;
  }
});

// node_modules/picomatch/lib/constants.js
var require_constants = __commonJS({
  "node_modules/picomatch/lib/constants.js"(exports, module2) {
    "use strict";
    var path4 = require("path");
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
    };
    var POSIX_REGEX_SOURCE = {
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      SEP: path4.sep,
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// node_modules/picomatch/lib/utils.js
var require_utils = __commonJS({
  "node_modules/picomatch/lib/utils.js"(exports) {
    "use strict";
    var path4 = require("path");
    var win32 = process.platform === "win32";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants();
    exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
    exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
        return true;
      }
      return false;
    };
    exports.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win32 === true || path4.sep === "\\";
    };
    exports.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1)
        return input;
      if (input[idx - 1] === "\\")
        return exports.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  }
});

// node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "node_modules/picomatch/lib/scan.js"(exports, module2) {
    "use strict";
    var utils = require_utils();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true)
            continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK)
            isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
          }
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob)
          glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value = input.slice(n, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts.push(value);
          }
          prevIndex = i;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// node_modules/picomatch/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/picomatch/lib/parse.js"(exports, module2) {
    "use strict";
    var constants = require_constants();
    var utils = require_utils();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args2, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args2, options);
      }
      args2.sort();
      const value = `[${args2.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args2.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var parse2 = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const win32 = utils.isWindows(options);
      const PLATFORM_CHARS = constants.globChars(win32);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index];
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push2 = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren" && !EXTGLOB_CHARS[tok.value]) {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output)
          append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.value += tok.value;
          prev.output = (prev.output || "") + tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push2({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push2({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        let output = token.close + (opts.capture ? ")" : "");
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.prev.type === "bos" && eos()) {
            state.negatedExtglob = true;
          }
        }
        push2({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push2({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance() || "";
          } else {
            value += advance() || "";
          }
          if (state.brackets === 0) {
            push2({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push2({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push2({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push2({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push2({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push2({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push2({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push2(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push2({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push2({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push2({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push2({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push2({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".")
              prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push2({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push2({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (next === "<" && !utils.supportsLookbehinds()) {
              throw new Error("Node.js v10 or higher is required for regex lookbehinds");
            }
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push2({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push2({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push2({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push2({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push2({ type: "plus", value });
            continue;
          }
          push2({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push2({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push2({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push2({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push2({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push2({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push2({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push2({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push2(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push2(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push2(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push2({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse2.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const win32 = utils.isWindows(options);
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(win32);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true)
          return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match)
              return;
            const source2 = create(match[1]);
            if (!source2)
              return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse2;
  }
});

// node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "node_modules/picomatch/lib/picomatch.js"(exports, module2) {
    "use strict";
    var path4 = require("path");
    var scan = require_scan();
    var parse2 = require_parse2();
    var utils = require_utils();
    var constants = require_constants();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2)
              return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = utils.isWindows(options);
      const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch.test = (input, regex, options, { glob, posix } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch.matchBase(input, regex, options, posix);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
      const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
      return regex.test(path4.basename(input));
    };
    picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    picomatch.parse = (pattern, options) => {
      if (Array.isArray(pattern))
        return pattern.map((p) => picomatch.parse(p, options));
      return parse2(pattern, { ...options, fastpaths: false });
    };
    picomatch.scan = (input, options) => scan(input, options);
    picomatch.compileRe = (parsed, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return parsed.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${parsed.output})${append}`;
      if (parsed && parsed.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch.toRegex(source, options);
      if (returnState === true) {
        regex.state = parsed;
      }
      return regex;
    };
    picomatch.makeRe = (input, options, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      const opts = options || {};
      let parsed = { negated: false, fastpaths: true };
      let prefix = "";
      let output;
      if (input.startsWith("./")) {
        input = input.slice(2);
        prefix = parsed.prefix = "./";
      }
      if (opts.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        output = parse2.fastpaths(input, options);
      }
      if (output === void 0) {
        parsed = parse2(input, options);
        parsed.prefix = prefix + (parsed.prefix || "");
      } else {
        parsed.output = output;
      }
      return picomatch.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err) {
        if (options && options.debug === true)
          throw err;
        return /$^/;
      }
    };
    picomatch.constants = constants;
    module2.exports = picomatch;
  }
});

// node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "node_modules/picomatch/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_picomatch();
  }
});

// node_modules/readdirp/index.js
var require_readdirp = __commonJS({
  "node_modules/readdirp/index.js"(exports, module2) {
    "use strict";
    var fs6 = require("fs");
    var { Readable } = require("stream");
    var sysPath = require("path");
    var { promisify } = require("util");
    var picomatch = require_picomatch2();
    var readdir = promisify(fs6.readdir);
    var stat = promisify(fs6.stat);
    var lstat = promisify(fs6.lstat);
    var realpath = promisify(fs6.realpath);
    var BANG = "!";
    var NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP"]);
    var FILE_TYPE = "files";
    var DIR_TYPE = "directories";
    var FILE_DIR_TYPE = "files_directories";
    var EVERYTHING_TYPE = "all";
    var ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];
    var isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
    var normalizeFilter = (filter) => {
      if (filter === void 0)
        return;
      if (typeof filter === "function")
        return filter;
      if (typeof filter === "string") {
        const glob = picomatch(filter.trim());
        return (entry) => glob(entry.basename);
      }
      if (Array.isArray(filter)) {
        const positive = [];
        const negative = [];
        for (const item of filter) {
          const trimmed = item.trim();
          if (trimmed.charAt(0) === BANG) {
            negative.push(picomatch(trimmed.slice(1)));
          } else {
            positive.push(picomatch(trimmed));
          }
        }
        if (negative.length > 0) {
          if (positive.length > 0) {
            return (entry) => positive.some((f) => f(entry.basename)) && !negative.some((f) => f(entry.basename));
          }
          return (entry) => !negative.some((f) => f(entry.basename));
        }
        return (entry) => positive.some((f) => f(entry.basename));
      }
    };
    var ReaddirpStream = class extends Readable {
      static get defaultOptions() {
        return {
          root: ".",
          /* eslint-disable no-unused-vars */
          fileFilter: (path4) => true,
          directoryFilter: (path4) => true,
          /* eslint-enable no-unused-vars */
          type: FILE_TYPE,
          lstat: false,
          depth: 2147483648,
          alwaysStat: false
        };
      }
      constructor(options = {}) {
        super({
          objectMode: true,
          autoDestroy: true,
          highWaterMark: options.highWaterMark || 4096
        });
        const opts = { ...ReaddirpStream.defaultOptions, ...options };
        const { root, type } = opts;
        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        const statMethod = opts.lstat ? lstat : stat;
        if (process.platform === "win32" && stat.length === 3) {
          this._stat = (path4) => statMethod(path4, { bigint: true });
        } else {
          this._stat = statMethod;
        }
        this._maxDepth = opts.depth;
        this._wantsDir = [DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
        this._wantsFile = [FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
        this._wantsEverything = type === EVERYTHING_TYPE;
        this._root = sysPath.resolve(root);
        this._isDirent = "Dirent" in fs6 && !opts.alwaysStat;
        this._statsProp = this._isDirent ? "dirent" : "stats";
        this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
        this.parents = [this._exploreDir(root, 1)];
        this.reading = false;
        this.parent = void 0;
      }
      async _read(batch) {
        if (this.reading)
          return;
        this.reading = true;
        try {
          while (!this.destroyed && batch > 0) {
            const { path: path4, depth, files = [] } = this.parent || {};
            if (files.length > 0) {
              const slice = files.splice(0, batch).map((dirent) => this._formatEntry(dirent, path4));
              for (const entry of await Promise.all(slice)) {
                if (this.destroyed)
                  return;
                const entryType = await this._getEntryType(entry);
                if (entryType === "directory" && this._directoryFilter(entry)) {
                  if (depth <= this._maxDepth) {
                    this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                  }
                  if (this._wantsDir) {
                    this.push(entry);
                    batch--;
                  }
                } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                  if (this._wantsFile) {
                    this.push(entry);
                    batch--;
                  }
                }
              }
            } else {
              const parent = this.parents.pop();
              if (!parent) {
                this.push(null);
                break;
              }
              this.parent = await parent;
              if (this.destroyed)
                return;
            }
          }
        } catch (error) {
          this.destroy(error);
        } finally {
          this.reading = false;
        }
      }
      async _exploreDir(path4, depth) {
        let files;
        try {
          files = await readdir(path4, this._rdOptions);
        } catch (error) {
          this._onError(error);
        }
        return { files, depth, path: path4 };
      }
      async _formatEntry(dirent, path4) {
        let entry;
        try {
          const basename5 = this._isDirent ? dirent.name : dirent;
          const fullPath = sysPath.resolve(sysPath.join(path4, basename5));
          entry = { path: sysPath.relative(this._root, fullPath), fullPath, basename: basename5 };
          entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
        } catch (err) {
          this._onError(err);
        }
        return entry;
      }
      _onError(err) {
        if (isNormalFlowError(err) && !this.destroyed) {
          this.emit("warn", err);
        } else {
          this.destroy(err);
        }
      }
      async _getEntryType(entry) {
        const stats = entry && entry[this._statsProp];
        if (!stats) {
          return;
        }
        if (stats.isFile()) {
          return "file";
        }
        if (stats.isDirectory()) {
          return "directory";
        }
        if (stats && stats.isSymbolicLink()) {
          const full = entry.fullPath;
          try {
            const entryRealPath = await realpath(full);
            const entryRealPathStats = await lstat(entryRealPath);
            if (entryRealPathStats.isFile()) {
              return "file";
            }
            if (entryRealPathStats.isDirectory()) {
              const len = entryRealPath.length;
              if (full.startsWith(entryRealPath) && full.substr(len, 1) === sysPath.sep) {
                return this._onError(new Error(
                  `Circular symlink detected: "${full}" points to "${entryRealPath}"`
                ));
              }
              return "directory";
            }
          } catch (error) {
            this._onError(error);
          }
        }
      }
      _includeAsFile(entry) {
        const stats = entry && entry[this._statsProp];
        return stats && this._wantsEverything && !stats.isDirectory();
      }
    };
    var readdirp = (root, options = {}) => {
      let type = options.entryType || options.type;
      if (type === "both")
        type = FILE_DIR_TYPE;
      if (type)
        options.type = type;
      if (!root) {
        throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
      } else if (typeof root !== "string") {
        throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
      } else if (type && !ALL_TYPES.includes(type)) {
        throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
      }
      options.root = root;
      return new ReaddirpStream(options);
    };
    var readdirpPromise = (root, options = {}) => {
      return new Promise((resolve2, reject) => {
        const files = [];
        readdirp(root, options).on("data", (entry) => files.push(entry)).on("end", () => resolve2(files)).on("error", (error) => reject(error));
      });
    };
    readdirp.promise = readdirpPromise;
    readdirp.ReaddirpStream = ReaddirpStream;
    readdirp.default = readdirp;
    module2.exports = readdirp;
  }
});

// node_modules/normalize-path/index.js
var require_normalize_path = __commonJS({
  "node_modules/normalize-path/index.js"(exports, module2) {
    module2.exports = function(path4, stripTrailing) {
      if (typeof path4 !== "string") {
        throw new TypeError("expected path to be a string");
      }
      if (path4 === "\\" || path4 === "/")
        return "/";
      var len = path4.length;
      if (len <= 1)
        return path4;
      var prefix = "";
      if (len > 4 && path4[3] === "\\") {
        var ch = path4[2];
        if ((ch === "?" || ch === ".") && path4.slice(0, 2) === "\\\\") {
          path4 = path4.slice(2);
          prefix = "//";
        }
      }
      var segs = path4.split(/[/\\]+/);
      if (stripTrailing !== false && segs[segs.length - 1] === "") {
        segs.pop();
      }
      return prefix + segs.join("/");
    };
  }
});

// node_modules/anymatch/index.js
var require_anymatch = __commonJS({
  "node_modules/anymatch/index.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var picomatch = require_picomatch2();
    var normalizePath = require_normalize_path();
    var BANG = "!";
    var DEFAULT_OPTIONS = { returnIndex: false };
    var arrify = (item) => Array.isArray(item) ? item : [item];
    var createPattern = (matcher, options) => {
      if (typeof matcher === "function") {
        return matcher;
      }
      if (typeof matcher === "string") {
        const glob = picomatch(matcher, options);
        return (string) => matcher === string || glob(string);
      }
      if (matcher instanceof RegExp) {
        return (string) => matcher.test(string);
      }
      return (string) => false;
    };
    var matchPatterns = (patterns, negPatterns, args2, returnIndex) => {
      const isList = Array.isArray(args2);
      const _path = isList ? args2[0] : args2;
      if (!isList && typeof _path !== "string") {
        throw new TypeError("anymatch: second argument must be a string: got " + Object.prototype.toString.call(_path));
      }
      const path4 = normalizePath(_path);
      for (let index = 0; index < negPatterns.length; index++) {
        const nglob = negPatterns[index];
        if (nglob(path4)) {
          return returnIndex ? -1 : false;
        }
      }
      const applied = isList && [path4].concat(args2.slice(1));
      for (let index = 0; index < patterns.length; index++) {
        const pattern = patterns[index];
        if (isList ? pattern(...applied) : pattern(path4)) {
          return returnIndex ? index : true;
        }
      }
      return returnIndex ? -1 : false;
    };
    var anymatch = (matchers, testString, options = DEFAULT_OPTIONS) => {
      if (matchers == null) {
        throw new TypeError("anymatch: specify first argument");
      }
      const opts = typeof options === "boolean" ? { returnIndex: options } : options;
      const returnIndex = opts.returnIndex || false;
      const mtchers = arrify(matchers);
      const negatedGlobs = mtchers.filter((item) => typeof item === "string" && item.charAt(0) === BANG).map((item) => item.slice(1)).map((item) => picomatch(item, opts));
      const patterns = mtchers.map((matcher) => createPattern(matcher, opts));
      if (testString == null) {
        return (testString2, ri = false) => {
          const returnIndex2 = typeof ri === "boolean" ? ri : false;
          return matchPatterns(patterns, negatedGlobs, testString2, returnIndex2);
        };
      }
      return matchPatterns(patterns, negatedGlobs, testString, returnIndex);
    };
    anymatch.default = anymatch;
    module2.exports = anymatch;
  }
});

// node_modules/is-extglob/index.js
var require_is_extglob = __commonJS({
  "node_modules/is-extglob/index.js"(exports, module2) {
    module2.exports = function isExtglob(str) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      var match;
      while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
        if (match[2])
          return true;
        str = str.slice(match.index + match[0].length);
      }
      return false;
    };
  }
});

// node_modules/is-glob/index.js
var require_is_glob = __commonJS({
  "node_modules/is-glob/index.js"(exports, module2) {
    var isExtglob = require_is_extglob();
    var chars = { "{": "}", "(": ")", "[": "]" };
    var strictRegex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    var relaxedRegex = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;
    module2.exports = function isGlob(str, options) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      if (isExtglob(str)) {
        return true;
      }
      var regex = strictRegex;
      var match;
      if (options && options.strict === false) {
        regex = relaxedRegex;
      }
      while (match = regex.exec(str)) {
        if (match[2])
          return true;
        var idx = match.index + match[0].length;
        var open = match[1];
        var close = open ? chars[open] : null;
        if (open && close) {
          var n = str.indexOf(close, idx);
          if (n !== -1) {
            idx = n + 1;
          }
        }
        str = str.slice(idx);
      }
      return false;
    };
  }
});

// node_modules/glob-parent/index.js
var require_glob_parent = __commonJS({
  "node_modules/glob-parent/index.js"(exports, module2) {
    "use strict";
    var isGlob = require_is_glob();
    var pathPosixDirname = require("path").posix.dirname;
    var isWin32 = require("os").platform() === "win32";
    var slash = "/";
    var backslash = /\\/g;
    var enclosure = /[\{\[].*[\/]*.*[\}\]]$/;
    var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
    var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
    module2.exports = function globParent(str, opts) {
      var options = Object.assign({ flipBackslashes: true }, opts);
      if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
        str = str.replace(backslash, slash);
      }
      if (enclosure.test(str)) {
        str += slash;
      }
      str += "a";
      do {
        str = pathPosixDirname(str);
      } while (isGlob(str) || globby.test(str));
      return str.replace(escaped, "$1");
    };
  }
});

// node_modules/braces/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/braces/lib/utils.js"(exports) {
    "use strict";
    exports.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };
    exports.find = (node, type) => node.nodes.find((node2) => node2.type === type);
    exports.exceedsLimit = (min, max, step = 1, limit) => {
      if (limit === false)
        return false;
      if (!exports.isInteger(min) || !exports.isInteger(max))
        return false;
      return (Number(max) - Number(min)) / Number(step) >= limit;
    };
    exports.escapeNode = (block, n = 0, type) => {
      let node = block.nodes[n];
      if (!node)
        return;
      if (type && node.type === type || node.type === "open" || node.type === "close") {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };
    exports.encloseBrace = (node) => {
      if (node.type !== "brace")
        return false;
      if (node.commas >> 0 + node.ranges >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };
    exports.isInvalidBrace = (block) => {
      if (block.type !== "brace")
        return false;
      if (block.invalid === true || block.dollar)
        return true;
      if (block.commas >> 0 + block.ranges >> 0 === 0) {
        block.invalid = true;
        return true;
      }
      if (block.open !== true || block.close !== true) {
        block.invalid = true;
        return true;
      }
      return false;
    };
    exports.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };
    exports.reduce = (nodes) => nodes.reduce((acc, node) => {
      if (node.type === "text")
        acc.push(node.value);
      if (node.type === "range")
        node.type = "text";
      return acc;
    }, []);
    exports.flatten = (...args2) => {
      const result = [];
      const flat = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          let ele = arr[i];
          Array.isArray(ele) ? flat(ele, result) : ele !== void 0 && result.push(ele);
        }
        return result;
      };
      flat(args2);
      return result;
    };
  }
});

// node_modules/braces/lib/stringify.js
var require_stringify2 = __commonJS({
  "node_modules/braces/lib/stringify.js"(exports, module2) {
    "use strict";
    var utils = require_utils2();
    module2.exports = (ast, options = {}) => {
      let stringify = (node, parent = {}) => {
        let invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
        let invalidNode = node.invalid === true && options.escapeInvalid === true;
        let output = "";
        if (node.value) {
          if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
            return "\\" + node.value;
          }
          return node.value;
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes) {
          for (let child of node.nodes) {
            output += stringify(child);
          }
        }
        return output;
      };
      return stringify(ast);
    };
  }
});

// node_modules/is-number/index.js
var require_is_number = __commonJS({
  "node_modules/is-number/index.js"(exports, module2) {
    "use strict";
    module2.exports = function(num) {
      if (typeof num === "number") {
        return num - num === 0;
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
      }
      return false;
    };
  }
});

// node_modules/to-regex-range/index.js
var require_to_regex_range = __commonJS({
  "node_modules/to-regex-range/index.js"(exports, module2) {
    "use strict";
    var isNumber = require_is_number();
    var toRegexRange = (min, max, options) => {
      if (isNumber(min) === false) {
        throw new TypeError("toRegexRange: expected the first argument to be a number");
      }
      if (max === void 0 || min === max) {
        return String(min);
      }
      if (isNumber(max) === false) {
        throw new TypeError("toRegexRange: expected the second argument to be a number.");
      }
      let opts = { relaxZeros: true, ...options };
      if (typeof opts.strictZeros === "boolean") {
        opts.relaxZeros = opts.strictZeros === false;
      }
      let relax = String(opts.relaxZeros);
      let shorthand = String(opts.shorthand);
      let capture = String(opts.capture);
      let wrap = String(opts.wrap);
      let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;
      if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
        return toRegexRange.cache[cacheKey].result;
      }
      let a = Math.min(min, max);
      let b = Math.max(min, max);
      if (Math.abs(a - b) === 1) {
        let result = min + "|" + max;
        if (opts.capture) {
          return `(${result})`;
        }
        if (opts.wrap === false) {
          return result;
        }
        return `(?:${result})`;
      }
      let isPadded = hasPadding(min) || hasPadding(max);
      let state = { min, max, a, b };
      let positives = [];
      let negatives = [];
      if (isPadded) {
        state.isPadded = isPadded;
        state.maxLen = String(state.max).length;
      }
      if (a < 0) {
        let newMin = b < 0 ? Math.abs(b) : 1;
        negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
        a = state.a = 0;
      }
      if (b >= 0) {
        positives = splitToPatterns(a, b, state, opts);
      }
      state.negatives = negatives;
      state.positives = positives;
      state.result = collatePatterns(negatives, positives, opts);
      if (opts.capture === true) {
        state.result = `(${state.result})`;
      } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
        state.result = `(?:${state.result})`;
      }
      toRegexRange.cache[cacheKey] = state;
      return state.result;
    };
    function collatePatterns(neg, pos, options) {
      let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
      let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
      let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
      let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
      return subpatterns.join("|");
    }
    function splitToRanges(min, max) {
      let nines = 1;
      let zeros = 1;
      let stop = countNines(min, nines);
      let stops = /* @__PURE__ */ new Set([max]);
      while (min <= stop && stop <= max) {
        stops.add(stop);
        nines += 1;
        stop = countNines(min, nines);
      }
      stop = countZeros(max + 1, zeros) - 1;
      while (min < stop && stop <= max) {
        stops.add(stop);
        zeros += 1;
        stop = countZeros(max + 1, zeros) - 1;
      }
      stops = [...stops];
      stops.sort(compare);
      return stops;
    }
    function rangeToPattern(start, stop, options) {
      if (start === stop) {
        return { pattern: start, count: [], digits: 0 };
      }
      let zipped = zip2(start, stop);
      let digits = zipped.length;
      let pattern = "";
      let count = 0;
      for (let i = 0; i < digits; i++) {
        let [startDigit, stopDigit] = zipped[i];
        if (startDigit === stopDigit) {
          pattern += startDigit;
        } else if (startDigit !== "0" || stopDigit !== "9") {
          pattern += toCharacterClass(startDigit, stopDigit, options);
        } else {
          count++;
        }
      }
      if (count) {
        pattern += options.shorthand === true ? "\\d" : "[0-9]";
      }
      return { pattern, count: [count], digits };
    }
    function splitToPatterns(min, max, tok, options) {
      let ranges = splitToRanges(min, max);
      let tokens = [];
      let start = min;
      let prev;
      for (let i = 0; i < ranges.length; i++) {
        let max2 = ranges[i];
        let obj = rangeToPattern(String(start), String(max2), options);
        let zeros = "";
        if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
          if (prev.count.length > 1) {
            prev.count.pop();
          }
          prev.count.push(obj.count[0]);
          prev.string = prev.pattern + toQuantifier(prev.count);
          start = max2 + 1;
          continue;
        }
        if (tok.isPadded) {
          zeros = padZeros(max2, tok, options);
        }
        obj.string = zeros + obj.pattern + toQuantifier(obj.count);
        tokens.push(obj);
        start = max2 + 1;
        prev = obj;
      }
      return tokens;
    }
    function filterPatterns(arr, comparison, prefix, intersection, options) {
      let result = [];
      for (let ele of arr) {
        let { string } = ele;
        if (!intersection && !contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
        if (intersection && contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
      }
      return result;
    }
    function zip2(a, b) {
      let arr = [];
      for (let i = 0; i < a.length; i++)
        arr.push([a[i], b[i]]);
      return arr;
    }
    function compare(a, b) {
      return a > b ? 1 : b > a ? -1 : 0;
    }
    function contains(arr, key, val) {
      return arr.some((ele) => ele[key] === val);
    }
    function countNines(min, len) {
      return Number(String(min).slice(0, -len) + "9".repeat(len));
    }
    function countZeros(integer, zeros) {
      return integer - integer % Math.pow(10, zeros);
    }
    function toQuantifier(digits) {
      let [start = 0, stop = ""] = digits;
      if (stop || start > 1) {
        return `{${start + (stop ? "," + stop : "")}}`;
      }
      return "";
    }
    function toCharacterClass(a, b, options) {
      return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
    }
    function hasPadding(str) {
      return /^-?(0+)\d/.test(str);
    }
    function padZeros(value, tok, options) {
      if (!tok.isPadded) {
        return value;
      }
      let diff = Math.abs(tok.maxLen - String(value).length);
      let relax = options.relaxZeros !== false;
      switch (diff) {
        case 0:
          return "";
        case 1:
          return relax ? "0?" : "0";
        case 2:
          return relax ? "0{0,2}" : "00";
        default: {
          return relax ? `0{0,${diff}}` : `0{${diff}}`;
        }
      }
    }
    toRegexRange.cache = {};
    toRegexRange.clearCache = () => toRegexRange.cache = {};
    module2.exports = toRegexRange;
  }
});

// node_modules/fill-range/index.js
var require_fill_range = __commonJS({
  "node_modules/fill-range/index.js"(exports, module2) {
    "use strict";
    var util = require("util");
    var toRegexRange = require_to_regex_range();
    var isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    var transform = (toNumber) => {
      return (value) => toNumber === true ? Number(value) : String(value);
    };
    var isValidValue = (value) => {
      return typeof value === "number" || typeof value === "string" && value !== "";
    };
    var isNumber = (num) => Number.isInteger(+num);
    var zeros = (input) => {
      let value = `${input}`;
      let index = -1;
      if (value[0] === "-")
        value = value.slice(1);
      if (value === "0")
        return false;
      while (value[++index] === "0")
        ;
      return index > 0;
    };
    var stringify = (start, end, options) => {
      if (typeof start === "string" || typeof end === "string") {
        return true;
      }
      return options.stringify === true;
    };
    var pad = (input, maxLength, toNumber) => {
      if (maxLength > 0) {
        let dash = input[0] === "-" ? "-" : "";
        if (dash)
          input = input.slice(1);
        input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
      }
      if (toNumber === false) {
        return String(input);
      }
      return input;
    };
    var toMaxLen = (input, maxLength) => {
      let negative = input[0] === "-" ? "-" : "";
      if (negative) {
        input = input.slice(1);
        maxLength--;
      }
      while (input.length < maxLength)
        input = "0" + input;
      return negative ? "-" + input : input;
    };
    var toSequence = (parts, options) => {
      parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      let prefix = options.capture ? "" : "?:";
      let positives = "";
      let negatives = "";
      let result;
      if (parts.positives.length) {
        positives = parts.positives.join("|");
      }
      if (parts.negatives.length) {
        negatives = `-(${prefix}${parts.negatives.join("|")})`;
      }
      if (positives && negatives) {
        result = `${positives}|${negatives}`;
      } else {
        result = positives || negatives;
      }
      if (options.wrap) {
        return `(${prefix}${result})`;
      }
      return result;
    };
    var toRange = (a, b, isNumbers, options) => {
      if (isNumbers) {
        return toRegexRange(a, b, { wrap: false, ...options });
      }
      let start = String.fromCharCode(a);
      if (a === b)
        return start;
      let stop = String.fromCharCode(b);
      return `[${start}-${stop}]`;
    };
    var toRegex = (start, end, options) => {
      if (Array.isArray(start)) {
        let wrap = options.wrap === true;
        let prefix = options.capture ? "" : "?:";
        return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
      }
      return toRegexRange(start, end, options);
    };
    var rangeError = (...args2) => {
      return new RangeError("Invalid range arguments: " + util.inspect(...args2));
    };
    var invalidRange = (start, end, options) => {
      if (options.strictRanges === true)
        throw rangeError([start, end]);
      return [];
    };
    var invalidStep = (step, options) => {
      if (options.strictRanges === true) {
        throw new TypeError(`Expected step "${step}" to be a number`);
      }
      return [];
    };
    var fillNumbers = (start, end, step = 1, options = {}) => {
      let a = Number(start);
      let b = Number(end);
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        if (options.strictRanges === true)
          throw rangeError([start, end]);
        return [];
      }
      if (a === 0)
        a = 0;
      if (b === 0)
        b = 0;
      let descending = a > b;
      let startString = String(start);
      let endString = String(end);
      let stepString = String(step);
      step = Math.max(Math.abs(step), 1);
      let padded = zeros(startString) || zeros(endString) || zeros(stepString);
      let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
      let toNumber = padded === false && stringify(start, end, options) === false;
      let format = options.transform || transform(toNumber);
      if (options.toRegex && step === 1) {
        return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
      }
      let parts = { negatives: [], positives: [] };
      let push2 = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        if (options.toRegex === true && step > 1) {
          push2(a);
        } else {
          range.push(pad(format(a, index), maxLen, toNumber));
        }
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return step > 1 ? toSequence(parts, options) : toRegex(range, null, { wrap: false, ...options });
      }
      return range;
    };
    var fillLetters = (start, end, step = 1, options = {}) => {
      if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) {
        return invalidRange(start, end, options);
      }
      let format = options.transform || ((val) => String.fromCharCode(val));
      let a = `${start}`.charCodeAt(0);
      let b = `${end}`.charCodeAt(0);
      let descending = a > b;
      let min = Math.min(a, b);
      let max = Math.max(a, b);
      if (options.toRegex && step === 1) {
        return toRange(min, max, false, options);
      }
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        range.push(format(a, index));
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return toRegex(range, null, { wrap: false, options });
      }
      return range;
    };
    var fill = (start, end, step, options = {}) => {
      if (end == null && isValidValue(start)) {
        return [start];
      }
      if (!isValidValue(start) || !isValidValue(end)) {
        return invalidRange(start, end, options);
      }
      if (typeof step === "function") {
        return fill(start, end, 1, { transform: step });
      }
      if (isObject(step)) {
        return fill(start, end, 0, step);
      }
      let opts = { ...options };
      if (opts.capture === true)
        opts.wrap = true;
      step = step || opts.step || 1;
      if (!isNumber(step)) {
        if (step != null && !isObject(step))
          return invalidStep(step, opts);
        return fill(start, end, 1, step);
      }
      if (isNumber(start) && isNumber(end)) {
        return fillNumbers(start, end, step, opts);
      }
      return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
    };
    module2.exports = fill;
  }
});

// node_modules/braces/lib/compile.js
var require_compile = __commonJS({
  "node_modules/braces/lib/compile.js"(exports, module2) {
    "use strict";
    var fill = require_fill_range();
    var utils = require_utils2();
    var compile = (ast, options = {}) => {
      let walk = (node, parent = {}) => {
        let invalidBlock = utils.isInvalidBrace(parent);
        let invalidNode = node.invalid === true && options.escapeInvalid === true;
        let invalid = invalidBlock === true || invalidNode === true;
        let prefix = options.escapeInvalid === true ? "\\" : "";
        let output = "";
        if (node.isOpen === true) {
          return prefix + node.value;
        }
        if (node.isClose === true) {
          return prefix + node.value;
        }
        if (node.type === "open") {
          return invalid ? prefix + node.value : "(";
        }
        if (node.type === "close") {
          return invalid ? prefix + node.value : ")";
        }
        if (node.type === "comma") {
          return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes && node.ranges > 0) {
          let args2 = utils.reduce(node.nodes);
          let range = fill(...args2, { ...options, wrap: false, toRegex: true });
          if (range.length !== 0) {
            return args2.length > 1 && range.length > 1 ? `(${range})` : range;
          }
        }
        if (node.nodes) {
          for (let child of node.nodes) {
            output += walk(child, node);
          }
        }
        return output;
      };
      return walk(ast);
    };
    module2.exports = compile;
  }
});

// node_modules/braces/lib/expand.js
var require_expand = __commonJS({
  "node_modules/braces/lib/expand.js"(exports, module2) {
    "use strict";
    var fill = require_fill_range();
    var stringify = require_stringify2();
    var utils = require_utils2();
    var append = (queue = "", stash = "", enclose = false) => {
      let result = [];
      queue = [].concat(queue);
      stash = [].concat(stash);
      if (!stash.length)
        return queue;
      if (!queue.length) {
        return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
      }
      for (let item of queue) {
        if (Array.isArray(item)) {
          for (let value of item) {
            result.push(append(value, stash, enclose));
          }
        } else {
          for (let ele of stash) {
            if (enclose === true && typeof ele === "string")
              ele = `{${ele}}`;
            result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
          }
        }
      }
      return utils.flatten(result);
    };
    var expand = (ast, options = {}) => {
      let rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
      let walk = (node, parent = {}) => {
        node.queue = [];
        let p = parent;
        let q = parent.queue;
        while (p.type !== "brace" && p.type !== "root" && p.parent) {
          p = p.parent;
          q = p.queue;
        }
        if (node.invalid || node.dollar) {
          q.push(append(q.pop(), stringify(node, options)));
          return;
        }
        if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
          q.push(append(q.pop(), ["{}"]));
          return;
        }
        if (node.nodes && node.ranges > 0) {
          let args2 = utils.reduce(node.nodes);
          if (utils.exceedsLimit(...args2, options.step, rangeLimit)) {
            throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
          }
          let range = fill(...args2, options);
          if (range.length === 0) {
            range = stringify(node, options);
          }
          q.push(append(q.pop(), range));
          node.nodes = [];
          return;
        }
        let enclose = utils.encloseBrace(node);
        let queue = node.queue;
        let block = node;
        while (block.type !== "brace" && block.type !== "root" && block.parent) {
          block = block.parent;
          queue = block.queue;
        }
        for (let i = 0; i < node.nodes.length; i++) {
          let child = node.nodes[i];
          if (child.type === "comma" && node.type === "brace") {
            if (i === 1)
              queue.push("");
            queue.push("");
            continue;
          }
          if (child.type === "close") {
            q.push(append(q.pop(), queue, enclose));
            continue;
          }
          if (child.value && child.type !== "open") {
            queue.push(append(queue.pop(), child.value));
            continue;
          }
          if (child.nodes) {
            walk(child, node);
          }
        }
        return queue;
      };
      return utils.flatten(walk(ast));
    };
    module2.exports = expand;
  }
});

// node_modules/braces/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/braces/lib/constants.js"(exports, module2) {
    "use strict";
    module2.exports = {
      MAX_LENGTH: 1024 * 64,
      // Digits
      CHAR_0: "0",
      /* 0 */
      CHAR_9: "9",
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: "A",
      /* A */
      CHAR_LOWERCASE_A: "a",
      /* a */
      CHAR_UPPERCASE_Z: "Z",
      /* Z */
      CHAR_LOWERCASE_Z: "z",
      /* z */
      CHAR_LEFT_PARENTHESES: "(",
      /* ( */
      CHAR_RIGHT_PARENTHESES: ")",
      /* ) */
      CHAR_ASTERISK: "*",
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: "&",
      /* & */
      CHAR_AT: "@",
      /* @ */
      CHAR_BACKSLASH: "\\",
      /* \ */
      CHAR_BACKTICK: "`",
      /* ` */
      CHAR_CARRIAGE_RETURN: "\r",
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: "^",
      /* ^ */
      CHAR_COLON: ":",
      /* : */
      CHAR_COMMA: ",",
      /* , */
      CHAR_DOLLAR: "$",
      /* . */
      CHAR_DOT: ".",
      /* . */
      CHAR_DOUBLE_QUOTE: '"',
      /* " */
      CHAR_EQUAL: "=",
      /* = */
      CHAR_EXCLAMATION_MARK: "!",
      /* ! */
      CHAR_FORM_FEED: "\f",
      /* \f */
      CHAR_FORWARD_SLASH: "/",
      /* / */
      CHAR_HASH: "#",
      /* # */
      CHAR_HYPHEN_MINUS: "-",
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: "<",
      /* < */
      CHAR_LEFT_CURLY_BRACE: "{",
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: "[",
      /* [ */
      CHAR_LINE_FEED: "\n",
      /* \n */
      CHAR_NO_BREAK_SPACE: "\xA0",
      /* \u00A0 */
      CHAR_PERCENT: "%",
      /* % */
      CHAR_PLUS: "+",
      /* + */
      CHAR_QUESTION_MARK: "?",
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: ">",
      /* > */
      CHAR_RIGHT_CURLY_BRACE: "}",
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: "]",
      /* ] */
      CHAR_SEMICOLON: ";",
      /* ; */
      CHAR_SINGLE_QUOTE: "'",
      /* ' */
      CHAR_SPACE: " ",
      /*   */
      CHAR_TAB: "	",
      /* \t */
      CHAR_UNDERSCORE: "_",
      /* _ */
      CHAR_VERTICAL_LINE: "|",
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
      /* \uFEFF */
    };
  }
});

// node_modules/braces/lib/parse.js
var require_parse3 = __commonJS({
  "node_modules/braces/lib/parse.js"(exports, module2) {
    "use strict";
    var stringify = require_stringify2();
    var {
      MAX_LENGTH,
      CHAR_BACKSLASH,
      /* \ */
      CHAR_BACKTICK,
      /* ` */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_RIGHT_SQUARE_BRACKET,
      /* ] */
      CHAR_DOUBLE_QUOTE,
      /* " */
      CHAR_SINGLE_QUOTE,
      /* ' */
      CHAR_NO_BREAK_SPACE,
      CHAR_ZERO_WIDTH_NOBREAK_SPACE
    } = require_constants2();
    var parse2 = (input, options = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      let opts = options || {};
      let max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      if (input.length > max) {
        throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
      }
      let ast = { type: "root", input, nodes: [] };
      let stack = [ast];
      let block = ast;
      let prev = ast;
      let brackets = 0;
      let length = input.length;
      let index = 0;
      let depth = 0;
      let value;
      let memo = {};
      const advance = () => input[index++];
      const push2 = (node) => {
        if (node.type === "text" && prev.type === "dot") {
          prev.type = "text";
        }
        if (prev && prev.type === "text" && node.type === "text") {
          prev.value += node.value;
          return;
        }
        block.nodes.push(node);
        node.parent = block;
        node.prev = prev;
        prev = node;
        return node;
      };
      push2({ type: "bos" });
      while (index < length) {
        block = stack[stack.length - 1];
        value = advance();
        if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
          continue;
        }
        if (value === CHAR_BACKSLASH) {
          push2({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
          continue;
        }
        if (value === CHAR_RIGHT_SQUARE_BRACKET) {
          push2({ type: "text", value: "\\" + value });
          continue;
        }
        if (value === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          let closed = true;
          let next;
          while (index < length && (next = advance())) {
            value += next;
            if (next === CHAR_LEFT_SQUARE_BRACKET) {
              brackets++;
              continue;
            }
            if (next === CHAR_BACKSLASH) {
              value += advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              brackets--;
              if (brackets === 0) {
                break;
              }
            }
          }
          push2({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_PARENTHESES) {
          block = push2({ type: "paren", nodes: [] });
          stack.push(block);
          push2({ type: "text", value });
          continue;
        }
        if (value === CHAR_RIGHT_PARENTHESES) {
          if (block.type !== "paren") {
            push2({ type: "text", value });
            continue;
          }
          block = stack.pop();
          push2({ type: "text", value });
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
          let open = value;
          let next;
          if (options.keepQuotes !== true) {
            value = "";
          }
          while (index < length && (next = advance())) {
            if (next === CHAR_BACKSLASH) {
              value += next + advance();
              continue;
            }
            if (next === open) {
              if (options.keepQuotes === true)
                value += next;
              break;
            }
            value += next;
          }
          push2({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_CURLY_BRACE) {
          depth++;
          let dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
          let brace = {
            type: "brace",
            open: true,
            close: false,
            dollar,
            depth,
            commas: 0,
            ranges: 0,
            nodes: []
          };
          block = push2(brace);
          stack.push(block);
          push2({ type: "open", value });
          continue;
        }
        if (value === CHAR_RIGHT_CURLY_BRACE) {
          if (block.type !== "brace") {
            push2({ type: "text", value });
            continue;
          }
          let type = "close";
          block = stack.pop();
          block.close = true;
          push2({ type, value });
          depth--;
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_COMMA && depth > 0) {
          if (block.ranges > 0) {
            block.ranges = 0;
            let open = block.nodes.shift();
            block.nodes = [open, { type: "text", value: stringify(block) }];
          }
          push2({ type: "comma", value });
          block.commas++;
          continue;
        }
        if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
          let siblings = block.nodes;
          if (depth === 0 || siblings.length === 0) {
            push2({ type: "text", value });
            continue;
          }
          if (prev.type === "dot") {
            block.range = [];
            prev.value += value;
            prev.type = "range";
            if (block.nodes.length !== 3 && block.nodes.length !== 5) {
              block.invalid = true;
              block.ranges = 0;
              prev.type = "text";
              continue;
            }
            block.ranges++;
            block.args = [];
            continue;
          }
          if (prev.type === "range") {
            siblings.pop();
            let before = siblings[siblings.length - 1];
            before.value += prev.value + value;
            prev = before;
            block.ranges--;
            continue;
          }
          push2({ type: "dot", value });
          continue;
        }
        push2({ type: "text", value });
      }
      do {
        block = stack.pop();
        if (block.type !== "root") {
          block.nodes.forEach((node) => {
            if (!node.nodes) {
              if (node.type === "open")
                node.isOpen = true;
              if (node.type === "close")
                node.isClose = true;
              if (!node.nodes)
                node.type = "text";
              node.invalid = true;
            }
          });
          let parent = stack[stack.length - 1];
          let index2 = parent.nodes.indexOf(block);
          parent.nodes.splice(index2, 1, ...block.nodes);
        }
      } while (stack.length > 0);
      push2({ type: "eos" });
      return ast;
    };
    module2.exports = parse2;
  }
});

// node_modules/braces/index.js
var require_braces = __commonJS({
  "node_modules/braces/index.js"(exports, module2) {
    "use strict";
    var stringify = require_stringify2();
    var compile = require_compile();
    var expand = require_expand();
    var parse2 = require_parse3();
    var braces = (input, options = {}) => {
      let output = [];
      if (Array.isArray(input)) {
        for (let pattern of input) {
          let result = braces.create(pattern, options);
          if (Array.isArray(result)) {
            output.push(...result);
          } else {
            output.push(result);
          }
        }
      } else {
        output = [].concat(braces.create(input, options));
      }
      if (options && options.expand === true && options.nodupes === true) {
        output = [...new Set(output)];
      }
      return output;
    };
    braces.parse = (input, options = {}) => parse2(input, options);
    braces.stringify = (input, options = {}) => {
      if (typeof input === "string") {
        return stringify(braces.parse(input, options), options);
      }
      return stringify(input, options);
    };
    braces.compile = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      return compile(input, options);
    };
    braces.expand = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      let result = expand(input, options);
      if (options.noempty === true) {
        result = result.filter(Boolean);
      }
      if (options.nodupes === true) {
        result = [...new Set(result)];
      }
      return result;
    };
    braces.create = (input, options = {}) => {
      if (input === "" || input.length < 3) {
        return [input];
      }
      return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
    };
    module2.exports = braces;
  }
});

// node_modules/binary-extensions/binary-extensions.json
var require_binary_extensions = __commonJS({
  "node_modules/binary-extensions/binary-extensions.json"(exports, module2) {
    module2.exports = [
      "3dm",
      "3ds",
      "3g2",
      "3gp",
      "7z",
      "a",
      "aac",
      "adp",
      "ai",
      "aif",
      "aiff",
      "alz",
      "ape",
      "apk",
      "appimage",
      "ar",
      "arj",
      "asf",
      "au",
      "avi",
      "bak",
      "baml",
      "bh",
      "bin",
      "bk",
      "bmp",
      "btif",
      "bz2",
      "bzip2",
      "cab",
      "caf",
      "cgm",
      "class",
      "cmx",
      "cpio",
      "cr2",
      "cur",
      "dat",
      "dcm",
      "deb",
      "dex",
      "djvu",
      "dll",
      "dmg",
      "dng",
      "doc",
      "docm",
      "docx",
      "dot",
      "dotm",
      "dra",
      "DS_Store",
      "dsk",
      "dts",
      "dtshd",
      "dvb",
      "dwg",
      "dxf",
      "ecelp4800",
      "ecelp7470",
      "ecelp9600",
      "egg",
      "eol",
      "eot",
      "epub",
      "exe",
      "f4v",
      "fbs",
      "fh",
      "fla",
      "flac",
      "flatpak",
      "fli",
      "flv",
      "fpx",
      "fst",
      "fvt",
      "g3",
      "gh",
      "gif",
      "graffle",
      "gz",
      "gzip",
      "h261",
      "h263",
      "h264",
      "icns",
      "ico",
      "ief",
      "img",
      "ipa",
      "iso",
      "jar",
      "jpeg",
      "jpg",
      "jpgv",
      "jpm",
      "jxr",
      "key",
      "ktx",
      "lha",
      "lib",
      "lvp",
      "lz",
      "lzh",
      "lzma",
      "lzo",
      "m3u",
      "m4a",
      "m4v",
      "mar",
      "mdi",
      "mht",
      "mid",
      "midi",
      "mj2",
      "mka",
      "mkv",
      "mmr",
      "mng",
      "mobi",
      "mov",
      "movie",
      "mp3",
      "mp4",
      "mp4a",
      "mpeg",
      "mpg",
      "mpga",
      "mxu",
      "nef",
      "npx",
      "numbers",
      "nupkg",
      "o",
      "oga",
      "ogg",
      "ogv",
      "otf",
      "pages",
      "pbm",
      "pcx",
      "pdb",
      "pdf",
      "pea",
      "pgm",
      "pic",
      "png",
      "pnm",
      "pot",
      "potm",
      "potx",
      "ppa",
      "ppam",
      "ppm",
      "pps",
      "ppsm",
      "ppsx",
      "ppt",
      "pptm",
      "pptx",
      "psd",
      "pya",
      "pyc",
      "pyo",
      "pyv",
      "qt",
      "rar",
      "ras",
      "raw",
      "resources",
      "rgb",
      "rip",
      "rlc",
      "rmf",
      "rmvb",
      "rpm",
      "rtf",
      "rz",
      "s3m",
      "s7z",
      "scpt",
      "sgi",
      "shar",
      "snap",
      "sil",
      "sketch",
      "slk",
      "smv",
      "snk",
      "so",
      "stl",
      "suo",
      "sub",
      "swf",
      "tar",
      "tbz",
      "tbz2",
      "tga",
      "tgz",
      "thmx",
      "tif",
      "tiff",
      "tlz",
      "ttc",
      "ttf",
      "txz",
      "udf",
      "uvh",
      "uvi",
      "uvm",
      "uvp",
      "uvs",
      "uvu",
      "viv",
      "vob",
      "war",
      "wav",
      "wax",
      "wbmp",
      "wdp",
      "weba",
      "webm",
      "webp",
      "whl",
      "wim",
      "wm",
      "wma",
      "wmv",
      "wmx",
      "woff",
      "woff2",
      "wrm",
      "wvx",
      "xbm",
      "xif",
      "xla",
      "xlam",
      "xls",
      "xlsb",
      "xlsm",
      "xlsx",
      "xlt",
      "xltm",
      "xltx",
      "xm",
      "xmind",
      "xpi",
      "xpm",
      "xwd",
      "xz",
      "z",
      "zip",
      "zipx"
    ];
  }
});

// node_modules/binary-extensions/index.js
var require_binary_extensions2 = __commonJS({
  "node_modules/binary-extensions/index.js"(exports, module2) {
    module2.exports = require_binary_extensions();
  }
});

// node_modules/is-binary-path/index.js
var require_is_binary_path = __commonJS({
  "node_modules/is-binary-path/index.js"(exports, module2) {
    "use strict";
    var path4 = require("path");
    var binaryExtensions = require_binary_extensions2();
    var extensions = new Set(binaryExtensions);
    module2.exports = (filePath) => extensions.has(path4.extname(filePath).slice(1).toLowerCase());
  }
});

// node_modules/chokidar/lib/constants.js
var require_constants3 = __commonJS({
  "node_modules/chokidar/lib/constants.js"(exports) {
    "use strict";
    var { sep } = require("path");
    var { platform } = process;
    exports.EV_ALL = "all";
    exports.EV_READY = "ready";
    exports.EV_ADD = "add";
    exports.EV_CHANGE = "change";
    exports.EV_ADD_DIR = "addDir";
    exports.EV_UNLINK = "unlink";
    exports.EV_UNLINK_DIR = "unlinkDir";
    exports.EV_RAW = "raw";
    exports.EV_ERROR = "error";
    exports.STR_DATA = "data";
    exports.STR_END = "end";
    exports.STR_CLOSE = "close";
    exports.FSEVENT_CREATED = "created";
    exports.FSEVENT_MODIFIED = "modified";
    exports.FSEVENT_DELETED = "deleted";
    exports.FSEVENT_MOVED = "moved";
    exports.FSEVENT_CLONED = "cloned";
    exports.FSEVENT_UNKNOWN = "unknown";
    exports.FSEVENT_TYPE_FILE = "file";
    exports.FSEVENT_TYPE_DIRECTORY = "directory";
    exports.FSEVENT_TYPE_SYMLINK = "symlink";
    exports.KEY_LISTENERS = "listeners";
    exports.KEY_ERR = "errHandlers";
    exports.KEY_RAW = "rawEmitters";
    exports.HANDLER_KEYS = [exports.KEY_LISTENERS, exports.KEY_ERR, exports.KEY_RAW];
    exports.DOT_SLASH = `.${sep}`;
    exports.BACK_SLASH_RE = /\\/g;
    exports.DOUBLE_SLASH_RE = /\/\//;
    exports.SLASH_OR_BACK_SLASH_RE = /[/\\]/;
    exports.DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
    exports.REPLACER_RE = /^\.[/\\]/;
    exports.SLASH = "/";
    exports.SLASH_SLASH = "//";
    exports.BRACE_START = "{";
    exports.BANG = "!";
    exports.ONE_DOT = ".";
    exports.TWO_DOTS = "..";
    exports.STAR = "*";
    exports.GLOBSTAR = "**";
    exports.ROOT_GLOBSTAR = "/**/*";
    exports.SLASH_GLOBSTAR = "/**";
    exports.DIR_SUFFIX = "Dir";
    exports.ANYMATCH_OPTS = { dot: true };
    exports.STRING_TYPE = "string";
    exports.FUNCTION_TYPE = "function";
    exports.EMPTY_STR = "";
    exports.EMPTY_FN = () => {
    };
    exports.IDENTITY_FN = (val) => val;
    exports.isWindows = platform === "win32";
    exports.isMacos = platform === "darwin";
    exports.isLinux = platform === "linux";
  }
});

// node_modules/chokidar/lib/nodefs-handler.js
var require_nodefs_handler = __commonJS({
  "node_modules/chokidar/lib/nodefs-handler.js"(exports, module2) {
    "use strict";
    var fs6 = require("fs");
    var sysPath = require("path");
    var { promisify } = require("util");
    var isBinaryPath = require_is_binary_path();
    var {
      isWindows,
      isLinux,
      EMPTY_FN,
      EMPTY_STR,
      KEY_LISTENERS,
      KEY_ERR,
      KEY_RAW,
      HANDLER_KEYS,
      EV_CHANGE,
      EV_ADD,
      EV_ADD_DIR,
      EV_ERROR,
      STR_DATA,
      STR_END,
      BRACE_START,
      STAR
    } = require_constants3();
    var THROTTLE_MODE_WATCH = "watch";
    var open = promisify(fs6.open);
    var stat = promisify(fs6.stat);
    var lstat = promisify(fs6.lstat);
    var close = promisify(fs6.close);
    var fsrealpath = promisify(fs6.realpath);
    var statMethods = { lstat, stat };
    var foreach = (val, fn) => {
      if (val instanceof Set) {
        val.forEach(fn);
      } else {
        fn(val);
      }
    };
    var addAndConvert = (main2, prop, item) => {
      let container = main2[prop];
      if (!(container instanceof Set)) {
        main2[prop] = container = /* @__PURE__ */ new Set([container]);
      }
      container.add(item);
    };
    var clearItem = (cont) => (key) => {
      const set = cont[key];
      if (set instanceof Set) {
        set.clear();
      } else {
        delete cont[key];
      }
    };
    var delFromSet = (main2, prop, item) => {
      const container = main2[prop];
      if (container instanceof Set) {
        container.delete(item);
      } else if (container === item) {
        delete main2[prop];
      }
    };
    var isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
    var FsWatchInstances = /* @__PURE__ */ new Map();
    function createFsWatchInstance(path4, options, listener, errHandler, emitRaw) {
      const handleEvent = (rawEvent, evPath) => {
        listener(path4);
        emitRaw(rawEvent, evPath, { watchedPath: path4 });
        if (evPath && path4 !== evPath) {
          fsWatchBroadcast(
            sysPath.resolve(path4, evPath),
            KEY_LISTENERS,
            sysPath.join(path4, evPath)
          );
        }
      };
      try {
        return fs6.watch(path4, options, handleEvent);
      } catch (error) {
        errHandler(error);
      }
    }
    var fsWatchBroadcast = (fullPath, type, val1, val2, val3) => {
      const cont = FsWatchInstances.get(fullPath);
      if (!cont)
        return;
      foreach(cont[type], (listener) => {
        listener(val1, val2, val3);
      });
    };
    var setFsWatchListener = (path4, fullPath, options, handlers) => {
      const { listener, errHandler, rawEmitter } = handlers;
      let cont = FsWatchInstances.get(fullPath);
      let watcher;
      if (!options.persistent) {
        watcher = createFsWatchInstance(
          path4,
          options,
          listener,
          errHandler,
          rawEmitter
        );
        return watcher.close.bind(watcher);
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_ERR, errHandler);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        watcher = createFsWatchInstance(
          path4,
          options,
          fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
          errHandler,
          // no need to use broadcast here
          fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
        );
        if (!watcher)
          return;
        watcher.on(EV_ERROR, async (error) => {
          const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
          cont.watcherUnusable = true;
          if (isWindows && error.code === "EPERM") {
            try {
              const fd = await open(path4, "r");
              await close(fd);
              broadcastErr(error);
            } catch (err) {
            }
          } else {
            broadcastErr(error);
          }
        });
        cont = {
          listeners: listener,
          errHandlers: errHandler,
          rawEmitters: rawEmitter,
          watcher
        };
        FsWatchInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_ERR, errHandler);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          cont.watcher.close();
          FsWatchInstances.delete(fullPath);
          HANDLER_KEYS.forEach(clearItem(cont));
          cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    var FsWatchFileInstances = /* @__PURE__ */ new Map();
    var setFsWatchFileListener = (path4, fullPath, options, handlers) => {
      const { listener, rawEmitter } = handlers;
      let cont = FsWatchFileInstances.get(fullPath);
      let listeners = /* @__PURE__ */ new Set();
      let rawEmitters = /* @__PURE__ */ new Set();
      const copts = cont && cont.options;
      if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
        listeners = cont.listeners;
        rawEmitters = cont.rawEmitters;
        fs6.unwatchFile(fullPath);
        cont = void 0;
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        cont = {
          listeners: listener,
          rawEmitters: rawEmitter,
          options,
          watcher: fs6.watchFile(fullPath, options, (curr, prev) => {
            foreach(cont.rawEmitters, (rawEmitter2) => {
              rawEmitter2(EV_CHANGE, fullPath, { curr, prev });
            });
            const currmtime = curr.mtimeMs;
            if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
              foreach(cont.listeners, (listener2) => listener2(path4, curr));
            }
          })
        };
        FsWatchFileInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          FsWatchFileInstances.delete(fullPath);
          fs6.unwatchFile(fullPath);
          cont.options = cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    var NodeFsHandler = class {
      /**
       * @param {import("../index").FSWatcher} fsW
       */
      constructor(fsW) {
        this.fsw = fsW;
        this._boundHandleError = (error) => fsW._handleError(error);
      }
      /**
       * Watch file for changes with fs_watchFile or fs_watch.
       * @param {String} path to file or dir
       * @param {Function} listener on fs change
       * @returns {Function} closer for the watcher instance
       */
      _watchWithNodeFs(path4, listener) {
        const opts = this.fsw.options;
        const directory = sysPath.dirname(path4);
        const basename5 = sysPath.basename(path4);
        const parent = this.fsw._getWatchedDir(directory);
        parent.add(basename5);
        const absolutePath = sysPath.resolve(path4);
        const options = { persistent: opts.persistent };
        if (!listener)
          listener = EMPTY_FN;
        let closer;
        if (opts.usePolling) {
          options.interval = opts.enableBinaryInterval && isBinaryPath(basename5) ? opts.binaryInterval : opts.interval;
          closer = setFsWatchFileListener(path4, absolutePath, options, {
            listener,
            rawEmitter: this.fsw._emitRaw
          });
        } else {
          closer = setFsWatchListener(path4, absolutePath, options, {
            listener,
            errHandler: this._boundHandleError,
            rawEmitter: this.fsw._emitRaw
          });
        }
        return closer;
      }
      /**
       * Watch a file and emit add event if warranted.
       * @param {Path} file Path
       * @param {fs.Stats} stats result of fs_stat
       * @param {Boolean} initialAdd was the file added at watch instantiation?
       * @returns {Function} closer for the watcher instance
       */
      _handleFile(file, stats, initialAdd) {
        if (this.fsw.closed) {
          return;
        }
        const dirname4 = sysPath.dirname(file);
        const basename5 = sysPath.basename(file);
        const parent = this.fsw._getWatchedDir(dirname4);
        let prevStats = stats;
        if (parent.has(basename5))
          return;
        const listener = async (path4, newStats) => {
          if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5))
            return;
          if (!newStats || newStats.mtimeMs === 0) {
            try {
              const newStats2 = await stat(file);
              if (this.fsw.closed)
                return;
              const at = newStats2.atimeMs;
              const mt = newStats2.mtimeMs;
              if (!at || at <= mt || mt !== prevStats.mtimeMs) {
                this.fsw._emit(EV_CHANGE, file, newStats2);
              }
              if (isLinux && prevStats.ino !== newStats2.ino) {
                this.fsw._closeFile(path4);
                prevStats = newStats2;
                this.fsw._addPathCloser(path4, this._watchWithNodeFs(file, listener));
              } else {
                prevStats = newStats2;
              }
            } catch (error) {
              this.fsw._remove(dirname4, basename5);
            }
          } else if (parent.has(basename5)) {
            const at = newStats.atimeMs;
            const mt = newStats.mtimeMs;
            if (!at || at <= mt || mt !== prevStats.mtimeMs) {
              this.fsw._emit(EV_CHANGE, file, newStats);
            }
            prevStats = newStats;
          }
        };
        const closer = this._watchWithNodeFs(file, listener);
        if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
          if (!this.fsw._throttle(EV_ADD, file, 0))
            return;
          this.fsw._emit(EV_ADD, file, stats);
        }
        return closer;
      }
      /**
       * Handle symlinks encountered while reading a dir.
       * @param {Object} entry returned by readdirp
       * @param {String} directory path of dir being read
       * @param {String} path of this item
       * @param {String} item basename of this item
       * @returns {Promise<Boolean>} true if no more processing is needed for this entry.
       */
      async _handleSymlink(entry, directory, path4, item) {
        if (this.fsw.closed) {
          return;
        }
        const full = entry.fullPath;
        const dir = this.fsw._getWatchedDir(directory);
        if (!this.fsw.options.followSymlinks) {
          this.fsw._incrReadyCount();
          const linkPath = await fsrealpath(path4);
          if (this.fsw.closed)
            return;
          if (dir.has(item)) {
            if (this.fsw._symlinkPaths.get(full) !== linkPath) {
              this.fsw._symlinkPaths.set(full, linkPath);
              this.fsw._emit(EV_CHANGE, path4, entry.stats);
            }
          } else {
            dir.add(item);
            this.fsw._symlinkPaths.set(full, linkPath);
            this.fsw._emit(EV_ADD, path4, entry.stats);
          }
          this.fsw._emitReady();
          return true;
        }
        if (this.fsw._symlinkPaths.has(full)) {
          return true;
        }
        this.fsw._symlinkPaths.set(full, true);
      }
      _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
        directory = sysPath.join(directory, EMPTY_STR);
        if (!wh.hasGlob) {
          throttler = this.fsw._throttle("readdir", directory, 1e3);
          if (!throttler)
            return;
        }
        const previous = this.fsw._getWatchedDir(wh.path);
        const current = /* @__PURE__ */ new Set();
        let stream = this.fsw._readdirp(directory, {
          fileFilter: (entry) => wh.filterPath(entry),
          directoryFilter: (entry) => wh.filterDir(entry),
          depth: 0
        }).on(STR_DATA, async (entry) => {
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          const item = entry.path;
          let path4 = sysPath.join(directory, item);
          current.add(item);
          if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path4, item)) {
            return;
          }
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          if (item === target || !target && !previous.has(item)) {
            this.fsw._incrReadyCount();
            path4 = sysPath.join(dir, sysPath.relative(dir, path4));
            this._addToNodeFs(path4, initialAdd, wh, depth + 1);
          }
        }).on(EV_ERROR, this._boundHandleError);
        return new Promise(
          (resolve2) => stream.once(STR_END, () => {
            if (this.fsw.closed) {
              stream = void 0;
              return;
            }
            const wasThrottled = throttler ? throttler.clear() : false;
            resolve2();
            previous.getChildren().filter((item) => {
              return item !== directory && !current.has(item) && // in case of intersecting globs;
              // a path may have been filtered out of this readdir, but
              // shouldn't be removed because it matches a different glob
              (!wh.hasGlob || wh.filterPath({
                fullPath: sysPath.resolve(directory, item)
              }));
            }).forEach((item) => {
              this.fsw._remove(directory, item);
            });
            stream = void 0;
            if (wasThrottled)
              this._handleRead(directory, false, wh, target, dir, depth, throttler);
          })
        );
      }
      /**
       * Read directory to add / remove files from `@watched` list and re-read it on change.
       * @param {String} dir fs path
       * @param {fs.Stats} stats
       * @param {Boolean} initialAdd
       * @param {Number} depth relative to user-supplied path
       * @param {String} target child path targeted for watch
       * @param {Object} wh Common watch helpers for this path
       * @param {String} realpath
       * @returns {Promise<Function>} closer for the watcher instance.
       */
      async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath) {
        const parentDir = this.fsw._getWatchedDir(sysPath.dirname(dir));
        const tracked = parentDir.has(sysPath.basename(dir));
        if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
          if (!wh.hasGlob || wh.globFilter(dir))
            this.fsw._emit(EV_ADD_DIR, dir, stats);
        }
        parentDir.add(sysPath.basename(dir));
        this.fsw._getWatchedDir(dir);
        let throttler;
        let closer;
        const oDepth = this.fsw.options.depth;
        if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath)) {
          if (!target) {
            await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
            if (this.fsw.closed)
              return;
          }
          closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
            if (stats2 && stats2.mtimeMs === 0)
              return;
            this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
          });
        }
        return closer;
      }
      /**
       * Handle added file, directory, or glob pattern.
       * Delegates call to _handleFile / _handleDir after checks.
       * @param {String} path to file or ir
       * @param {Boolean} initialAdd was the file added at watch instantiation?
       * @param {Object} priorWh depth relative to user-supplied path
       * @param {Number} depth Child path actually targeted for watch
       * @param {String=} target Child path actually targeted for watch
       * @returns {Promise}
       */
      async _addToNodeFs(path4, initialAdd, priorWh, depth, target) {
        const ready = this.fsw._emitReady;
        if (this.fsw._isIgnored(path4) || this.fsw.closed) {
          ready();
          return false;
        }
        const wh = this.fsw._getWatchHelpers(path4, depth);
        if (!wh.hasGlob && priorWh) {
          wh.hasGlob = priorWh.hasGlob;
          wh.globFilter = priorWh.globFilter;
          wh.filterPath = (entry) => priorWh.filterPath(entry);
          wh.filterDir = (entry) => priorWh.filterDir(entry);
        }
        try {
          const stats = await statMethods[wh.statMethod](wh.watchPath);
          if (this.fsw.closed)
            return;
          if (this.fsw._isIgnored(wh.watchPath, stats)) {
            ready();
            return false;
          }
          const follow = this.fsw.options.followSymlinks && !path4.includes(STAR) && !path4.includes(BRACE_START);
          let closer;
          if (stats.isDirectory()) {
            const targetPath = follow ? await fsrealpath(path4) : path4;
            if (this.fsw.closed)
              return;
            closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (path4 !== targetPath && targetPath !== void 0) {
              this.fsw._symlinkPaths.set(targetPath, true);
            }
          } else if (stats.isSymbolicLink()) {
            const targetPath = follow ? await fsrealpath(path4) : path4;
            if (this.fsw.closed)
              return;
            const parent = sysPath.dirname(wh.watchPath);
            this.fsw._getWatchedDir(parent).add(wh.watchPath);
            this.fsw._emit(EV_ADD, wh.watchPath, stats);
            closer = await this._handleDir(parent, stats, initialAdd, depth, path4, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (targetPath !== void 0) {
              this.fsw._symlinkPaths.set(sysPath.resolve(path4), targetPath);
            }
          } else {
            closer = this._handleFile(wh.watchPath, stats, initialAdd);
          }
          ready();
          this.fsw._addPathCloser(path4, closer);
          return false;
        } catch (error) {
          if (this.fsw._handleError(error)) {
            ready();
            return path4;
          }
        }
      }
    };
    module2.exports = NodeFsHandler;
  }
});

// node_modules/chokidar/lib/fsevents-handler.js
var require_fsevents_handler = __commonJS({
  "node_modules/chokidar/lib/fsevents-handler.js"(exports, module2) {
    "use strict";
    var fs6 = require("fs");
    var sysPath = require("path");
    var { promisify } = require("util");
    var fsevents;
    try {
      fsevents = require("fsevents");
    } catch (error) {
      if (process.env.CHOKIDAR_PRINT_FSEVENTS_REQUIRE_ERROR)
        console.error(error);
    }
    if (fsevents) {
      const mtch = process.version.match(/v(\d+)\.(\d+)/);
      if (mtch && mtch[1] && mtch[2]) {
        const maj = Number.parseInt(mtch[1], 10);
        const min = Number.parseInt(mtch[2], 10);
        if (maj === 8 && min < 16) {
          fsevents = void 0;
        }
      }
    }
    var {
      EV_ADD,
      EV_CHANGE,
      EV_ADD_DIR,
      EV_UNLINK,
      EV_ERROR,
      STR_DATA,
      STR_END,
      FSEVENT_CREATED,
      FSEVENT_MODIFIED,
      FSEVENT_DELETED,
      FSEVENT_MOVED,
      // FSEVENT_CLONED,
      FSEVENT_UNKNOWN,
      FSEVENT_TYPE_FILE,
      FSEVENT_TYPE_DIRECTORY,
      FSEVENT_TYPE_SYMLINK,
      ROOT_GLOBSTAR,
      DIR_SUFFIX,
      DOT_SLASH,
      FUNCTION_TYPE,
      EMPTY_FN,
      IDENTITY_FN
    } = require_constants3();
    var Depth = (value) => isNaN(value) ? {} : { depth: value };
    var stat = promisify(fs6.stat);
    var lstat = promisify(fs6.lstat);
    var realpath = promisify(fs6.realpath);
    var statMethods = { stat, lstat };
    var FSEventsWatchers = /* @__PURE__ */ new Map();
    var consolidateThreshhold = 10;
    var wrongEventFlags = /* @__PURE__ */ new Set([
      69888,
      70400,
      71424,
      72704,
      73472,
      131328,
      131840,
      262912
    ]);
    var createFSEventsInstance = (path4, callback) => {
      const stop = fsevents.watch(path4, callback);
      return { stop };
    };
    function setFSEventsListener(path4, realPath, listener, rawEmitter) {
      let watchPath = sysPath.extname(path4) ? sysPath.dirname(path4) : path4;
      const parentPath = sysPath.dirname(watchPath);
      let cont = FSEventsWatchers.get(watchPath);
      if (couldConsolidate(parentPath)) {
        watchPath = parentPath;
      }
      const resolvedPath = sysPath.resolve(path4);
      const hasSymlink = resolvedPath !== realPath;
      const filteredListener = (fullPath, flags, info2) => {
        if (hasSymlink)
          fullPath = fullPath.replace(realPath, resolvedPath);
        if (fullPath === resolvedPath || !fullPath.indexOf(resolvedPath + sysPath.sep))
          listener(fullPath, flags, info2);
      };
      let watchedParent = false;
      for (const watchedPath of FSEventsWatchers.keys()) {
        if (realPath.indexOf(sysPath.resolve(watchedPath) + sysPath.sep) === 0) {
          watchPath = watchedPath;
          cont = FSEventsWatchers.get(watchPath);
          watchedParent = true;
          break;
        }
      }
      if (cont || watchedParent) {
        cont.listeners.add(filteredListener);
      } else {
        cont = {
          listeners: /* @__PURE__ */ new Set([filteredListener]),
          rawEmitter,
          watcher: createFSEventsInstance(watchPath, (fullPath, flags) => {
            if (!cont.listeners.size)
              return;
            const info2 = fsevents.getInfo(fullPath, flags);
            cont.listeners.forEach((list) => {
              list(fullPath, flags, info2);
            });
            cont.rawEmitter(info2.event, fullPath, info2);
          })
        };
        FSEventsWatchers.set(watchPath, cont);
      }
      return () => {
        const lst = cont.listeners;
        lst.delete(filteredListener);
        if (!lst.size) {
          FSEventsWatchers.delete(watchPath);
          if (cont.watcher)
            return cont.watcher.stop().then(() => {
              cont.rawEmitter = cont.watcher = void 0;
              Object.freeze(cont);
            });
        }
      };
    }
    var couldConsolidate = (path4) => {
      let count = 0;
      for (const watchPath of FSEventsWatchers.keys()) {
        if (watchPath.indexOf(path4) === 0) {
          count++;
          if (count >= consolidateThreshhold) {
            return true;
          }
        }
      }
      return false;
    };
    var canUse = () => fsevents && FSEventsWatchers.size < 128;
    var calcDepth = (path4, root) => {
      let i = 0;
      while (!path4.indexOf(root) && (path4 = sysPath.dirname(path4)) !== root)
        i++;
      return i;
    };
    var sameTypes = (info2, stats) => info2.type === FSEVENT_TYPE_DIRECTORY && stats.isDirectory() || info2.type === FSEVENT_TYPE_SYMLINK && stats.isSymbolicLink() || info2.type === FSEVENT_TYPE_FILE && stats.isFile();
    var FsEventsHandler = class {
      /**
       * @param {import('../index').FSWatcher} fsw
       */
      constructor(fsw) {
        this.fsw = fsw;
      }
      checkIgnored(path4, stats) {
        const ipaths = this.fsw._ignoredPaths;
        if (this.fsw._isIgnored(path4, stats)) {
          ipaths.add(path4);
          if (stats && stats.isDirectory()) {
            ipaths.add(path4 + ROOT_GLOBSTAR);
          }
          return true;
        }
        ipaths.delete(path4);
        ipaths.delete(path4 + ROOT_GLOBSTAR);
      }
      addOrChange(path4, fullPath, realPath, parent, watchedDir, item, info2, opts) {
        const event = watchedDir.has(item) ? EV_CHANGE : EV_ADD;
        this.handleEvent(event, path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
      }
      async checkExists(path4, fullPath, realPath, parent, watchedDir, item, info2, opts) {
        try {
          const stats = await stat(path4);
          if (this.fsw.closed)
            return;
          if (sameTypes(info2, stats)) {
            this.addOrChange(path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
          } else {
            this.handleEvent(EV_UNLINK, path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
          }
        } catch (error) {
          if (error.code === "EACCES") {
            this.addOrChange(path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
          } else {
            this.handleEvent(EV_UNLINK, path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
          }
        }
      }
      handleEvent(event, path4, fullPath, realPath, parent, watchedDir, item, info2, opts) {
        if (this.fsw.closed || this.checkIgnored(path4))
          return;
        if (event === EV_UNLINK) {
          const isDirectory = info2.type === FSEVENT_TYPE_DIRECTORY;
          if (isDirectory || watchedDir.has(item)) {
            this.fsw._remove(parent, item, isDirectory);
          }
        } else {
          if (event === EV_ADD) {
            if (info2.type === FSEVENT_TYPE_DIRECTORY)
              this.fsw._getWatchedDir(path4);
            if (info2.type === FSEVENT_TYPE_SYMLINK && opts.followSymlinks) {
              const curDepth = opts.depth === void 0 ? void 0 : calcDepth(fullPath, realPath) + 1;
              return this._addToFsEvents(path4, false, true, curDepth);
            }
            this.fsw._getWatchedDir(parent).add(item);
          }
          const eventName = info2.type === FSEVENT_TYPE_DIRECTORY ? event + DIR_SUFFIX : event;
          this.fsw._emit(eventName, path4);
          if (eventName === EV_ADD_DIR)
            this._addToFsEvents(path4, false, true);
        }
      }
      /**
       * Handle symlinks encountered during directory scan
       * @param {String} watchPath  - file/dir path to be watched with fsevents
       * @param {String} realPath   - real path (in case of symlinks)
       * @param {Function} transform  - path transformer
       * @param {Function} globFilter - path filter in case a glob pattern was provided
       * @returns {Function} closer for the watcher instance
      */
      _watchWithFsEvents(watchPath, realPath, transform, globFilter) {
        if (this.fsw.closed)
          return;
        if (this.fsw._isIgnored(watchPath))
          return;
        const opts = this.fsw.options;
        const watchCallback = async (fullPath, flags, info2) => {
          if (this.fsw.closed)
            return;
          if (opts.depth !== void 0 && calcDepth(fullPath, realPath) > opts.depth)
            return;
          const path4 = transform(sysPath.join(
            watchPath,
            sysPath.relative(watchPath, fullPath)
          ));
          if (globFilter && !globFilter(path4))
            return;
          const parent = sysPath.dirname(path4);
          const item = sysPath.basename(path4);
          const watchedDir = this.fsw._getWatchedDir(
            info2.type === FSEVENT_TYPE_DIRECTORY ? path4 : parent
          );
          if (wrongEventFlags.has(flags) || info2.event === FSEVENT_UNKNOWN) {
            if (typeof opts.ignored === FUNCTION_TYPE) {
              let stats;
              try {
                stats = await stat(path4);
              } catch (error) {
              }
              if (this.fsw.closed)
                return;
              if (this.checkIgnored(path4, stats))
                return;
              if (sameTypes(info2, stats)) {
                this.addOrChange(path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
              } else {
                this.handleEvent(EV_UNLINK, path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
              }
            } else {
              this.checkExists(path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
            }
          } else {
            switch (info2.event) {
              case FSEVENT_CREATED:
              case FSEVENT_MODIFIED:
                return this.addOrChange(path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
              case FSEVENT_DELETED:
              case FSEVENT_MOVED:
                return this.checkExists(path4, fullPath, realPath, parent, watchedDir, item, info2, opts);
            }
          }
        };
        const closer = setFSEventsListener(
          watchPath,
          realPath,
          watchCallback,
          this.fsw._emitRaw
        );
        this.fsw._emitReady();
        return closer;
      }
      /**
       * Handle symlinks encountered during directory scan
       * @param {String} linkPath path to symlink
       * @param {String} fullPath absolute path to the symlink
       * @param {Function} transform pre-existing path transformer
       * @param {Number} curDepth level of subdirectories traversed to where symlink is
       * @returns {Promise<void>}
       */
      async _handleFsEventsSymlink(linkPath, fullPath, transform, curDepth) {
        if (this.fsw.closed || this.fsw._symlinkPaths.has(fullPath))
          return;
        this.fsw._symlinkPaths.set(fullPath, true);
        this.fsw._incrReadyCount();
        try {
          const linkTarget = await realpath(linkPath);
          if (this.fsw.closed)
            return;
          if (this.fsw._isIgnored(linkTarget)) {
            return this.fsw._emitReady();
          }
          this.fsw._incrReadyCount();
          this._addToFsEvents(linkTarget || linkPath, (path4) => {
            let aliasedPath = linkPath;
            if (linkTarget && linkTarget !== DOT_SLASH) {
              aliasedPath = path4.replace(linkTarget, linkPath);
            } else if (path4 !== DOT_SLASH) {
              aliasedPath = sysPath.join(linkPath, path4);
            }
            return transform(aliasedPath);
          }, false, curDepth);
        } catch (error) {
          if (this.fsw._handleError(error)) {
            return this.fsw._emitReady();
          }
        }
      }
      /**
       *
       * @param {Path} newPath
       * @param {fs.Stats} stats
       */
      emitAdd(newPath, stats, processPath, opts, forceAdd) {
        const pp = processPath(newPath);
        const isDir = stats.isDirectory();
        const dirObj = this.fsw._getWatchedDir(sysPath.dirname(pp));
        const base = sysPath.basename(pp);
        if (isDir)
          this.fsw._getWatchedDir(pp);
        if (dirObj.has(base))
          return;
        dirObj.add(base);
        if (!opts.ignoreInitial || forceAdd === true) {
          this.fsw._emit(isDir ? EV_ADD_DIR : EV_ADD, pp, stats);
        }
      }
      initWatch(realPath, path4, wh, processPath) {
        if (this.fsw.closed)
          return;
        const closer = this._watchWithFsEvents(
          wh.watchPath,
          sysPath.resolve(realPath || wh.watchPath),
          processPath,
          wh.globFilter
        );
        this.fsw._addPathCloser(path4, closer);
      }
      /**
       * Handle added path with fsevents
       * @param {String} path file/dir path or glob pattern
       * @param {Function|Boolean=} transform converts working path to what the user expects
       * @param {Boolean=} forceAdd ensure add is emitted
       * @param {Number=} priorDepth Level of subdirectories already traversed.
       * @returns {Promise<void>}
       */
      async _addToFsEvents(path4, transform, forceAdd, priorDepth) {
        if (this.fsw.closed) {
          return;
        }
        const opts = this.fsw.options;
        const processPath = typeof transform === FUNCTION_TYPE ? transform : IDENTITY_FN;
        const wh = this.fsw._getWatchHelpers(path4);
        try {
          const stats = await statMethods[wh.statMethod](wh.watchPath);
          if (this.fsw.closed)
            return;
          if (this.fsw._isIgnored(wh.watchPath, stats)) {
            throw null;
          }
          if (stats.isDirectory()) {
            if (!wh.globFilter)
              this.emitAdd(processPath(path4), stats, processPath, opts, forceAdd);
            if (priorDepth && priorDepth > opts.depth)
              return;
            this.fsw._readdirp(wh.watchPath, {
              fileFilter: (entry) => wh.filterPath(entry),
              directoryFilter: (entry) => wh.filterDir(entry),
              ...Depth(opts.depth - (priorDepth || 0))
            }).on(STR_DATA, (entry) => {
              if (this.fsw.closed) {
                return;
              }
              if (entry.stats.isDirectory() && !wh.filterPath(entry))
                return;
              const joinedPath = sysPath.join(wh.watchPath, entry.path);
              const { fullPath } = entry;
              if (wh.followSymlinks && entry.stats.isSymbolicLink()) {
                const curDepth = opts.depth === void 0 ? void 0 : calcDepth(joinedPath, sysPath.resolve(wh.watchPath)) + 1;
                this._handleFsEventsSymlink(joinedPath, fullPath, processPath, curDepth);
              } else {
                this.emitAdd(joinedPath, entry.stats, processPath, opts, forceAdd);
              }
            }).on(EV_ERROR, EMPTY_FN).on(STR_END, () => {
              this.fsw._emitReady();
            });
          } else {
            this.emitAdd(wh.watchPath, stats, processPath, opts, forceAdd);
            this.fsw._emitReady();
          }
        } catch (error) {
          if (!error || this.fsw._handleError(error)) {
            this.fsw._emitReady();
            this.fsw._emitReady();
          }
        }
        if (opts.persistent && forceAdd !== true) {
          if (typeof transform === FUNCTION_TYPE) {
            this.initWatch(void 0, path4, wh, processPath);
          } else {
            let realPath;
            try {
              realPath = await realpath(wh.watchPath);
            } catch (e) {
            }
            this.initWatch(realPath, path4, wh, processPath);
          }
        }
      }
    };
    module2.exports = FsEventsHandler;
    module2.exports.canUse = canUse;
  }
});

// node_modules/chokidar/index.js
var require_chokidar = __commonJS({
  "node_modules/chokidar/index.js"(exports) {
    "use strict";
    var { EventEmitter } = require("events");
    var fs6 = require("fs");
    var sysPath = require("path");
    var { promisify } = require("util");
    var readdirp = require_readdirp();
    var anymatch = require_anymatch().default;
    var globParent = require_glob_parent();
    var isGlob = require_is_glob();
    var braces = require_braces();
    var normalizePath = require_normalize_path();
    var NodeFsHandler = require_nodefs_handler();
    var FsEventsHandler = require_fsevents_handler();
    var {
      EV_ALL,
      EV_READY,
      EV_ADD,
      EV_CHANGE,
      EV_UNLINK,
      EV_ADD_DIR,
      EV_UNLINK_DIR,
      EV_RAW,
      EV_ERROR,
      STR_CLOSE,
      STR_END,
      BACK_SLASH_RE,
      DOUBLE_SLASH_RE,
      SLASH_OR_BACK_SLASH_RE,
      DOT_RE,
      REPLACER_RE,
      SLASH,
      SLASH_SLASH,
      BRACE_START,
      BANG,
      ONE_DOT,
      TWO_DOTS,
      GLOBSTAR,
      SLASH_GLOBSTAR,
      ANYMATCH_OPTS,
      STRING_TYPE,
      FUNCTION_TYPE,
      EMPTY_STR,
      EMPTY_FN,
      isWindows,
      isMacos
    } = require_constants3();
    var stat = promisify(fs6.stat);
    var readdir = promisify(fs6.readdir);
    var arrify = (value = []) => Array.isArray(value) ? value : [value];
    var flatten = (list, result = []) => {
      list.forEach((item) => {
        if (Array.isArray(item)) {
          flatten(item, result);
        } else {
          result.push(item);
        }
      });
      return result;
    };
    var unifyPaths = (paths_) => {
      const paths = flatten(arrify(paths_));
      if (!paths.every((p) => typeof p === STRING_TYPE)) {
        throw new TypeError(`Non-string provided as watch path: ${paths}`);
      }
      return paths.map(normalizePathToUnix);
    };
    var toUnix = (string) => {
      let str = string.replace(BACK_SLASH_RE, SLASH);
      let prepend = false;
      if (str.startsWith(SLASH_SLASH)) {
        prepend = true;
      }
      while (str.match(DOUBLE_SLASH_RE)) {
        str = str.replace(DOUBLE_SLASH_RE, SLASH);
      }
      if (prepend) {
        str = SLASH + str;
      }
      return str;
    };
    var normalizePathToUnix = (path4) => toUnix(sysPath.normalize(toUnix(path4)));
    var normalizeIgnored = (cwd = EMPTY_STR) => (path4) => {
      if (typeof path4 !== STRING_TYPE)
        return path4;
      return normalizePathToUnix(sysPath.isAbsolute(path4) ? path4 : sysPath.join(cwd, path4));
    };
    var getAbsolutePath = (path4, cwd) => {
      if (sysPath.isAbsolute(path4)) {
        return path4;
      }
      if (path4.startsWith(BANG)) {
        return BANG + sysPath.join(cwd, path4.slice(1));
      }
      return sysPath.join(cwd, path4);
    };
    var undef = (opts, key) => opts[key] === void 0;
    var DirEntry = class {
      /**
       * @param {Path} dir
       * @param {Function} removeWatcher
       */
      constructor(dir, removeWatcher) {
        this.path = dir;
        this._removeWatcher = removeWatcher;
        this.items = /* @__PURE__ */ new Set();
      }
      add(item) {
        const { items } = this;
        if (!items)
          return;
        if (item !== ONE_DOT && item !== TWO_DOTS)
          items.add(item);
      }
      async remove(item) {
        const { items } = this;
        if (!items)
          return;
        items.delete(item);
        if (items.size > 0)
          return;
        const dir = this.path;
        try {
          await readdir(dir);
        } catch (err) {
          if (this._removeWatcher) {
            this._removeWatcher(sysPath.dirname(dir), sysPath.basename(dir));
          }
        }
      }
      has(item) {
        const { items } = this;
        if (!items)
          return;
        return items.has(item);
      }
      /**
       * @returns {Array<String>}
       */
      getChildren() {
        const { items } = this;
        if (!items)
          return;
        return [...items.values()];
      }
      dispose() {
        this.items.clear();
        delete this.path;
        delete this._removeWatcher;
        delete this.items;
        Object.freeze(this);
      }
    };
    var STAT_METHOD_F = "stat";
    var STAT_METHOD_L = "lstat";
    var WatchHelper = class {
      constructor(path4, watchPath, follow, fsw) {
        this.fsw = fsw;
        this.path = path4 = path4.replace(REPLACER_RE, EMPTY_STR);
        this.watchPath = watchPath;
        this.fullWatchPath = sysPath.resolve(watchPath);
        this.hasGlob = watchPath !== path4;
        if (path4 === EMPTY_STR)
          this.hasGlob = false;
        this.globSymlink = this.hasGlob && follow ? void 0 : false;
        this.globFilter = this.hasGlob ? anymatch(path4, void 0, ANYMATCH_OPTS) : false;
        this.dirParts = this.getDirParts(path4);
        this.dirParts.forEach((parts) => {
          if (parts.length > 1)
            parts.pop();
        });
        this.followSymlinks = follow;
        this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
      }
      checkGlobSymlink(entry) {
        if (this.globSymlink === void 0) {
          this.globSymlink = entry.fullParentDir === this.fullWatchPath ? false : { realPath: entry.fullParentDir, linkPath: this.fullWatchPath };
        }
        if (this.globSymlink) {
          return entry.fullPath.replace(this.globSymlink.realPath, this.globSymlink.linkPath);
        }
        return entry.fullPath;
      }
      entryPath(entry) {
        return sysPath.join(
          this.watchPath,
          sysPath.relative(this.watchPath, this.checkGlobSymlink(entry))
        );
      }
      filterPath(entry) {
        const { stats } = entry;
        if (stats && stats.isSymbolicLink())
          return this.filterDir(entry);
        const resolvedPath = this.entryPath(entry);
        const matchesGlob = this.hasGlob && typeof this.globFilter === FUNCTION_TYPE ? this.globFilter(resolvedPath) : true;
        return matchesGlob && this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
      }
      getDirParts(path4) {
        if (!this.hasGlob)
          return [];
        const parts = [];
        const expandedPath = path4.includes(BRACE_START) ? braces.expand(path4) : [path4];
        expandedPath.forEach((path5) => {
          parts.push(sysPath.relative(this.watchPath, path5).split(SLASH_OR_BACK_SLASH_RE));
        });
        return parts;
      }
      filterDir(entry) {
        if (this.hasGlob) {
          const entryParts = this.getDirParts(this.checkGlobSymlink(entry));
          let globstar = false;
          this.unmatchedGlob = !this.dirParts.some((parts) => {
            return parts.every((part, i) => {
              if (part === GLOBSTAR)
                globstar = true;
              return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i], ANYMATCH_OPTS);
            });
          });
        }
        return !this.unmatchedGlob && this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
      }
    };
    var FSWatcher = class extends EventEmitter {
      // Not indenting methods for history sake; for now.
      constructor(_opts) {
        super();
        const opts = {};
        if (_opts)
          Object.assign(opts, _opts);
        this._watched = /* @__PURE__ */ new Map();
        this._closers = /* @__PURE__ */ new Map();
        this._ignoredPaths = /* @__PURE__ */ new Set();
        this._throttled = /* @__PURE__ */ new Map();
        this._symlinkPaths = /* @__PURE__ */ new Map();
        this._streams = /* @__PURE__ */ new Set();
        this.closed = false;
        if (undef(opts, "persistent"))
          opts.persistent = true;
        if (undef(opts, "ignoreInitial"))
          opts.ignoreInitial = false;
        if (undef(opts, "ignorePermissionErrors"))
          opts.ignorePermissionErrors = false;
        if (undef(opts, "interval"))
          opts.interval = 100;
        if (undef(opts, "binaryInterval"))
          opts.binaryInterval = 300;
        if (undef(opts, "disableGlobbing"))
          opts.disableGlobbing = false;
        opts.enableBinaryInterval = opts.binaryInterval !== opts.interval;
        if (undef(opts, "useFsEvents"))
          opts.useFsEvents = !opts.usePolling;
        const canUseFsEvents = FsEventsHandler.canUse();
        if (!canUseFsEvents)
          opts.useFsEvents = false;
        if (undef(opts, "usePolling") && !opts.useFsEvents) {
          opts.usePolling = isMacos;
        }
        const envPoll = process.env.CHOKIDAR_USEPOLLING;
        if (envPoll !== void 0) {
          const envLower = envPoll.toLowerCase();
          if (envLower === "false" || envLower === "0") {
            opts.usePolling = false;
          } else if (envLower === "true" || envLower === "1") {
            opts.usePolling = true;
          } else {
            opts.usePolling = !!envLower;
          }
        }
        const envInterval = process.env.CHOKIDAR_INTERVAL;
        if (envInterval) {
          opts.interval = Number.parseInt(envInterval, 10);
        }
        if (undef(opts, "atomic"))
          opts.atomic = !opts.usePolling && !opts.useFsEvents;
        if (opts.atomic)
          this._pendingUnlinks = /* @__PURE__ */ new Map();
        if (undef(opts, "followSymlinks"))
          opts.followSymlinks = true;
        if (undef(opts, "awaitWriteFinish"))
          opts.awaitWriteFinish = false;
        if (opts.awaitWriteFinish === true)
          opts.awaitWriteFinish = {};
        const awf = opts.awaitWriteFinish;
        if (awf) {
          if (!awf.stabilityThreshold)
            awf.stabilityThreshold = 2e3;
          if (!awf.pollInterval)
            awf.pollInterval = 100;
          this._pendingWrites = /* @__PURE__ */ new Map();
        }
        if (opts.ignored)
          opts.ignored = arrify(opts.ignored);
        let readyCalls = 0;
        this._emitReady = () => {
          readyCalls++;
          if (readyCalls >= this._readyCount) {
            this._emitReady = EMPTY_FN;
            this._readyEmitted = true;
            process.nextTick(() => this.emit(EV_READY));
          }
        };
        this._emitRaw = (...args2) => this.emit(EV_RAW, ...args2);
        this._readyEmitted = false;
        this.options = opts;
        if (opts.useFsEvents) {
          this._fsEventsHandler = new FsEventsHandler(this);
        } else {
          this._nodeFsHandler = new NodeFsHandler(this);
        }
        Object.freeze(opts);
      }
      // Public methods
      /**
       * Adds paths to be watched on an existing FSWatcher instance
       * @param {Path|Array<Path>} paths_
       * @param {String=} _origAdd private; for handling non-existent paths to be watched
       * @param {Boolean=} _internal private; indicates a non-user add
       * @returns {FSWatcher} for chaining
       */
      add(paths_, _origAdd, _internal) {
        const { cwd, disableGlobbing } = this.options;
        this.closed = false;
        let paths = unifyPaths(paths_);
        if (cwd) {
          paths = paths.map((path4) => {
            const absPath = getAbsolutePath(path4, cwd);
            if (disableGlobbing || !isGlob(path4)) {
              return absPath;
            }
            return normalizePath(absPath);
          });
        }
        paths = paths.filter((path4) => {
          if (path4.startsWith(BANG)) {
            this._ignoredPaths.add(path4.slice(1));
            return false;
          }
          this._ignoredPaths.delete(path4);
          this._ignoredPaths.delete(path4 + SLASH_GLOBSTAR);
          this._userIgnored = void 0;
          return true;
        });
        if (this.options.useFsEvents && this._fsEventsHandler) {
          if (!this._readyCount)
            this._readyCount = paths.length;
          if (this.options.persistent)
            this._readyCount *= 2;
          paths.forEach((path4) => this._fsEventsHandler._addToFsEvents(path4));
        } else {
          if (!this._readyCount)
            this._readyCount = 0;
          this._readyCount += paths.length;
          Promise.all(
            paths.map(async (path4) => {
              const res = await this._nodeFsHandler._addToNodeFs(path4, !_internal, 0, 0, _origAdd);
              if (res)
                this._emitReady();
              return res;
            })
          ).then((results) => {
            if (this.closed)
              return;
            results.filter((item) => item).forEach((item) => {
              this.add(sysPath.dirname(item), sysPath.basename(_origAdd || item));
            });
          });
        }
        return this;
      }
      /**
       * Close watchers or start ignoring events from specified paths.
       * @param {Path|Array<Path>} paths_ - string or array of strings, file/directory paths and/or globs
       * @returns {FSWatcher} for chaining
      */
      unwatch(paths_) {
        if (this.closed)
          return this;
        const paths = unifyPaths(paths_);
        const { cwd } = this.options;
        paths.forEach((path4) => {
          if (!sysPath.isAbsolute(path4) && !this._closers.has(path4)) {
            if (cwd)
              path4 = sysPath.join(cwd, path4);
            path4 = sysPath.resolve(path4);
          }
          this._closePath(path4);
          this._ignoredPaths.add(path4);
          if (this._watched.has(path4)) {
            this._ignoredPaths.add(path4 + SLASH_GLOBSTAR);
          }
          this._userIgnored = void 0;
        });
        return this;
      }
      /**
       * Close watchers and remove all listeners from watched paths.
       * @returns {Promise<void>}.
      */
      close() {
        if (this.closed)
          return this._closePromise;
        this.closed = true;
        this.removeAllListeners();
        const closers = [];
        this._closers.forEach((closerList) => closerList.forEach((closer) => {
          const promise = closer();
          if (promise instanceof Promise)
            closers.push(promise);
        }));
        this._streams.forEach((stream) => stream.destroy());
        this._userIgnored = void 0;
        this._readyCount = 0;
        this._readyEmitted = false;
        this._watched.forEach((dirent) => dirent.dispose());
        ["closers", "watched", "streams", "symlinkPaths", "throttled"].forEach((key) => {
          this[`_${key}`].clear();
        });
        this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
        return this._closePromise;
      }
      /**
       * Expose list of watched paths
       * @returns {Object} for chaining
      */
      getWatched() {
        const watchList = {};
        this._watched.forEach((entry, dir) => {
          const key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
          watchList[key || ONE_DOT] = entry.getChildren().sort();
        });
        return watchList;
      }
      emitWithAll(event, args2) {
        this.emit(...args2);
        if (event !== EV_ERROR)
          this.emit(EV_ALL, ...args2);
      }
      // Common helpers
      // --------------
      /**
       * Normalize and emit events.
       * Calling _emit DOES NOT MEAN emit() would be called!
       * @param {EventName} event Type of event
       * @param {Path} path File or directory path
       * @param {*=} val1 arguments to be passed with event
       * @param {*=} val2
       * @param {*=} val3
       * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      async _emit(event, path4, val1, val2, val3) {
        if (this.closed)
          return;
        const opts = this.options;
        if (isWindows)
          path4 = sysPath.normalize(path4);
        if (opts.cwd)
          path4 = sysPath.relative(opts.cwd, path4);
        const args2 = [event, path4];
        if (val3 !== void 0)
          args2.push(val1, val2, val3);
        else if (val2 !== void 0)
          args2.push(val1, val2);
        else if (val1 !== void 0)
          args2.push(val1);
        const awf = opts.awaitWriteFinish;
        let pw;
        if (awf && (pw = this._pendingWrites.get(path4))) {
          pw.lastChange = /* @__PURE__ */ new Date();
          return this;
        }
        if (opts.atomic) {
          if (event === EV_UNLINK) {
            this._pendingUnlinks.set(path4, args2);
            setTimeout(() => {
              this._pendingUnlinks.forEach((entry, path5) => {
                this.emit(...entry);
                this.emit(EV_ALL, ...entry);
                this._pendingUnlinks.delete(path5);
              });
            }, typeof opts.atomic === "number" ? opts.atomic : 100);
            return this;
          }
          if (event === EV_ADD && this._pendingUnlinks.has(path4)) {
            event = args2[0] = EV_CHANGE;
            this._pendingUnlinks.delete(path4);
          }
        }
        if (awf && (event === EV_ADD || event === EV_CHANGE) && this._readyEmitted) {
          const awfEmit = (err, stats) => {
            if (err) {
              event = args2[0] = EV_ERROR;
              args2[1] = err;
              this.emitWithAll(event, args2);
            } else if (stats) {
              if (args2.length > 2) {
                args2[2] = stats;
              } else {
                args2.push(stats);
              }
              this.emitWithAll(event, args2);
            }
          };
          this._awaitWriteFinish(path4, awf.stabilityThreshold, event, awfEmit);
          return this;
        }
        if (event === EV_CHANGE) {
          const isThrottled = !this._throttle(EV_CHANGE, path4, 50);
          if (isThrottled)
            return this;
        }
        if (opts.alwaysStat && val1 === void 0 && (event === EV_ADD || event === EV_ADD_DIR || event === EV_CHANGE)) {
          const fullPath = opts.cwd ? sysPath.join(opts.cwd, path4) : path4;
          let stats;
          try {
            stats = await stat(fullPath);
          } catch (err) {
          }
          if (!stats || this.closed)
            return;
          args2.push(stats);
        }
        this.emitWithAll(event, args2);
        return this;
      }
      /**
       * Common handler for errors
       * @param {Error} error
       * @returns {Error|Boolean} The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      _handleError(error) {
        const code = error && error.code;
        if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
          this.emit(EV_ERROR, error);
        }
        return error || this.closed;
      }
      /**
       * Helper utility for throttling
       * @param {ThrottleType} actionType type being throttled
       * @param {Path} path being acted upon
       * @param {Number} timeout duration of time to suppress duplicate actions
       * @returns {Object|false} tracking object or false if action should be suppressed
       */
      _throttle(actionType, path4, timeout) {
        if (!this._throttled.has(actionType)) {
          this._throttled.set(actionType, /* @__PURE__ */ new Map());
        }
        const action = this._throttled.get(actionType);
        const actionPath = action.get(path4);
        if (actionPath) {
          actionPath.count++;
          return false;
        }
        let timeoutObject;
        const clear = () => {
          const item = action.get(path4);
          const count = item ? item.count : 0;
          action.delete(path4);
          clearTimeout(timeoutObject);
          if (item)
            clearTimeout(item.timeoutObject);
          return count;
        };
        timeoutObject = setTimeout(clear, timeout);
        const thr = { timeoutObject, clear, count: 0 };
        action.set(path4, thr);
        return thr;
      }
      _incrReadyCount() {
        return this._readyCount++;
      }
      /**
       * Awaits write operation to finish.
       * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
       * @param {Path} path being acted upon
       * @param {Number} threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
       * @param {EventName} event
       * @param {Function} awfEmit Callback to be called when ready for event to be emitted.
       */
      _awaitWriteFinish(path4, threshold, event, awfEmit) {
        let timeoutHandler;
        let fullPath = path4;
        if (this.options.cwd && !sysPath.isAbsolute(path4)) {
          fullPath = sysPath.join(this.options.cwd, path4);
        }
        const now = /* @__PURE__ */ new Date();
        const awaitWriteFinish = (prevStat) => {
          fs6.stat(fullPath, (err, curStat) => {
            if (err || !this._pendingWrites.has(path4)) {
              if (err && err.code !== "ENOENT")
                awfEmit(err);
              return;
            }
            const now2 = Number(/* @__PURE__ */ new Date());
            if (prevStat && curStat.size !== prevStat.size) {
              this._pendingWrites.get(path4).lastChange = now2;
            }
            const pw = this._pendingWrites.get(path4);
            const df = now2 - pw.lastChange;
            if (df >= threshold) {
              this._pendingWrites.delete(path4);
              awfEmit(void 0, curStat);
            } else {
              timeoutHandler = setTimeout(
                awaitWriteFinish,
                this.options.awaitWriteFinish.pollInterval,
                curStat
              );
            }
          });
        };
        if (!this._pendingWrites.has(path4)) {
          this._pendingWrites.set(path4, {
            lastChange: now,
            cancelWait: () => {
              this._pendingWrites.delete(path4);
              clearTimeout(timeoutHandler);
              return event;
            }
          });
          timeoutHandler = setTimeout(
            awaitWriteFinish,
            this.options.awaitWriteFinish.pollInterval
          );
        }
      }
      _getGlobIgnored() {
        return [...this._ignoredPaths.values()];
      }
      /**
       * Determines whether user has asked to ignore this path.
       * @param {Path} path filepath or dir
       * @param {fs.Stats=} stats result of fs.stat
       * @returns {Boolean}
       */
      _isIgnored(path4, stats) {
        if (this.options.atomic && DOT_RE.test(path4))
          return true;
        if (!this._userIgnored) {
          const { cwd } = this.options;
          const ign = this.options.ignored;
          const ignored = ign && ign.map(normalizeIgnored(cwd));
          const paths = arrify(ignored).filter((path5) => typeof path5 === STRING_TYPE && !isGlob(path5)).map((path5) => path5 + SLASH_GLOBSTAR);
          const list = this._getGlobIgnored().map(normalizeIgnored(cwd)).concat(ignored, paths);
          this._userIgnored = anymatch(list, void 0, ANYMATCH_OPTS);
        }
        return this._userIgnored([path4, stats]);
      }
      _isntIgnored(path4, stat2) {
        return !this._isIgnored(path4, stat2);
      }
      /**
       * Provides a set of common helpers and properties relating to symlink and glob handling.
       * @param {Path} path file, directory, or glob pattern being watched
       * @param {Number=} depth at any depth > 0, this isn't a glob
       * @returns {WatchHelper} object containing helpers for this path
       */
      _getWatchHelpers(path4, depth) {
        const watchPath = depth || this.options.disableGlobbing || !isGlob(path4) ? path4 : globParent(path4);
        const follow = this.options.followSymlinks;
        return new WatchHelper(path4, watchPath, follow, this);
      }
      // Directory helpers
      // -----------------
      /**
       * Provides directory tracking objects
       * @param {String} directory path of the directory
       * @returns {DirEntry} the directory's tracking object
       */
      _getWatchedDir(directory) {
        if (!this._boundRemove)
          this._boundRemove = this._remove.bind(this);
        const dir = sysPath.resolve(directory);
        if (!this._watched.has(dir))
          this._watched.set(dir, new DirEntry(dir, this._boundRemove));
        return this._watched.get(dir);
      }
      // File helpers
      // ------------
      /**
       * Check for read permissions.
       * Based on this answer on SO: https://stackoverflow.com/a/11781404/1358405
       * @param {fs.Stats} stats - object, result of fs_stat
       * @returns {Boolean} indicates whether the file can be read
      */
      _hasReadPermissions(stats) {
        if (this.options.ignorePermissionErrors)
          return true;
        const md = stats && Number.parseInt(stats.mode, 10);
        const st = md & 511;
        const it = Number.parseInt(st.toString(8)[0], 10);
        return Boolean(4 & it);
      }
      /**
       * Handles emitting unlink events for
       * files and directories, and via recursion, for
       * files and directories within directories that are unlinked
       * @param {String} directory within which the following item is located
       * @param {String} item      base path of item/directory
       * @returns {void}
      */
      _remove(directory, item, isDirectory) {
        const path4 = sysPath.join(directory, item);
        const fullPath = sysPath.resolve(path4);
        isDirectory = isDirectory != null ? isDirectory : this._watched.has(path4) || this._watched.has(fullPath);
        if (!this._throttle("remove", path4, 100))
          return;
        if (!isDirectory && !this.options.useFsEvents && this._watched.size === 1) {
          this.add(directory, item, true);
        }
        const wp = this._getWatchedDir(path4);
        const nestedDirectoryChildren = wp.getChildren();
        nestedDirectoryChildren.forEach((nested) => this._remove(path4, nested));
        const parent = this._getWatchedDir(directory);
        const wasTracked = parent.has(item);
        parent.remove(item);
        let relPath = path4;
        if (this.options.cwd)
          relPath = sysPath.relative(this.options.cwd, path4);
        if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
          const event = this._pendingWrites.get(relPath).cancelWait();
          if (event === EV_ADD)
            return;
        }
        this._watched.delete(path4);
        this._watched.delete(fullPath);
        const eventName = isDirectory ? EV_UNLINK_DIR : EV_UNLINK;
        if (wasTracked && !this._isIgnored(path4))
          this._emit(eventName, path4);
        if (!this.options.useFsEvents) {
          this._closePath(path4);
        }
      }
      /**
       * Closes all watchers for a path
       * @param {Path} path
       */
      _closePath(path4) {
        this._closeFile(path4);
        const dir = sysPath.dirname(path4);
        this._getWatchedDir(dir).remove(sysPath.basename(path4));
      }
      /**
       * Closes only file-specific watchers
       * @param {Path} path
       */
      _closeFile(path4) {
        const closers = this._closers.get(path4);
        if (!closers)
          return;
        closers.forEach((closer) => closer());
        this._closers.delete(path4);
      }
      /**
       *
       * @param {Path} path
       * @param {Function} closer
       */
      _addPathCloser(path4, closer) {
        if (!closer)
          return;
        let list = this._closers.get(path4);
        if (!list) {
          list = [];
          this._closers.set(path4, list);
        }
        list.push(closer);
      }
      _readdirp(root, opts) {
        if (this.closed)
          return;
        const options = { type: EV_ALL, alwaysStat: true, lstat: true, ...opts };
        let stream = readdirp(root, options);
        this._streams.add(stream);
        stream.once(STR_CLOSE, () => {
          stream = void 0;
        });
        stream.once(STR_END, () => {
          if (stream) {
            this._streams.delete(stream);
            stream = void 0;
          }
        });
        return stream;
      }
    };
    exports.FSWatcher = FSWatcher;
    var watch2 = (paths, options) => {
      const watcher = new FSWatcher(options);
      watcher.add(paths);
      return watcher;
    };
    exports.watch = watch2;
  }
});

// src/types.ts
var fs2 = __toESM(require_lib());
var import_path = __toESM(require("path"));

// src/jsonfile.ts
var fs = __toESM(require_lib());
var import_deep_equal = __toESM(require_deep_equal());
var JSON5 = __toESM(require_lib2());
var parse_json_file = (path4) => {
  try {
    return JSON5.parse(fs.readFileSync(path4, "utf8"));
  } catch (e) {
    throw `bad JSON at file ${path4}, error: ${e}`;
  }
};
var protect = (path4, flush, force = false, protect_path = `${path4}.protect`) => {
  if (fs.existsSync(protect_path) && fs.existsSync(path4)) {
    if (!force && fs.readFileSync(protect_path, "utf8") !== fs.readFileSync(path4, "utf8"))
      throw new Error(`mv ${protect_path} ${path4} to continue. Not overwriting your changes. Use --force to force`);
  }
  flush();
  fs.copyFileSync(path4, protect_path);
};
var JSONFile = class {
  constructor(path4, default_ = () => ({})) {
    this.path = path4;
    this.json = {};
    this.json_on_disc = void 0;
    if (fs.existsSync(this.path)) {
      const s = fs.readFileSync(this.path, "utf8");
      this.json = parse_json_file(this.path);
    } else {
      this.json_on_disc = void 0;
      this.json = default_();
    }
  }
  exists() {
    return fs.existsSync(this.path);
  }
  flush() {
    const s = JSON.stringify(this.json, void 0, 2);
    if (!(0, import_deep_equal.default)(this.json_on_disc, this.json)) {
      fs.writeFileSync(this.path, s, "utf8");
    }
  }
  flush_protect_user_changes(force = false) {
    protect(this.path, () => {
      this.flush();
    }, force);
  }
};

// src/types.ts
var DirectoryCache = class {
  // sry for reimplementing it - need a *simple* fast solution
  constructor(path4) {
    this.path = path4;
  }
  get(key, f, ttl_seconds) {
    const cached = this.get_(key, ttl_seconds);
    if (cached === void 0) {
      const r = f();
      this.put_(key, r);
      return r;
    }
    return cached;
  }
  async get_async(key, f, ttl_seconds) {
    const cached = this.get_(key, ttl_seconds);
    if (cached === void 0) {
      const r = await f();
      this.put_(key, r);
      return r;
    }
    return cached;
  }
  tc_() {
    return (/* @__PURE__ */ new Date()).getTime();
  }
  path_(key) {
    return import_path.default.join(this.path, btoa(key));
  }
  get_(key, ttl) {
    const p = this.path_(key);
    if (fs2.existsSync(p)) {
      const json = JSON.parse(fs2.readFileSync(p, "utf8"));
      if (ttl === void 0 || !(this.tc_() - json.tc > ttl))
        return json.thing;
    }
    return void 0;
  }
  put_(key, thing) {
    if (!fs2.existsSync(this.path))
      fs2.mkdirpSync(this.path);
    fs2.writeFileSync(this.path_(key), JSON.stringify({ thing, tc: this.tc_() }));
  }
};
var cfg_api = (cfg) => {
  const fetch_from_registry = (name) => {
    return cfg.cache.get_async(`fetch-${name}-registry.npmjs.org`, async () => {
      const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (res.status !== 200)
        throw new Error(`fetching ${url}`);
      return res.json();
    }, cfg.fetch_ttl_seconds);
  };
  const npm_version_for_name = async (name) => {
    const lock = new JSONFile(".tsmonolock");
    if (!(name in lock.json)) {
      const r = await fetch_from_registry(name);
      if (r.error)
        return void 0;
      lock.json[name] = `^${r["dist-tags"].latest}`;
      lock.flush();
    }
    return lock.json[name];
  };
  return {
    fetch_from_registry,
    npm_version_for_name
  };
};

// src/tsmono.ts
var import_argparse = __toESM(require_argparse());
var import_os = __toESM(require("os"));
var import_chalk3 = __toESM(require_source());

// src/debug.ts
var debug = (process.env["DEBUG"] || "").split(":");
var do_debug_help = debug.length > 0 && !debug.includes("hide-help");
var debug_help = (msg) => {
  if (do_debug_help)
    console.log(msg);
};
debug_help("env DEBUG found");
debug_help("export DEBUG='no-help' to avoid this message");
debug_help("export DEBUG='moduleA:moduleB' to show debug messages of moduleA and moduleB");
debug_help("export DEBUG='true:-moduleA' to show debug messages except those of moduleA");
debug_help("Watch for lines starting with debug-list:  to find all loaded modules you focus on or block");
var debug_default = (module2) => {
  if (do_debug_help)
    console.log("debug-list:", module2);
  const log = debug.includes(module2) || debug.includes("true") && !debug.includes(`-${module2}`);
  const fun = log ? (...args2) => {
    console.log("DEBUG:", module2, ...args2);
  } : () => {
  };
  fun.log = log;
  return fun;
};

// src/tsmono.ts
var fs5 = __toESM(require_lib());
var path3 = __toESM(require("path"));
var import_os2 = require("os");
var import_path3 = require("path");

// src/lock.ts
var createLock = ({ preventExit }) => {
  let locked = false;
  const waiting_list = [];
  let preventExitInterval;
  const next = () => {
    const n = waiting_list.shift();
    if (n)
      n(next);
    else {
      locked = false;
      clearInterval(preventExitInterval);
    }
  };
  if (preventExit && !preventExitInterval) {
    preventExitInterval = setInterval(() => {
    }, 1e5);
  }
  return {
    "aquire_lock": () => {
      let resolve2;
      let p = new Promise((r, j) => {
        resolve2 = r;
      });
      if (locked) {
        waiting_list.push(resolve2);
      } else {
        locked = true;
        resolve2(next);
      }
      return p;
    }
  };
};

// src/utils-restartable-processes/index.ts
var import_child_process = require("child_process");
var import_chalk = __toESM(require_source());
var import_fs = __toESM(require("fs"));
var restartable_processes = () => {
  const processes = {};
  const spawn2 = (key_and_name, cmd, args2, echo) => new Promise((r, j) => {
    var _a2, _b;
    let out = "";
    if (processes[key_and_name]) {
      console.log("killing");
      processes[key_and_name].kill();
    }
    const y = (0, import_child_process.spawn)(cmd, args2, { stdio: [void 0, "pipe", 1] });
    console.log(`== ${key_and_name} spawned`);
    processes[key_and_name] = y;
    (_a2 = y.stdout) == null ? void 0 : _a2.on("data", (s) => {
      out += s;
      if (echo)
        console.log("" + s);
    });
    (_b = y.stderr) == null ? void 0 : _b.on("data", (s) => {
      out += s;
      if (echo)
        console.log("" + s);
    });
    processes[key_and_name].on("close", (code, signal) => {
      if (code == 0)
        r(void 0);
      import_fs.default.writeFileSync(`${key_and_name}.log`, out);
      console.log(`== ${key_and_name} exited with : ${code} `);
      if (!echo)
        console.log(out);
      if (code == 0)
        console.log(import_chalk.default.green(`${key_and_name} exited gracefully`));
      else
        console.log(import_chalk.default.red(`${key_and_name} exited with code ${code}`));
      j(`code ${code}`);
      delete processes[key_and_name];
    });
  });
  const kill_all = () => {
    for (let [k, v] of Object.entries(processes)) {
      console.log(import_chalk.default.red(`killing ${k}`));
      try {
        v.kill();
      } catch (e) {
      }
    }
  };
  return {
    spawn: spawn2,
    kill_all
  };
};

// src/index.ts
var fs4 = __toESM(require_lib());
var import_chalk2 = __toESM(require_source());
var path2 = __toESM(require("path"));
var import_child_process2 = require("child_process");
var import_deepmerge = __toESM(require_umd());
var import_path2 = require("path");
var import_json_file_plus = __toESM(require_json_file_plus());

// src/patches.ts
var patches = {
  // ts-tream from npm didn't know how to import the transformer batcher thus using source
  "ts-stream": {
    // srcdir: "src/lib"
    tsmono: {
      js_like_source: {
        links: {
          "src/lib": "ts-stream"
        }
      }
    }
  },
  "react": { npm_also_types: true },
  "underscore": { npm_also_types: true },
  "argparse": { npm_also_types: true },
  "react-dom": { npm_also_types: true },
  "react-router-dom": { npm_also_types: true },
  "moment": { npm_also_types: true },
  "momentjs": { notes: [`I'ts recommended to switch to alternatives for new projects only because it is not COW. https://momentjs.com/docs/#/-project-status/future/ - if in doubt try day.js for size reasons`] },
  "bluebird": { npm_also_types: true },
  "deep-equal": { npm_also_types: true },
  "chalk": { npm_also_types: true },
  "axios": { npm_also_types: true },
  "qs": { npm_also_types: true },
  "lodash": { npm_also_types: true },
  "webpack-hot-middleware": { npm_also_types: true },
  "webpack-dev-middleware": { npm_also_types: true },
  "webpack-merge": { npm_also_types: true },
  "mithril": { npm_also_types: true },
  "puppeteer": { npm_also_types: true },
  "fs-extra": { npm_also_types: true },
  "express": { npm_also_types: true },
  "express-promise-router": { npm_also_types: true },
  "express-session": { npm_also_types: true },
  "express-rate-limit": { npm_also_types: true },
  "hyper": { npm_also_types: true },
  "common-tags": { npm_also_types: true },
  "cors": { npm_also_types: true },
  "morgan": { npm_also_types: true },
  "imagemin-webp": { npm_also_types: true },
  "image-size": { npm_also_types: true },
  "send": { npm_also_types: true },
  "pg": { npm_also_types: true },
  "tmp": { npm_also_types: true },
  "prefresh": {
    provides: [
      "@prefresh/vite",
      "@prefresh/core",
      "@prefresh/utils"
    ],
    tsmono: {
      js_like_source: {
        links: {
          "packages/core": "@prefresh/core",
          "packages/utils": "@prefresh/utils",
          "packages/vite": "@prefresh/vite",
          "packages/babel/src/index.mjs": "@prefresh/babel-plugin/index.js"
          // 'packages/vite/src/index.js': '@prefresh/vite/index.js',
          // 'packages/vite/index.d.ts': '@prefresh/vite/index.d.ts',
        },
        paths: {
          "@prefresh/babel-plugin": ["@prefresh/babel-plugin"],
          "@prefresh/babel-plugin/*": ["@prefresh/babel-plugin/*"]
        }
      }
    }
  },
  "preact-preset-vite": {
    provides: [
      "@preact/preset-vite"
    ],
    tsmono: {
      js_like_source: {
        links: {
          "src": "@preact/preset-vite"
        }
      }
    }
  },
  "vite": {
    // srcdir: 'packages/vite/src/node',
    // srcdir: "src/lib"
    // use dependencies_from_package_jsons
    // package_jsons: ['package.json', 'packages/vite/package.json', 'packages/playground/ssr-react/package.json'],
    allDevDependencies: true,
    tsmono: {
      js_like_source: {
        links: {
          "packages/vite/src/node": "vite",
          "packages/vite/src/client": "vite-client"
        },
        paths: {
          "vite/dist/client/*": ["vite-client/*"]
        },
        dependencies_from_package_jsons: ["packages/vite/package.json", "package.json"]
        // paths: {
        //     "@prefresh/babel-plugin":  ["@prefresh/babel-plugin"],
        //     "@prefresh/babel-plugin/*":  ["@prefresh/babel-plugin/*"],
        // }
      }
    }
  }
};
var provided_by = {};
var _a;
for (let [k, v] of Object.entries(patches)) {
  for (let p of (_a = v.provides) != null ? _a : []) {
    provided_by[p] = k;
  }
}

// src/library-notes.ts
var notes = {
  "dayjs": `mind utils-dayjs using unexpected failure`,
  "momentjs": "use date-fns instead cause its maintained and smaller",
  "knex-abstract": "looks broken by design due to Knex.init() - how to have multiple connections ?"
};
var library_notes_default = notes;

// src/index.ts
var debug2 = debug_default("tsmono");
var readJsonFile = async (path4) => {
  console.log("reading", path4);
  const jf = await (0, import_json_file_plus.default)(path4);
  return jf.data;
};
var info = (...args2) => {
  if (!silent)
    console.log(...args2);
};
var t_cfg = {
  silent: false,
  info,
  warning: info,
  verbose: info
};
var silent = false;
var clone = (x) => {
  return x === void 0 ? void 0 : JSON.parse(JSON.stringify(x));
};
var unique = (x) => {
  return x.filter((v, i) => x.indexOf(v) === i);
};
var del_if_exists = (path4) => {
  try {
    fs4.unlinkSync(path4);
  } catch (e) {
  }
};
var run = async (cmd, opts) => {
  const args2 = opts.args || [];
  console.log("args", args2);
  t_cfg.info("running", cmd, args2, "in", opts.cwd);
  let stdout = "";
  let stderr = "";
  await new Promise((a, b) => {
    const child = (0, import_child_process2.spawn)(cmd, args2, Object.assign(opts, {
      stdio: ["stdin" in opts ? "pipe" : 0, opts.stdout1 ? 1 : "pipe", "pipe"]
    }));
    if (child.stdin) {
      if ("stdin" in opts && child.stdin) {
        t_cfg.verbose("stdin is", opts.stdin);
        child.stdin.setEncoding("utf8");
        child.stdin.write(opts.stdin);
      }
      child.stdin.end();
    }
    if (child.stdout)
      child.stdout.on("data", (s) => stdout += s);
    if (child.stderr)
      child.stderr.on("data", (s) => stderr += s);
    child.on("close", (code, signal) => {
      if ((opts.expected_exitcodes || [0]).includes(code))
        a(void 0);
      else
        b(`${cmd.toString()} ${args2.join(" ").toString()} failed with code ${code}
stdout:
${stdout}
stderr:
${stderr}`);
    });
  });
  return stdout;
};
var parse_dependency = (s, origin) => {
  var _a2;
  const l = s.split(";");
  const r = { name: l[0] };
  if (/git\+https/.test(r.name)) {
    r.url = r.name;
    r.name = path2.basename(r.name).replace(/\.git$/, "");
  }
  if ((_a2 = patches[r.name]) == null ? void 0 : _a2.npm_also_types) {
    r.types = true;
  }
  for (const v of l.slice(1)) {
    let x = v.split("=");
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
        r.package_jsons = [...r.package_jsons || [], x[1]];
      else
        throw new Error(`bad key=name pair: ${v}`);
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
  if (origin !== void 0)
    r.origin = origin;
  return r;
};
var backup_file = (path4) => {
  if (fs4.existsSync(path4)) {
    const bak = `${path4}.bak`;
    if (fs4.existsSync(bak))
      fs4.renameSync(path4, bak);
  }
};
var get_path = (...args2) => {
  let r = args2[0];
  for (const v of args2.slice(1, -1)) {
    try {
      if (!(v in r))
        return args2[args2.length - 1];
    } catch (e) {
      throw new Error(`get_path problem getting key ${v}, args ${args2}`);
    }
    r = r[v];
  }
  return r;
};
var ensure_path = (obj, ...args2) => {
  const e = args2.length - 2;
  for (let i = 0, len = e; i <= e; i++) {
    const k = args2[i];
    if (i === e) {
      obj[k] = obj[k] || args2[e + 1];
      return obj[k];
    }
    obj[k] = obj[k] || {};
    obj = obj[k];
  }
};
var TSMONOJSONFile = class extends JSONFile {
  init(cfg, tsconfig) {
    ensure_path(this.json, "name", "");
    ensure_path(this.json, "version", "0.0.0");
    ensure_path(this.json, "dependencies", []);
    ensure_path(this.json, "devDependencies", []);
    ensure_path(this.json, "tsconfig", tsconfig);
  }
  dirs(cfg) {
    var _a2;
    return unique([
      ...(_a2 = cfg.directories) != null ? _a2 : [],
      ...get_path(this.json, "tsmono", "directories", ["../"])
    ]);
  }
  // dependencies(){
  //   return {
  //     'dependencies': get_path(this.json, 'dependencies', []),
  //     'devDependencies': get_path(this.json, 'devDependencies', [])
  //   }
  // }
};
var map_package_dependencies_to_tsmono_dependencies = (versions) => {
  const r = [];
  for (const [k, v] of Object.entries(versions)) {
    r.push(`${k};version=${v}`);
  }
  return r;
};
var dependency_to_str = (d) => {
  return `${d.name} ${d.npm && d.repository ? "npm and repository?" : d.repository ? `from ${d.repository.path}` : `from npm ${d.version ? d.version : ""}`} requested from ${d.origin}`;
};
var DependencyCollection = class {
  constructor(cfg, origin, dirs) {
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
  print_warnings() {
    var _a2;
    for (const [k, v] of Object.entries(this.dependency_locactions)) {
      const notes2 = (_a2 = patches[k]) == null ? void 0 : _a2.notes;
      if (notes2) {
        console.log(import_chalk2.default.magenta(`HINT: ${k} repo: ${v[0].origin} ${notes2.join("\n")}`));
      }
      const npms = v.filter((x) => x.npm);
      const no_npms = v.filter((x) => !x.npm);
      if (npms.length > 0 && no_npms.length > 0)
        t_cfg.warning(`WARNING: ${this.origin} dependency ${k} requested as npm and from disk, choosing first ${v.map(dependency_to_str).join("\n")}`);
      const package_json_cache = {};
      let all_versions = [];
      const with_version = v.map((dep) => {
        var _a3;
        const f = (x) => x.replace("^", "");
        const versions = [];
        if (dep.version)
          versions.push(f(dep.version));
        if (dep.origin) {
          const ps = (_a3 = dep.package_jsons) != null ? _a3 : [`${dep.origin}/package.json`];
          for (let p of ps) {
            if (!(dep.origin in package_json_cache) && fs4.existsSync(p)) {
              package_json_cache[p] = parse_json_file(p);
              ["dependencies", "devDependencies"].forEach((d) => {
                const x = dep.origin === void 0 ? void 0 : get_path(package_json_cache[p], d, k, void 0);
                if (x !== void 0)
                  versions.push(f(x));
              });
            } else if (dep.version) {
              versions.push(f(dep.version));
            }
          }
        }
        all_versions = [...all_versions, ...versions];
        return { dep, versions };
      }).filter((x) => x.versions.length > 0);
      if (unique(all_versions).length > 1) {
        t_cfg.warning(`WARNING: ${this.origin} transient dependencies ${k} with competing versions found:`);
        for (const v2 of with_version) {
          t_cfg.warning(v2.dep.origin, v2.versions);
        }
      }
    }
    for (let w of unique(this.warnings)) {
      console.log("!!!! > " + w);
    }
  }
  dependencies_of_repository(r, dev, o) {
    var _a2;
    const deps = r.dependencies(o);
    for (let [k, v] of Object.entries(deps.paths)) {
      this.paths[k] = [...(_a2 = this.paths[k]) != null ? _a2 : [], ...v];
    }
    if (o.addLinks) {
      for (let [k, v] of Object.entries(deps.links)) {
        const from = path2.join(r.path, k);
        const o2 = this.links[from];
        if (o2 && o2 != v)
          debug2(`warning, overwriting link ${o2} ${v}`);
        this.links[from] = v;
      }
    }
    const add2 = (key, filter = (x) => true) => {
      this.todo = [...this.todo, ...deps[key]];
      this[key] = [...this[key], ...deps[key].map((x) => x.name).filter(filter)];
    };
    add2("dependencies");
    if (dev === true || dev === "dev-types")
      add2("devDependencies", (x) => dev !== "dev-types" || /^@types/.test(x));
  }
  do() {
    let next;
    while (next = this.todo.shift()) {
      if (next.name in library_notes_default)
        this.warnings.push(`WARNING for using library ${next.name}: ${library_notes_default[next.name]}`);
      this.find_and_recurse_dependency(next);
    }
  }
  find_and_recurse_dependency(dep) {
    var _a2;
    const locations = ensure_path(this.dependency_locactions, dep.name, []);
    locations.push(dep);
    if (this.recursed.includes(dep.name))
      return;
    this.recursed.push(dep.name);
    if (dep.npm)
      return;
    console.log("searching", dep);
    let dirs_lookup = this.dirs.map((x) => {
      var _a3;
      return path2.join(x, (_a3 = provided_by[dep.name]) != null ? _a3 : dep.name);
    });
    dirs_lookup = [...dirs_lookup, ...dirs_lookup.map((x) => `${(0, import_path2.dirname)(x)}/ts-${(0, import_path2.basename)(x)}`)];
    t_cfg.verbose("dirs_lookup", dirs_lookup);
    const d = dirs_lookup.find((dir) => fs4.existsSync(dir));
    if (!d) {
      info(`dependency ${dependency_to_str(dep)} not found, forcing npm`);
      dep.npm = true;
      return;
    }
    console.log("dep=", dep);
    const r = new Repository(this.cfg, d, { dependency: dep });
    dep.repository = r;
    this.dependencies_of_repository(r, ((_a2 = patches[dep.name]) == null ? void 0 : _a2.allDevDependencies) ? true : "dev-types", { addLinks: true });
  }
};
var Repository = class {
  constructor(cfg, path4, o) {
    this.cfg = cfg;
    this.path = path4;
    var _a2;
    this.basename = (0, import_path2.basename)(path4);
    if (/\/\//.test(path4))
      throw new Error(`bad path ${path4}`);
    this.tsmonojson = new TSMONOJSONFile(`${path4}/tsmono.json`);
    const p = ((_a2 = o.dependency) == null ? void 0 : _a2.package_jsons) || ["package.json"];
    this.packagejson_paths = p.map((x) => `${path4}/${x}`);
    this.packagejsons = this.packagejson_paths.map((x) => new JSONFile(x));
  }
  tsmono_json_with_patches() {
    var _a2, _b;
    return import_deepmerge.default.all([{}, this.tsmonojson, (_b = (_a2 = patches[this.basename]) == null ? void 0 : _a2.tsmono) != null ? _b : {}]);
  }
  repositories(opts) {
    const dep_collection = new DependencyCollection(this.cfg, this.path, this.tsmonojson.dirs(this.cfg));
    dep_collection.dependencies_of_repository(this, true, { addLinks: false });
    dep_collection.do();
    dep_collection.print_warnings();
    const result = [];
    if (opts && opts.includeThis)
      result.push(this);
    const seen = [];
    for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      const r = v[0].repository;
      if (r) {
        if (seen.includes(r.path))
          continue;
        seen.push(r.path);
        result.push(r);
      }
    }
    return result;
  }
  flush() {
    this.tsmonojson.flush();
    for (let v of this.packagejsons) {
      v.flush();
    }
  }
  init() {
    const tsconfig = path2.join(this.path, "tsconfig.json");
    this.tsmonojson.init(this.cfg, fs4.existsSync(tsconfig) ? parse_json_file(tsconfig) : {});
  }
  tsmono_json_contents() {
    const p = path2.join(this.path, "tsmono.json");
    return fs4.existsSync(p) ? parse_json_file(p) : {};
  }
  dependencies(o) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const to_dependency = (dep) => parse_dependency(dep, this.path);
    const presets = (key) => {
      const c_presets = get_path(this.tsmonojson.json, "presets", {});
      return Object.keys(c_presets).map((p) => get_path(presets, p, key, [])).flat(1);
    };
    const tsmono_json = import_deepmerge.default.all([{}, this.tsmono_json_contents(), (_b = (_a2 = patches[this.basename]) == null ? void 0 : _a2.tsmono) != null ? _b : {}]);
    const package_jsons_paths = ((_d = (_c = tsmono_json == null ? void 0 : tsmono_json.js_like_source) == null ? void 0 : _c.dependencies_from_package_jsons) != null ? _d : ["package.json"]).map((x) => path2.join(this.path, x));
    const package_jsons = package_jsons_paths.filter((x) => fs4.existsSync(x)).map(parse_json_file);
    const links = () => {
      const src = path2.join(this.path, "src");
      const k = fs4.existsSync(src) ? "src" : "";
      return { [k]: this.basename };
    };
    const package_json_dependencies = package_jsons.map((x) => {
      var _a3;
      return map_package_dependencies_to_tsmono_dependencies((_a3 = x.dependencies) != null ? _a3 : []);
    }).flat();
    const package_json_devDependencies = package_jsons.map((x) => {
      var _a3;
      return map_package_dependencies_to_tsmono_dependencies((_a3 = x.devDependencies) != null ? _a3 : []);
    }).flat();
    const f = (x) => !/version=(workspace:\*|link:.\/types)$/.test(x);
    const deps = {
      dependencies: [...package_json_dependencies, ...(_e = tsmono_json.dependencies) != null ? _e : []].filter(f).map(to_dependency),
      devDependencies: [...package_json_devDependencies, ...(_f = tsmono_json.devDependencies) != null ? _f : []].filter(f).map(to_dependency),
      links: (_h = (_g = tsmono_json == null ? void 0 : tsmono_json.js_like_source) == null ? void 0 : _g.links) != null ? _h : links(),
      paths: (_j = (_i = tsmono_json == null ? void 0 : tsmono_json.js_like_source) == null ? void 0 : _i.paths) != null ? _j : {}
    };
    console.log("deps of ", this.path, deps);
    return deps;
  }
  async update(cfg, opts = {}) {
    if (!fs4.existsSync(`${this.path}/tsmono.json`)) {
      info("!! NO tsmono.json found, only trying to install npm packages");
      if (opts.install_npm_packages && fs4.existsSync(`${this.path}/package.json`)) {
        info(`running ${cfg.npm_install_cmd} in dependency ${this.path}`);
        await run(cfg.npm_install_cmd[0], { args: cfg.npm_install_cmd.slice(1), cwd: this.path });
      }
      return;
    }
    const this_tsmono = `${this.path}/src/tsmono`;
    const link_dir = `${this_tsmono}`;
    if (opts.link_to_links) {
      if (fs4.existsSync(this_tsmono))
        fs4.removeSync(this_tsmono);
    } else {
      if (fs4.existsSync(this_tsmono))
        fs4.removeSync(this_tsmono);
    }
    const cwd = process.cwd();
    const tsmonojson = this.tsmonojson.json || {};
    let package_json = clone(get_path(tsmonojson, "package", {}));
    if (package_json === void 0) {
      package_json = {};
    }
    package_json.dependencies = {};
    package_json.devDependencies = {};
    delete package_json.tsconfig;
    const tsconfig = {};
    const dep_collection = new DependencyCollection(cfg, this.path, this.tsmonojson.dirs(this.cfg));
    dep_collection.dependencies_of_repository(this, true, { addLinks: false });
    dep_collection.do();
    dep_collection.print_warnings();
    const expected_symlinks = {};
    const expected_tools = {};
    const paths = {};
    const paths_add = (lhs, rhs) => {
      const lhs_a = ensure_path(paths, lhs, []);
      if (!lhs_a.includes(rhs)) {
        lhs_a.push(rhs);
      }
    };
    for (let [k, v] of Object.entries(dep_collection.links)) {
      if (opts.link_to_links) {
        expected_symlinks[`${link_dir}/${v.replace(/^ts-/, "")}`] = path2.relative(path2.join(link_dir, path2.dirname(v)), path2.resolve(cwd, k));
        paths_add(`${v.replace(/^ts-/, "")}/*`, `src/tsmono/${v.replace(/^ts-/, "")}/*`);
        paths_add(v.replace(/^ts-/, ""), `src/tsmono/${v.replace(/^ts-/, "")}`);
      }
    }
    for (let [k, v] of Object.entries(dep_collection.paths)) {
      for (let v2 of v) {
        paths_add(k, `src/tsmono/${v2}`);
      }
    }
    for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      if (v[0].repository) {
        const src_tool = `${v[0].repository.path}/src/tool`;
        (fs4.existsSync(src_tool) ? fs4.readdirSync(src_tool) : []).forEach((x) => {
          const match = /([^/\\]*)(\.ts)/.exec(x);
          if (match) {
            expected_tools[match[1]] = x;
          }
        });
      }
    }
    const fix_ts_config = (x) => {
      ensure_path(x, "compilerOptions", {});
      ensure_path(x, "compilerOptions", "preserveSymlinks", true);
      ensure_path(x, "compilerOptions", "esModuleInterop", true);
      ensure_path(x, "compilerOptions", "moduleResolution", "node");
      ensure_path(x, "compilerOptions", "module", "commonjs");
      ensure_path(x, "compilerOptions", "target", "esnext");
      ensure_path(x, "compilerOptions", "strict", true);
      ensure_path(x, "compilerOptions", "lib", [
        "es5",
        "es6",
        // array.find
        "dom",
        "es2015.promise",
        "es2015.collection",
        "es2015.iterable",
        "es2019",
        // [].flat()
        "dom",
        "dom.iterable"
        // for (const x in el.children)
      ]);
      if ("paths" in x.compilerOptions) {
        if (!("baseUrl" in x.compilerOptions)) {
          x.compilerOptions.baseUrl = ".";
        } else {
          throw `please drop baseUrl from your config in ${this.path}. cause we have paths e.g. due to referenced dependencies it should be '.'`;
        }
      }
      ensure_path(x, "compilerOptions", "paths", this.basename, ["src/*"]);
      x.compilerOptions.allowSyntheticDefaultImports = true;
      x.compilerOptions.esModuleInterop = true;
      ensure_path(x, "compilerOptions", "outDir", "./dist");
      for (const key of ["outDir", "outFile"]) {
        if (x.compilerOptions[key])
          ensure_path(x, "exclude", []).push(x.compilerOptions[key]);
      }
      return x;
    };
    const path_for_tsconfig = (x) => {
      return { compilerOptions: { paths } };
    };
    if ("tsconfigs" in tsmonojson) {
      for (const [path_, merge] of Object.entries(tsmonojson.tsconfigs)) {
        info("tsconfig.json path", path_);
        fs4.writeFileSync(path2.join(path_, `tsconfig.json`), JSON.stringify(fix_ts_config(import_deepmerge.default.all([tsmonojson.tsconfig || {}, path_for_tsconfig(path_), tsconfig, merge])), void 0, 2), "utf8");
      }
    } else if ("tsconfig" in tsmonojson || Object.keys(path_for_tsconfig("")).length > 0) {
      const tsconfig_path = path2.join(this.path, "tsconfig.json");
      const json = JSON.stringify(fix_ts_config((0, import_deepmerge.default)(tsmonojson.tsconfig || {}, path_for_tsconfig(this.path), tsconfig)), void 0, 2);
      protect(tsconfig_path, () => {
        fs4.writeFileSync(tsconfig_path, json, "utf8");
      }, opts.force);
    }
    if (opts.link_to_links) {
      for (const [k, v] of Object.entries(expected_tools)) {
        ["tsmono/tools", "tsmono/tools-bin", "tsmono/tools-bin-check"].forEach((x) => {
          if (!fs4.existsSync(x))
            fs4.mkdirSync(x);
        });
        expected_symlinks[`${this.path}/}tsmono/tools/${k}`] = v;
        const t = `tsmono/tools-bin/${k}`;
        del_if_exists(t);
        fs4.writeFileSync(t, `#!/bin/sh
node -r ts-node/register/transpile-only -r tsconfig-paths/register ${v} "$@" `, "utf8");
        fs4.writeFileSync(`tsmono/tools-bin-check/${k}`, `#!/bin/sh
node -r ts-node/register-only -r tsconfig-paths/register ${v} "$@"`, "utf8");
      }
    }
    for (const [k, v] of Object.entries(expected_symlinks)) {
      del_if_exists(k);
      fs4.mkdirpSync((0, import_path2.dirname)(k));
      info(`symlinking ${k} -> ${v}`);
      if (tsmonojson.rsync_instead_of_symlink) {
        await run("rsync", { args: ["-ra", `${path2.join("src/tsmono", v)}/`, `${k}/`] });
      } else {
        fs4.symlinkSync(v, k);
      }
    }
    ensure_path(package_json, "dependencies", {});
    ensure_path(package_json, "devDependencies", {});
    const add_dep = async (dep, first, dep_name) => {
      if (first.url) {
        if (/git\+https/.test(first.url)) {
          ensure_path(package_json, dep, first.name, first.url);
        } else {
          throw new Error(`cannot cope with url ${first.url} yet, no git+https, fix code`);
        }
      } else
        ensure_path(package_json, dep, dep_name, "version" in first ? first.version : await cfg.npm_version_for_name(dep_name));
    };
    const add_npm_packages = async (dep) => {
      for (const dep_name of dep_collection[dep]) {
        const first = dep_collection.dependency_locactions[dep_name][0];
        if (!first.npm)
          continue;
        debug2("adding npm", dep_name, first);
        await add_dep(dep, first, dep_name);
        if (first.types) {
          const type_name = `@types/${dep_name}`;
          const type_version = await cfg.npm_version_for_name(type_name);
          debug2(`got type version ${type_name} ${type_version}`);
          if (type_version !== void 0)
            ensure_path(package_json, "devDependencies", type_name, await cfg.npm_version_for_name(type_name));
        }
      }
    };
    ensure_path(package_json, "devDependencies", "ts-node", await cfg.npm_version_for_name("ts-node"));
    await add_npm_packages("dependencies");
    await add_npm_packages("devDependencies");
    backup_file(package_json.path);
    this.packagejsons[0].json = package_json;
    this.packagejsons[0].flush_protect_user_changes(opts.force);
    if (opts.install_npm_packages) {
      debug2("install_npm_packages");
      const to_be_installed = fs4.readFileSync(this.packagejson_paths[0], "utf8");
      const p_installed = `${this.packagejson_paths[0]}.installed`;
      const installed = fs4.existsSync(p_installed) ? fs4.readFileSync(p_installed, "utf8") : void 0;
      info("deciding to run npm_install_cmd in", this.path, this.packagejson_paths[0], p_installed, installed === to_be_installed);
      if (installed !== to_be_installed || !fs4.existsSync(path2.join(this.path, "node_modules"))) {
        await run(cfg.npm_install_cmd[0], { args: cfg.npm_install_cmd.slice(1), cwd: this.path });
      }
      fs4.writeFileSync(p_installed, to_be_installed);
    }
    if (opts.symlink_node_modules_hack) {
      for (const dir of this.tsmonojson.dirs(this.cfg)) {
        const n = `${dir}/node_modules`;
        if (fs4.existsSync(n)) {
          fs4.unlinkSync(n);
        }
        info(`hack: symlinking node modules to ${n} ${path2.relative(dir, `${this.path}/node_modules`)}`);
        fs4.symlinkSync(path2.relative(dir, `${this.path}/node_modules`), n);
      }
    }
    if (opts.recurse) {
      const opts2 = clone(opts);
      opts2.symlink_node_modules_hack = false;
      const repositories = Object.values(dep_collection.dependency_locactions).map((x) => x[0].repository);
      for (const r of repositories) {
        if (r === void 0)
          continue;
        info(`recursing into dependency ${r.path}`);
        await r.update(cfg, opts2);
      }
    }
  }
  async add(cfg, dependencies, devDependencies) {
    this.init();
    const j = this.tsmonojson.json;
    j.dependencies = [...j.dependencies, ...dependencies.filter((x) => !(j.dependencies || []).includes(x))];
    j.devDependencies = [...j.devDependencies, ...devDependencies.filter((x) => !(j.devDependencies || []).includes(x))];
    await this.update(cfg, { link_to_links: true, install_npm_packages: true });
  }
};
var tslint_hack = async ({ cfg, p }) => {
  if (!fs4.existsSync("tslint.json")) {
    fs4.writeFileSync("tslint.json", `
    {
        "extends": [
            "tslint:recommended"
        ],
        "rules": {
            "no-floating-promises": true,
            "no-return-await": true,
            "await-promise": [true, "PromiseLike"],
            "max-line-length": false,
            "variable-name": false
        }
    }
    `, "utf8");
  } else {
    const j = parse_json_file("tslint.json");
    if (!j.rules["no-floating-promises"] && !j.rules["await-promise"])
      throw new Error(`please add

            "no-floating-promises": true,
            "no-return-await": true,
            "await-promise": [true, "PromiseLike"],

            to your tslint.json 's rules section because it might save your ass
      `);
  }
};
var dot_git_ignore_hack = async (cfg) => {
  if (!fs4.pathExistsSync("tsmono.json"))
    return;
  const f = ".gitignore";
  const lines = (fs4.existsSync(f) ? fs4.readFileSync(f, "utf8") : "").split("\n");
  const to_be_added = [
    "/node_modules",
    "/.vscode",
    "/dist",
    "/.fyn",
    "/tsconfig.json.protect",
    "/package.json.installed",
    "/package.json.protect",
    "/package.json",
    // derived by tsmono, but could be comitted
    "/tsconfig.json",
    // derived by tsmono, contains local setup paths
    "/src/tsmono"
  ].filter((a) => !lines.find((x) => x.startsWith(a)));
  if (to_be_added.length > 0) {
    fs4.writeFileSync(f, [...lines, ...to_be_added].join("\n"), "utf8");
  }
};
var update = async ({ cfg, p }, flags) => {
  await p.update(cfg, { link_to_links: flags.link_to_links, install_npm_packages: true, symlink_node_modules_hack: flags.symlink_node_modules_hack, recurse: flags.recurse, force: flags.force });
};
var action_update = async (o) => {
  const p = new Repository(o.cfg, o.cwd, {});
  const cp = { cfg: o.cfg, p };
  await update(cp, o.flags);
  await tslint_hack(cp);
  await dot_git_ignore_hack(o.cfg);
  t_cfg.silent = true;
  const lines = [];
  for (const r of p.repositories()) {
    lines.push(`dep-basename: ${path2.basename(r.path)}`);
  }
  const local_deps_file = ".tsmono-local-deps";
  if (!fs4.pathExistsSync(local_deps_file)) {
    console.log(import_chalk2.default.red(`please commit ${local_deps_file}`));
  }
  fs4.writeFileSync(local_deps_file, lines.join("\n"), "utf-8");
  return;
};

// src/tsmono.ts
var debug3 = debug_default("tsmono");
var parser = new import_argparse.ArgumentParser({
  add_help: true,
  description: `tsmono (typescript monorepository), see github's README file`
  // version: "0.0.1",  add_argument(..., { action: 'version', version: 'N', ... }) 
});
var sp = parser.add_subparsers({
  title: "sub commands",
  dest: "main_action"
});
var init = sp.add_parser("init", { add_help: true });
var add = sp.add_parser("add", { add_help: true });
add.add_argument("args", { nargs: "*" });
var care_about_remote_checkout = (x) => x.add_argument("--care-about-remote-checkout", { action: "store_true", help: "on remote site update the checked out repository and make sure they are clean" });
var update2 = sp.add_parser("update", { add_help: true, description: "This also is default action" });
update2.add_argument("--symlink-node-modules-hack", { action: "store_true" });
update2.add_argument("--link-via-root-dirs", { action: "store_true", help: "add dependencies by populating root-dirs. See README " });
update2.add_argument("--link-to-links", { action: "store_true", help: "link ts dependencies to tsmono/links/* using symlinks. Useful to use ctrl-p in vscode to find files. On Windows 10 cconsider activating dev mode to allow creating symlinks without special priviledges." });
update2.add_argument("--recurse", { action: "store_true" });
update2.add_argument("--force", { action: "store_true" });
var zip = sp.add_parser("zip", { add_help: true, description: "This also is default action" });
var print_config_path = sp.add_parser("print-config-path", { add_help: true, description: "print tsmon.json path location" });
var write_config_path = sp.add_parser("write-sample-config", { add_help: true, description: "write sample configuration file" });
write_config_path.add_argument("--force", { action: "store_true" });
var echo_config_path = sp.add_parser("echo-sample-config", { add_help: true, description: "echo sample config for TSMONO_CONFIG_JSON env var" });
var update_using_rootDirs = sp.add_parser("update-using-rootDirs", { add_help: true, description: "Use rootDirs to link to dependencies essentially pulling all dependecnies, but also allowing to replace dependencies of dependencies this way" });
update_using_rootDirs.add_argument("--recurse", { action: "store_true" });
update_using_rootDirs.add_argument("--force", { action: "store_true" });
var commit_all = sp.add_parser("commit-all", { add_help: true, description: "commit all changes of this repository and dependencies" });
commit_all.add_argument("--force", { action: "store_true" });
commit_all.add_argument("-message", {});
var push = sp.add_parser("push-with-dependencies", { add_help: true, description: "upload to git repository" });
push.add_argument("--shell-on-changes", { action: "store_true", help: "open shell so that you can commit changes" });
push.add_argument("--git-push-remote-location-name", { help: "eg origin" });
care_about_remote_checkout(push);
push.add_argument("--config-json", { help: "See README.md" });
push.add_argument("--run-remote-command", { help: "remote ssh location to run git pull in user@host:path:cmd" });
var pull = sp.add_parser("pull-with-dependencies", { add_help: true, description: "pull current directory from remote location with dependencies" });
pull.add_argument("--update", { help: "if there is a tsmono.json also run tsmono update" });
pull.add_argument("--parallel", { action: "store_true", help: "run actions in parallel" });
pull.add_argument("--link-to-links", { help: "when --update use --link-to-links see update command for details" });
care_about_remote_checkout(pull);
var clean = sp.add_parser("is-clean", { add_help: true, description: "check whether git repositories on local/ remote side are clean" });
clean.add_argument("--no-local", { action: "store_true", help: "don't look at local directories" });
clean.add_argument("--no-remote", { action: "store_true", help: "don't	 look at remote directories" });
clean.add_argument("--shell", { action: "store_true", help: "if dirty start shell so that you can commit" });
var list_dependencies = sp.add_parser("list-local-dependencies", { add_help: true, description: "list dependencies" });
var from_json_files = sp.add_parser("from-json-files", { add_help: true, description: "try to create tsmono.json fom package.json and tsconfig.json file" });
push.add_argument("--force", { action: "store_true", help: "overwrites existing tsconfig.json file" });
var reinstall = sp.add_parser("reinstall-with-dependencies", { add_help: true, description: "removes node_modules and reinstalls to match current node version" });
reinstall.add_argument("--link-to-links", { action: "store_true", help: "link ts dependencies to tsmono/links/* using symlinks" });
var watch = sp.add_parser("watch", { add_help: true });
var esbuild_server_client_dev = sp.add_parser("esbuild-server-client-dev", { add_help: true, description: "experimental" });
esbuild_server_client_dev.add_argument("--server-ts-file", { help: "server.ts" });
esbuild_server_client_dev.add_argument("--web-ts-file", { help: "web client .ts files" });
var vite_server_and_api = sp.add_parser("vite-server-and-api", { add_help: true, description: "experimental" });
vite_server_and_api.add_argument("--server-ts-file", { help: "server.ts" });
vite_server_and_api.add_argument("--api-ts-file", { help: "server.ts like file providing API" });
var args = parser.parse_args();
var run_tasks = async (tasks) => {
  const lock = createLock({ preventExit: true });
  const with_user = async (run2) => {
    const release = await lock.aquire_lock();
    try {
      return await run2();
    } finally {
      release();
    }
  };
  await Promise.all(tasks.map(async (x) => {
    await with_user(async () => t_cfg.info(`starting ${x.task}`));
    await x.start({ with_user: (run2) => {
      return with_user(async () => {
        t_cfg.info(`!=== task ${x.task} requires your attention`);
        return run2();
      });
    } });
    await with_user(async () => t_cfg.info(`done ${x.task}`));
  }));
};
var main = async () => {
  const hd = (0, import_os2.homedir)();
  const cache = new DirectoryCache(`${hd}/.tsmono/cache`);
  const configDefaults = {
    cache,
    fetch_ttl_seconds: 60 * 24,
    bin_sh: "/bin/sh",
    npm_install_cmd: ["fyn"],
    cacheDir: "~/.tsmono/cache"
  };
  const json_or_empty = (s) => {
    if (s) {
      try {
        return JSON.parse(s);
      } catch (e) {
        throw `error parsing JSON ${s}`;
      }
    } else
      return {};
  };
  const config_from_home_dir_path = path3.join(hd, ".tsmmono.json");
  const env_configs = ["", "1", "2", "3"].map((x) => json_or_empty(process.env[`TSMONO_CONFIG_JSON${x}`]));
  const env_config2 = json_or_empty(process.env.TSMONO_CONFIG_JSON2);
  const homedir_config = json_or_empty(fs5.existsSync(config_from_home_dir_path) ? fs5.readFileSync(config_from_home_dir_path, "utf8") : void 0);
  const args_config = json_or_empty(args.config_json);
  const config = Object.assign({}, configDefaults, homedir_config, args_config, ...env_configs, env_config2);
  const cfg = { ...cfg_api(config), ...config };
  if (!(cfg.directories == void 0 || Array.isArray(cfg.directories)))
    throw `directories must be an array! Check your configs`;
  console.log(`configDefaults is ${JSON.stringify(configDefaults, void 0, 2)}`);
  console.log(`env_configs are ${JSON.stringify(env_configs, void 0, 2)}`);
  console.log(`env_config2export is ${JSON.stringify(env_config2, void 0, 2)}`);
  console.log(`homedir_config is ${JSON.stringify(homedir_config, void 0, 2)}`);
  console.log(`args_config is ${JSON.stringify(args_config, void 0, 2)}`);
  const ssh_cmd = (server) => async (stdin, args2) => {
    return run("ssh", { args: [server], stdin, ...args2 });
  };
  const p = new Repository(cfg, process.cwd(), {});
  const cp = { cfg, p };
  const ensure_is_git = async (r) => {
    if (!fs5.existsSync(path3.join(r.path, ".git"))) {
      console.log(`Please add .git so that this dependency ${r.path} can be pushed`);
      await run(cfg.bin_sh, { cwd: r.path, stdout1: true });
    }
  };
  if (args.main_action === "init") {
    p.init();
    return;
  }
  if (args.main_action === "add") {
    const d = [];
    const dd = [];
    let add2 = d;
    for (const v of args.args) {
      if (v === "-d") {
        add2 = dd;
      }
      dd.push(v);
    }
    await p.add(cfg, d, dd);
    return;
  }
  if (args.main_action === "zip") {
    console.log("TODO: zip target.zip $( echo tsconfig.json; echo package.json; find -L  src | grep -ve 'tsmono.*tsmono|\\.git'");
  }
  if (args.main_action === "update") {
    action_update({
      cfg,
      cwd: process.cwd(),
      flags: args
    });
  }
  if (args.main_action === "update_using_rootDirs") {
    await tslint_hack({ cfg, p });
    return;
  }
  if (args.main_action === "print-config-path") {
    console.log("config path:", config_from_home_dir_path);
    return;
  }
  if (args.main_action === "write-sample-config") {
    if (!fs5.existsSync(config_from_home_dir_path) || args.force) {
      fs5.writeFileSync(config_from_home_dir_path, config);
    } else {
      console.log(config_from_home_dir_path, "not written because it exists. Try --force");
    }
    return;
  }
  if (args.main_action === "echo-sample-config") {
    console.log(`TSMONO_CONFIG_JSON=${JSON.stringify(config)}`);
    return;
  }
  if (args.main_action === "add") {
    throw new Error("TODO");
  }
  if (args.main_action === "list-local-dependencies") {
    t_cfg.silent = true;
    const p2 = new Repository(cfg, process.cwd(), {});
    for (const r of p2.repositories()) {
      console.log("rel-path: ", r.path);
    }
  }
  if (args.main_action === "from-json-files") {
    if (fs5.existsSync("tsmono.json") && !args.force) {
      console.log("not overwriting tsmono.json, use --force");
      return;
    }
    console.log("pwd", process.cwd());
    const pwd = process.cwd();
    const package_contents = fs5.existsSync("package.json") ? await readJsonFile(path3.join(pwd, "./package.json")) : void 0;
    let tsconfig_contents = fs5.existsSync("tsconfig.json") ? await readJsonFile(path3.join(pwd, "./tsconfig.json")) : void 0;
    if (package_contents === void 0 && tsconfig_contents === void 0) {
      console.log("Neither package.json nor tsconfig.json found");
      return;
    }
    tsconfig_contents = tsconfig_contents || {};
    const tsmono_contents = {
      package: {},
      dependencies: [],
      devDependencies: [],
      tsconfig: tsconfig_contents || {}
    };
    for (const [k, v] of Object.entries(package_contents || {})) {
      if (k === "dependencies" || k === "devDependencies") {
        for (const [pack, version] of Object.entries(v)) {
          tsmono_contents[k].push(`${pack};version=${version}`);
        }
      } else {
        tsmono_contents.package[k] = v;
      }
    }
    fs5.writeFileSync("tsmono.json", JSON.stringify(tsmono_contents, void 0, 2), "utf8");
  }
  if (args.main_action === "pull-with-dependencies") {
    const cwd = process.cwd();
    const reponame = path3.basename(cwd);
    const rL = cfg["remote-location"];
    const sc = ssh_cmd(rL.server);
    let remote_exists = true;
    const items = await (async () => {
      if (!remote_exists)
        return [];
      try {
        const local_deps = (await sc(`
             cd ${rL["repositories-path-bare"]}/${reponame} && ( git show HEAD:.tsmono-local-deps )
           `)).split("\n").filter((x) => /dep-basename: /.test(x)).map((x) => path3.join("../", x.slice("dep-basename: ".length)));
        console.log(`local deps: ${local_deps}`);
        return local_deps;
      } catch (e) {
        console.log(import_chalk3.default.red(`error getting dependencies assuming empty list`));
        console.log(e);
        return [];
      }
    })();
    t_cfg.info("pulling " + JSON.stringify(items));
    const actions = [];
    for (const path_ of [`../${reponame}`, ...items]) {
      actions.push(async () => {
        t_cfg.info(`updating ${path_}`);
        const p_ = path3.join(cwd, path_);
        const repo = (0, import_path3.basename)(p_);
        if ((rL.ignoreWhenPulling || []).includes(repo))
          return;
        if (!fs5.existsSync(p_)) {
          t_cfg.info(`creating ${p_}`);
          fs5.mkdirpSync(p_);
        }
        if (remote_exists)
          await sc(`
            exec 2>&1
            set -x
            bare=${rL["repositories-path-bare"]}/${repo}
            repo=${rL["repositories-path-checked-out"]}/${repo}
            [ -d $bare ] || {
              mkdir -p $bare; ( cd $bare; git init --bare )
              ( cd $repo;
                git remote add origin ${path3.relative(path3.join(rL["repositories-path-checked-out"], repo), rL["repositories-path-bare"])}/${repo}
                git push --set-upstream origin master
              )
            }
            ${args.care_about_remote_checkout ? `( cd $repo; git pull  )` : ""}
            `);
        if (!fs5.existsSync(path3.join(p_, ".git/config"))) {
          await run("git", { args: ["clone", `${rL.server}:${rL["repositories-path-bare"]}/${repo}`, p_] });
        }
        t_cfg.info(`pulling ${p_} ..`);
        await run("git", { args: ["pull"], cwd: p_ });
        if (args.update && fs5.existsSync(path3.join(p_, "tsmono.json"))) {
          const p2 = new Repository(cfg, p_, {});
          await p2.update(cfg, {
            link_to_links: args.link_to_links,
            install_npm_packages: true,
            symlink_node_modules_hack: false,
            recurse: true,
            force: true
            // , update_cmd: {executable: "npm", args: ["i"]}
          });
        }
      });
    }
    if (args["parallel"]) {
      await Promise.all(actions.map((a) => a()));
    } else {
      for (let a of actions) {
        await a();
      }
    }
  }
  if (args.main_action === "is-clean") {
    t_cfg.info("using local dependencies as reference");
    const repositories = p.repositories({ includeThis: true });
    const rL = cfg["remote-location"];
    const sc = () => ssh_cmd(rL.server);
    const results = [];
    const check_local = (r) => async (o) => {
      const is_clean = async () => "" === await run("git", { args: ["diff"], cwd: r.path }) ? "clean" : "dirty";
      const clean_before = await is_clean();
      if (clean_before === "dirty" && args.shell) {
        await o.with_user(async () => {
          t_cfg.info(`${r.path} is not clean, starting shell`);
          await run(cfg.bin_sh, { cwd: r.path, stdout1: true });
        });
      }
      results.push(`${r.basename}: ${clean_before} -> ${await is_clean()}`);
    };
    const check_remote = (r) => async (o) => {
      const is_clean = async () => "" === await sc()(`cd ${rL["repositories-path-bare"]}/${r.basename}; git diff`) ? "clean" : "dirty";
      const clean_before = await is_clean();
      if (clean_before === "dirty" && args.shell) {
        await o.with_user(async () => {
          t_cfg.info(`${r.path} is not clean, starting shell`);
          await run("ssh", { args: [rL.server, `cd ${rL["repositories-path-checked-out"]}/${r.basename}; exec $SHELL -i`], stdout1: true });
        });
      }
      results.push(`remote ${r.basename}: ${clean_before} -> ${await is_clean()}`);
    };
    const tasks = [
      ...!args.no_local ? repositories.map((x) => ({ task: `local clean? ${x.path}`, start: check_local(x) })) : [],
      ...!args.no_remote ? repositories.map((x) => ({ task: `remote clean? ${x.path}`, start: check_remote(x) })) : []
    ];
    await run_tasks(tasks);
    t_cfg.info("=== results ===");
    for (const i of results) {
      t_cfg.info(i);
    }
  }
  if (args.main_action === "push-with-dependencies") {
    const p2 = new Repository(cfg, process.cwd(), {});
    const rL = cfg["remote-location"];
    const basenames_to_pull = [];
    const seen = [];
    const ensure_repo_committed_and_clean = async (r) => {
      t_cfg.info(r.path, "checking for cleanness");
      if (args.shell_on_changes && "" !== await run("git", { args: ["diff"], cwd: r.path })) {
        t_cfg.info(`${r.path} is dirty, please commit changes`);
        if (import_os.default.platform() === "win32") {
          t_cfg.info(`starting shell on Windows not supported. Commit your changes and rerun. Quitting`);
          process.exit();
        } else {
          t_cfg.info(`starting shell quit with ctrl-d or by typing exit return`);
          await run(cfg.bin_sh, { cwd: r.path, stdout1: true });
        }
      }
    };
    const ensure_remote_location_setup = async (r) => {
      t_cfg.info(r.path, "ensuring remote setup");
      const reponame = r.basename;
      if ("" === await run(`git`, { expected_exitcodes: [0, 1], args: `config --get remote.${rL.gitRemoteLocationName}.url`.split(" "), cwd: r.path })) {
        await run(`git`, { args: `remote add ${rL.gitRemoteLocationName} ${rL.server}:${rL["repositories-path-bare"]}/${reponame}`.split(" "), cwd: r.path });
        await run(`ssh`, { args: [rL.server], cwd: r.path, stdin: `
          bare=${rL["repositories-path-bare"]}/${reponame}
          target=${rL["repositories-path-checked-out"]}/${reponame}
          [ -d "$bare" ] || mkdir -p "$bare"; ( cd "$bare"; git init --bare; )
          ${args.care_about_remote_checkout ? `[ -d "$target" ] || ( git clone $bare $target; cd $target; git config pull.rebase true; )` : ""}
          ` });
        await run(`git`, { args: `push --set-upstream ${rL.gitRemoteLocationName} master`.split(" "), cwd: r.path });
      }
    };
    const remote_update = async (r) => {
      if (!args.care_about_remote_checkout)
        return;
      const reponame = r.basename;
      await run(`ssh`, {
        args: [rL.server],
        cwd: r.path,
        stdin: `
          target=${rL["repositories-path-checked-out"]}/${reponame}
          cd $target
          git pull
      `
      });
    };
    const push_to_remote_location = async (r) => {
      await ensure_is_git(r);
      await ensure_repo_committed_and_clean(r);
      await ensure_remote_location_setup(r);
      if (rL.gitRemoteLocationName) {
        t_cfg.info(`... pushing in ${r.path} ...`);
        await run("git", { args: ["push", rL.gitRemoteLocationName], cwd: r.path });
      }
      await remote_update(r);
    };
    for (const rep of p2.repositories({ includeThis: true })) {
      await push_to_remote_location(rep);
    }
  }
  if (args.main_action === "commit-all") {
    const force = args.force;
    const p2 = new Repository(cfg, process.cwd(), {});
    for (const r of p2.repositories()) {
      if (fs5.existsSync(path3.join(r.path, ".git"))) {
        const stdout = await run("git", { args: ["diff"], cwd: r.path });
        if (stdout !== "") {
          console.log(stdout);
          if (force) {
            await run("git", { args: ["commit", "-am", args.message], cwd: r.path });
          } else {
            console.log(r.path, "has uncommited changes, commit now");
            await run(cfg.bin_sh, { cwd: r.path, stdout1: true });
          }
        }
      }
    }
  }
  if (args.main_action === "reinstall-with-dependencies") {
    const p2 = new Repository(cfg, process.cwd(), {});
    const dep_collection = new DependencyCollection(cfg, p2.path, p2.tsmonojson.dirs(cfg));
    dep_collection.dependencies_of_repository(p2, true, { addLinks: false });
    dep_collection.do();
    dep_collection.print_warnings();
    const seen = [];
    for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      const r = v[0].repository;
      if (r) {
        if (seen.includes(r.path))
          continue;
        seen.push(r.path);
      }
    }
    for (const r of p2.repositories()) {
      fs5.removeSync(path3.join(r.path, "node_modules"));
      const package_json_installed = path3.join(r.path, "package.json.installed");
      if (fs5.existsSync(package_json_installed))
        fs5.removeSync(package_json_installed);
    }
    await p2.update(cfg, {
      link_to_links: args.link_to_links,
      install_npm_packages: true,
      symlink_node_modules_hack: false,
      recurse: true,
      force: true
      // , update_cmd: {executable: "npm", args: ["i"]}
    });
  }
  const external_libarries = ["fsevents", "esbuild", "oracledb", "better-sqlite3", "sqlite3", "pg-native", "tedious", "mysql2"];
  const esbuild_external_flags = external_libarries.map((x) => `--external:${x}`);
  const restartable = () => {
    const r = restartable_processes();
    const dist_dir = (o) => `./dist/${path3.basename(o.ts_file)}`;
    const compile_server = (o) => r.spawn(`compile_${path3.basename(o.ts_file)}`, "esbuild", [`--outdir=${dist_dir(o)}`, "--bundle", `--platform=node`, o.ts_file, ...esbuild_external_flags]);
    const compile_web = (o) => r.spawn(`compile_${path3.basename(o.ts_file)}`, "esbuild", [`--outdir=${dist_dir(o)}`, "--bundle", `--sourcemap`, o.ts_file]);
    const restart = (o) => r.spawn(`run_${path3.basename(o.ts_file)}`, "node", [path3.join(dist_dir(o), path3.basename(o.ts_file).replace(/\.ts/, ".js"))], true);
    return {
      compile_server,
      compile_web,
      restart,
      ...r
    };
  };
  const watch2 = (f) => {
    let timer = "wait";
    Promise.resolve().then(() => __toESM(require_chokidar())).then((chokidar) => {
      chokidar.watch(".", {
        followSymlinks: true,
        ignored: /dist.*|.log/,
        // ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        }
      }).on("ready", () => {
        timer = void 0;
        console.log(import_chalk3.default.green(`chokidar setup`));
      }).on("all", (...args2) => {
        if (timer == "wait")
          return;
        if (timer)
          clearTimeout(timer);
        timer = setTimeout(() => {
          for (let arg of args2) {
            console.log("recompiling cause ", JSON.stringify(args2), "changed");
          }
          f();
        }, 50);
      });
    });
  };
  if (args.main_action == "esbuild-server-client-dev") {
    const { compile_server, compile_web, restart, kill_all } = restartable();
    process.on("exit", () => kill_all());
    const server_ts = args.server_ts_file;
    const o_server = { ts_file: server_ts };
    const o_web = { ts_file: args.web_ts_file };
    const recompileAndStart = () => {
      compile_web(o_web).catch((e) => {
      });
      if (server_ts)
        compile_server(o_server).then(() => restart(o_server)).catch((e) => {
        });
    };
    watch2(() => recompileAndStart());
    recompileAndStart();
  }
  if (args.main_action == "vite-server-and-api") {
    const { compile_server, compile_web, restart, kill_all, spawn: spawn2 } = restartable();
    process.on("exit", () => kill_all());
    const o_server = { ts_file: args.server_ts_file };
    const o_api = { ts_file: args.api_ts_file };
    compile_server(o_server).then(() => restart(o_server)).catch((e) => {
    });
  }
};
process.on("unhandledRejection", (error) => {
  console.error(error);
  if (error.message)
    console.error(error.message);
  throw error;
});
main().then(
  () => {
  },
  (e) => {
    console.log(import_chalk3.default.red(e));
    process.exit(1);
  }
);
/*! Bundled license information:

is/index.js:
  (**!
   * is
   * the definitive JavaScript type testing library
   *
   * @copyright 2013-2014 Enrico Marino / Jordan Harband
   * @license MIT
   *)

node.extend/lib/extend.js:
  (*!
   * node.extend
   * Copyright 2011, John Resig
   * Dual licensed under the MIT or GPL Version 2 licenses.
   * http://jquery.org/license
   *
   * @fileoverview
   * Port of jQuery.extend that actually works on node.js
   *)

normalize-path/index.js:
  (*!
   * normalize-path <https://github.com/jonschlinkert/normalize-path>
   *
   * Copyright (c) 2014-2018, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-extglob/index.js:
  (*!
   * is-extglob <https://github.com/jonschlinkert/is-extglob>
   *
   * Copyright (c) 2014-2016, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

is-glob/index.js:
  (*!
   * is-glob <https://github.com/jonschlinkert/is-glob>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-number/index.js:
  (*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

to-regex-range/index.js:
  (*!
   * to-regex-range <https://github.com/micromatch/to-regex-range>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

fill-range/index.js:
  (*!
   * fill-range <https://github.com/jonschlinkert/fill-range>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Licensed under the MIT License.
   *)
*/
//# sourceMappingURL=tsmono.js.map
