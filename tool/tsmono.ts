import { ArgumentParser } from "argparse";
import * as JSON5 from "json5";
import * as fs from "fs-extra";
import * as path from "path";
import { spawn } from "child_process";
import { basename, dirname, normalize } from "path";
// import deepequal from "deep-equal"
const deepequal = require("deep-equal") // allowSynteticImports doesn't exist for node -r ..
import btoa from "btoa"
import deepmerge from "deepmerge"
import {fetch} from "cross-fetch"
import {homedir} from "os"
console.log("deepmerge", deepmerge);



/// LIBRARY SUPPORT CODE
const clone = (x:any) => {
  console.log("cloning", x);
  return x === undefined ? undefined : JSON.parse(JSON.stringify(x))
}

const del_if_exists = (path:string)=>{
  // fs.existsSync doesn't work on symlinks
  try { fs.unlinkSync(path); } catch (e) { }
}

const assert = (a:boolean, msg:string = "") => {
    if (!a) throw new Error(msg)
}

const assert_eql = (a:string, b:string) => {
    assert(a.trim() === b.trim(), `assertion ${JSON.stringify(a)} === ${JSON.stringify(b)} failed`)
}
const run = async (cmd: string, args:string[]) => {
  // duplicate code
  await new Promise((a, b) => {
    const child = spawn(cmd, args, {
      stdio: [
        0, // use parents stdin for child
        'pipe', // pipe child's stdout to parent
        fs.openSync("err.out", "w") // direct child's stderr to a file
      ]
    });
    child.on('close', (code, signal) => {
      if (code === 0) a()
      b(`${cmd.toString()} failed with code ${code}`)
    })
  })
}

const read_and_show = (l:string, path:string) => {
  if (fs.existsSync(path))
    console.log(`file ${l} ${path} has contents ${fs.readFileSync(path, 'utf8')}`);
  else
    console.log(`file ${l} doesn't exist`)
}

const run_stdout = async (cmd: string, ...args:string[]) => {
  console.log("running", cmd, args);
    var stdout = ""
    // duplicate code
    await new Promise((a, b) => {
        const child = spawn(cmd, args, {
            stdio: [ 0, 'pipe', 2 ]
        });
        if (!child.stdout)
            throw new Error("child.stdout is null")

        child.stdout.on('data', (s) => stdout += s)
        child.on('close', (code, signal) => {
            if (code === 0) a()
            b(`${cmd.toString()} ${args.join(' ').toString()} failed with code ${code}`)
        })
    })
    return stdout
}

interface Cache {

  get: <T>(key:string,  f:() => T, ttl_seconds?: number) => T;

  get_async: <T>(key:string, f:() => Promise<T>, ttl_seconds?: number) => Promise<T>;
}

class DirectoryCache implements Cache {
  // sry for reimplementing it - need a *simple* fast solution
  constructor(public path:string) {
  }

  private tc_(){
    return new Date().getTime()
  }

  private path_(key:string){
    return `${this.path}/${btoa(key)}`;
  }

  private get_(key:string, ttl:number|undefined){
    const p = this.path_(key)
    if (fs.existsSync(p)){
      const json = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (ttl === undefined || !(this.tc_() - json.tc > ttl))
        return json.thing;
    }
    return undefined
  }

  private put_(key:string, thing:any){
    if (!fs.existsSync(this.path)) fs.mkdirpSync(this.path)
    fs.writeFileSync(this.path_(key), JSON.stringify({'thing':thing, 'tc': this.tc_()}));
  }

  get<T>(key:string, f:() => T, ttl_seconds?: number ): T {
    const cached = this.get_(key, ttl_seconds);
    if (cached === undefined){
      const r = f();
      this.put_(key, r)
      return r
    }
    return cached
  }

  async get_async<T>(key:string,  f:() => Promise<T>, ttl_seconds?:number): Promise<T> {
    const cached = this.get_(key, ttl_seconds);
    if (cached === undefined){
      const r = await f();
      this.put_(key, r)
      return r
    }
    return cached
  }
}

type ConfigData = {
  cache: DirectoryCache,
  fetch_ttl_seconds: number
}

type Config = ConfigData & ReturnType<typeof cfg_api>

const config = {
  cacheDir: "~/.tsmono/cache"
}

type Dependency = {
  name:string,
  npm?:boolean,    // force installing from npm
  version?:string, // check or verify version constraints
  node_modules?:boolean, // requires TS -> .js .d.ts steps
  types?:boolean,
  reference_by_references?:boolean,
  origin?:string // where this dependency was declared
}

const parse_dependency = (s:string, origin?: string):Dependency =>{
  const l = s.split(':')
  const r:Dependency = {name: l[0]}
  for (const v of l.slice(1)) {
    if (/version=(.*)/.test(v)){
      r.version = v.slice(8); continue;
    }
    if (v === 'node_modules') r[v] = true;
    if (v === 'types') r[v] = true;
    if (v === 'npm') r[v] = true;
  }
  if (origin !== undefined) r.origin = origin;
  return r;
}

const cfg_api = (cfg:ConfigData) => {

  const fetch_from_registry = (name:string): Promise<any> => {
    return cfg.cache.get_async(`fetch-${name}-registry.npmjs.org`, async () => {
      // TODO add cache
      const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`
      const res = await fetch(url)
      if (res.status !== 200)
        throw new Error(`fetching ${url}`)
        // returns {"error":"not found"} if package doesn't exist
      return res.json()
    }, cfg.fetch_ttl_seconds)
  }

  const npm_version_for_name = async (name:string): Promise<string|undefined> => {
    const lock = new JSONFile('.tsmonolock')
    if (!(name in lock.json)){
      const r = await fetch_from_registry(name)
      if (r.error) return undefined
      lock.json[name] = `^${r['dist-tags'].latest}`
      lock.flush()
    }
    return lock.json[name]
  }

  return {
    fetch_from_registry,
    npm_version_for_name
  }
}

const backup_file = (path:string)  => {
    if (fs.existsSync(path)){
      const bak = `${path}.bak`
      if (fs.existsSync(bak))
      fs.renameSync(path, bak)
    }
}

const get_path = (...args:any[]):any => {
  console.log("get_path", JSON.stringify(args));
  // get_path(obj, path)
  var r = args[0]
  for (let v of args.slice(1, -1)) {
    try {
      if (!(v in r))
        return args[args.length-1]
    } catch (e) {
      throw new Error(`get_path problem getting key ${v}, args ${args}`)
    }
    r = r[v]
  }
  return r
}

const ensure_path = (obj:any, ...args:any[]):any => {
  // ensure_path({}, 'foo', 'bar', [])
  const e = args.length - 2
  for (var i = 0, len = e; i <= e; i++) {
    const k = args[i]
    if (i == e){
      obj[k] = obj[k] || args[e+1]
      return obj[k]
    }
    obj[k] = obj[k] || {}
    obj = obj[k]
  }
}
class JSONFile {

  private json_on_disc:object|undefined = undefined;
  public json: any = {};

  constructor(public path:string, default_: () => object = () => {return {}}) {
    if (fs.existsSync(this.path)){
      const s =fs.readFileSync(this.path, 'utf8')
      this.json_on_disc  = JSON5.parse(s);
      this.json          = JSON5.parse(s)
    } else {
      this.json_on_disc  = undefined
      this.json = default_()
    }
  }

  exists():boolean{
    return fs.existsSync(this.path)
  }

  flush(){
    const s = JSON.stringify(this.json)
    console.log('flushing ?', this.path);
    if (!deepequal(this.json_on_disc, this.json)){
      console.log('flushing', this.path);
      fs.writeFileSync(this.path, s, 'utf8')
    }
  }

  flush_protect_user_changes(){
    const protect_path = `${this.path}.tsmonoguard`
    if (fs.existsSync(protect_path)){
      if (fs.readFileSync(protect_path, 'utf8') !== fs.readFileSync(this.path, 'utf8'))
        // TODO nicer diff or allow applying changes to tsmono.json
        throw new Error(`Move ${protect_path} ${this.path} to continue. Not overwriting your changes`)
    }
    console.log("flushing", this.json);
    this.flush()
    fs.copyFileSync(this.path, protect_path)
  }
}


class TSMONOJSONFile extends JSONFile {
  init(tsconfig:any|undefined){
    ensure_path(this.json, "name", "")
    ensure_path(this.json, "version", "0.0.0")
    ensure_path(this.json, "package-manager-install-cmd", ["fyn"])
    ensure_path(this.json, "dependencies", [])
    ensure_path(this.json, "devDependencies", [])
    ensure_path(this.json, "tsconfig", tsconfig)
  }

  dirs(){
    return get_path(this.json, "tsmono", "directories", ["../"])
  }

  // dependencies(){
  //   return {
  //     'dependencies': get_path(this.json, 'dependencies', []),
  //     'devDependencies': get_path(this.json, 'devDependencies', [])
  //   }
  // }
}

const map_package_dependencies_to_tsmono_dependencies = (versions:{[key:string]: string}) => {
  const r = []
  for (let [k, v] of Object.entries(versions)) {
    r.push(`${k}:version=${v}`)
  }
  console.log("ABCC", r, versions);
  return r;
}

type DependencyWithRepository = Dependency & {repository?: Repository}

const dependency_to_str = (d:DependencyWithRepository) => {
  return `${d.name} ${d.npm && d.repository ? 'npm and repository?' : (d.repository ? `from ${d.repository.path}` : `from npm ${d.version ? d.version : ''}`)} requested from ${d.origin}`
}

class DependencyCollection {


  public dependency_locactions: { [key: string]: DependencyWithRepository[]} = {}
  dependencies: string[] = []
  devDependencies: string[] = []

  todo: Dependency[] = []
  recursed: string[] = []

  constructor(public dirs:string[]) { }

  print_warnings(): any {
    for (let [k, v] of Object.entries(this.dependency_locactions)){
      // TODO: check that all v's are same constraints ..
      const npms    = v.filter((x) => x.npm)
      const no_npms = v.filter((x) => !x.npm)
      if (npms.length > 0 && no_npms.length > 0)
        console.log(`WARNING: dependency ${k} requested as npm and from disk, choosing first`, v.map(dependency_to_str).join("\n"))
      // check version match etc
    }
  }

  dependencies_of_repository(r:Repository, dev:boolean){
    // add dependencies r to todo list to be looked at
    const deps = r.dependencies()
    console.log("DEPS OF", r.path, deps);
    const add = (key: "devDependencies"|"dependencies") => {
      this.todo = [...this.todo, ...deps[key]]
      this[key] = [...this[key], ...deps[key].map((x) => x.name)]
    }
    add("dependencies")
    if (dev) add("devDependencies")
  }

  do(){
    var next: Dependency|undefined
    while (next = this.todo.shift()){
      this.find_and_recurse_dependency(next)
    }
  }

  find_and_recurse_dependency(dep: DependencyWithRepository) {
      const locations = ensure_path(this.dependency_locactions, dep.name, [])
      locations.push(dep)
      if (this.recursed.includes(dep.name)) return;
      this.recursed.push(dep.name)

      if (dep.npm) return // nothing to do

      const d = this.dirs.map((x) => `${x}/${dep.name}` ).find((dir) => fs.existsSync(dir) )
      if (!d){
        console.log(`WARNING, dependency ${dependency_to_str(dep)} not found, forcing npm`);
        dep.npm = true; return
      }
      const r = new Repository(d)
      dep.repository = r
      // devDependencies are likely to contain @types thus pull them, too ?
      // TODO: only pull @types/*?
      this.dependencies_of_repository(r, true) 
  }

}

class Repository {

  private tsmonojson: TSMONOJSONFile;
  private packagejson: JSONFile;

  constructor(public path:string) {
    this.tsmonojson = new TSMONOJSONFile(`${path}/tsmono.json`)
    this.packagejson = new JSONFile(`${path}/package.json`)
  }

  flush(){
    this.tsmonojson.flush()
    this.packagejson.flush()
  }

  init(){
    const tsconfig = `${this.path}/tsconfig.json`
    this.tsmonojson.init(fs.existsSync(tsconfig) ? JSON5.parse(fs.readFileSync(tsconfig, 'utf8')) : {})
  }

  dependencies(): {
    'dependencies': Dependency[],
    'devDependencies': Dependency[]
  }{
    const to_dependency = (dep:string) => parse_dependency(dep, this.path)
    // get dependencies from
    // tsmono.json
    // package.json otherwise
    if (fs.existsSync(`${this.path}/tsmono.json`)){
      return {
        dependencies: clone(get_path(this.tsmonojson.json, 'dependencies', [])).map(to_dependency),
        devDependencies: clone(get_path(this.tsmonojson.json, 'devDependencies', [])).map(to_dependency)
      }
    }

    return {
      dependencies: map_package_dependencies_to_tsmono_dependencies(get_path(this.packagejson.json, 'dependencies', {})).map(to_dependency),
      devDependencies: map_package_dependencies_to_tsmono_dependencies(get_path(this.packagejson.json, 'devDependencies', {})).map(to_dependency)
    }

  }

  public src():string{
    // the src file of this repository which should be linked to depending repository
    const src = `${this.path}/src`
    return fs.existsSync(src) ? src : this.path
  }

  async update(cfg: Config, opts:{link_to_links?:boolean, run_update?:boolean} = {}){

    assert(!!opts.link_to_links, 'link_to_links should be true') 
    // otherwise node_modules relative to the .ts files location will be used arnd chaos will hapen
    // So we must link to local directory


    const link_dir:string = "tsmono/links";

    (fs.existsSync(link_dir) ? fs.readdirSync(link_dir) : []).forEach((x:string) => {
      fs.unlinkSync(`${link_dir}/${x}`)
    })

    const cwd = process.cwd()
    const tsmonojson: any = this.tsmonojson.json || {}
    var package_json = clone(get_path(tsmonojson, 'package', {}))
    if (package_json === undefined) {
      package_json = {}
    }
    package_json.dependencies = {}
    package_json.devDependencies = {}
    delete package_json.tsconfig
    const tsconfig: any = {}
    const dep_collection = new DependencyCollection(this.tsmonojson.dirs())
    dep_collection.dependencies_of_repository(this, true)
    dep_collection.do()
    dep_collection.print_warnings()
    console.log("dep_collection", dep_collection);

    const expected_symlinks: {[key:string]: string} = {}
    const expected_tools: {[key:string]: string} = {}

    const path_for_tsconfig = (tsconfig_path:string) => {
      const r:any = {}
      { // always set path
        for (let [k, v] of Object.entries(dep_collection.dependency_locactions)) {
          if ( v[0].repository) {
            // path.absolute path.relative(from,to) ?
            const lhs = `${k}/*`
            const rhs = path.relative(dirname(tsconfig_path), path.resolve(cwd,
              (!!opts.link_to_links)
              ? `${link_dir}/${v[0].name}/*`
              : `v[0].repository.src()))}/*`
              ))

            ensure_path(r, 'compilerOptions', 'paths', lhs, [])
            if (!r.compilerOptions.paths[lhs].includes(rhs))
              r.compilerOptions.paths[lhs].push(rhs)
          }
        }
      }
      return r;
    };

    for (let [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      if (v[0].repository) {
        const src = `${v[0].repository.path}/src`
        var src_dir = fs.existsSync(src) ? src : v[0].repository.path
        if (opts.link_to_links) {
          console.log("add", k);
          expected_symlinks[`${link_dir}/${k}`] = `../../${src_dir}`
        }


        console.log("tsconfig2", tsconfig);
        const src_tool = `${v[0].repository.path}/src/tool`;
        (fs.existsSync(src_tool) ? fs.readdirSync(src_tool) : []).forEach((x) => {
          const match = /([^/\\]*)(\.ts)/.exec(x)
          if (match){
            expected_tools[match[1]] = x
          }
        })
      }
    }

    const fix_ts_config = (x:any) => {
      if (x.compilerOptions.paths && !('baseUrl' in x.compilerOptions))
      x.compilerOptions.baseUrl = "."
      return x;
    }

    if ('tsconfigs' in tsmonojson){
      for (let [path, merge] of Object.entries(tsmonojson.tsconfigs)) {
        fs.writeFileSync(path, JSON.stringify(fix_ts_config(deepmerge.all([ tsmonojson.tsconfig || {}, path_for_tsconfig(path), tsconfig, merge ]))), 'utf8')
      }
    } else if ('tsconfig' in tsmonojson || Object.keys(path_for_tsconfig("")).length > 0){
      const tsconfig_path = `${this.path}/tsconfig.json`
      const json:string = JSON.stringify(fix_ts_config(deepmerge( tsmonojson.tsconfig || {}, path_for_tsconfig(tsconfig_path), tsconfig )))
      console.log('pwd', this.path);
      console.log("writing tsconfig.json", json)
      fs.writeFileSync(tsconfig_path, json, 'utf8')
      console.log("read", fs.readFileSync(`${this.path}/tsconfig.json`, 'utf8'));
    }


    clone(tsmonojson.tsconfig) || {}

    for (let [k, v] of Object.entries(expected_tools)){
      // todo should be self contained but 
      // node -r ts-node/register/transpile-only -r tsconfig-paths/register 
      // works so well that you sohuld have a shourtcut in your .bashrc anywaya
      // so just making symlinks for now which should be good enough
      ['tsmono/tools','tsmono/tools-bin','tsmono/tools-bin-check' ].forEach((x) => { if (!fs.existsSync(x)) fs.mkdirSync(x) })

      // this is going to break if you have realtive symlinks ?
      expected_symlinks[`tsmono/tools/${k}`] = v

      // TODO windows
      // boldly create in node_modules/.bin instead to make things just work ?
      const t = `tsmono/tools-bin/${k}`;
      del_if_exists(t);
      fs.writeFileSync(t,`#!/bin/sh\nnode -r ts-node/register/transpile-only -r tsconfig-paths/register ${v} "$@" `, 'utf8')
      fs.writeFileSync(`tsmono/tools-bin-check/${k}`,`#!/bin/sh\nnode -r ts-node/register-only -r tsconfig-paths/register ${v} "$@"`, 'utf8')
    }

    console.log("expected_symlinks", expected_symlinks);
    for (let [k, v] of Object.entries(expected_symlinks)){
      console.log("k", k);
      console.log("k", fs.existsSync(k));
      del_if_exists(k)
      console.log("exiist after del_if_exists", fs.existsSync(k));
      fs.mkdirpSync(dirname(k))
      console.log("exiist beore symlinkSync", fs.existsSync(k));
      fs.symlinkSync(v, k)
    }

    ensure_path(package_json, 'dependencies', {})
    ensure_path(package_json, 'devDependencies', {})

    const add_npm_packages = async (dep: "dependencies" | "devDependencies") => {
      for (const dep_name of dep_collection[dep]) {
        const first = dep_collection.dependency_locactions[dep_name][0]
        if (!first.npm) continue;
        console.log("adding npm", dep_name, first);
        // TODO: care about version
        ensure_path(package_json, dep, dep_name, await cfg.npm_version_for_name(dep_name))
        if (first.types){
          const type_name = `@types/${dep_name}`
          const type_version = await cfg.npm_version_for_name(type_name)
          console.log("got type version", type_version);
          if (type_version !== undefined)
            ensure_path(package_json, dep, type_name, await cfg.npm_version_for_name(dep_name))
        }
        console.log("package_json", package_json);
      }
    }

    await add_npm_packages("dependencies")
    await add_npm_packages("devDependencies")

    backup_file(package_json.path)
    console.log("package_json2", package_json);
    this.packagejson.json = package_json;
    console.log("package_json2", this.packagejson.json);
    this.packagejson.flush_protect_user_changes()

    if (opts.run_update){
      console.log("run_update");
      const npm_install_cmd = get_path(this.tsmonojson.json, "npm-install-cmd", ["fyn"])
      await run(npm_install_cmd[0], npm_install_cmd.slice(1))
    }

    console.log(`${this.path}/tsconfig.json`);
  }

  async add(cfg:Config, dependencies:string[], devDependencies:string[]){
    // TODO: check prefix "auto" etc to keep unique or overwrite
    await this.init()
    const j = this.tsmonojson.json;
    j["dependencies"] = [...j["dependencies"], ...dependencies.filter((x) => !(j["dependencies"] || []).includes(x))]
    j["devDependencies"] = [...j["devDependencies"], ...devDependencies.filter((x) => !(j["devDependencies"] || []).includes(x))]
    await this.update(cfg, {link_to_links : true, run_update : true})
  }

}

// COMMAND LINE ARGUMENTS
const parser = new ArgumentParser({
  addHelp: true,
  description: `tsmono (typescirpt monorepository), see github `,
  version: "0.0.1",
});
const sp = parser.addSubparsers({
  'title':'sub commands',
  'dest':'main_action'
})
var init   = sp.addParser("init", {'addHelp':true})
var add    = sp.addParser("add", {'addHelp':true})
add.addArgument("args", {'nargs':'*'})
var update = sp.addParser("update", {'addHelp':true})
var watch = sp.addParser("watch", {'addHelp':true})

console.log(process.argv)
const  args = parser.parseArgs();

const main = async () => {
  const cache = new DirectoryCache(`${homedir()}/.tsmono/cache`)

  const config = {
    cache,
    fetch_ttl_seconds : 60 * 24  
  }

  const cfg = Object.assign({}, config, cfg_api(config))

  const p = new Repository(process.cwd())
  if (args.main_action == "init"){
    await p.init()
    return;
  }
  if (args.main_action == "add"){
    const d:string[]  = []
    const dd = []
    var  add = d
    for (let v of args.args) {
      if (v == "-d") {
        add = dd
      }
      dd.push(v)
    }
    await p.add(cfg, d, dd)
    return;
  }
  if (args.main_action == "update"){
    await p.update(cfg, {link_to_links: true, run_update : true})
    return;
  }
  if (args.main_action == "add"){
    throw new Error("TODO")
  }
  const package_json = fs.readFileSync("package.json")
}

process.on("unhandledRejection", (error) => {
  console.error(error); // This prints error with stack included (as for normal errors)
  throw error; // Following best practices re-throw error and let the process exit with error code
});

main()
