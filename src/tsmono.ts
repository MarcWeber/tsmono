import {Links, Paths} from "./types";
import { ArgumentParser } from "argparse";
import chalk from "chalk";
import debug_ from "./debug";
import * as fs from "fs-extra";
import * as JSON5 from "json5";
import * as path from "path";
const debug = debug_("tsmono")
import btoa from "btoa"
import { spawn, SpawnOptions, ChildProcessWithoutNullStreams, ChildProcess } from "child_process";
import {fetch} from "cross-fetch"
// import deepequal from "deep-equal"
import deepequal from "deep-equal"
import deepmerge from "deepmerge"
import {homedir} from "os"
import { basename, dirname, normalize } from "path";
import { presets } from "./presets"
import {createLock} from "./lock"
import jsonFile from "json-file-plus"
import { patches, provided_by } from "./patches"
import ln from "./library-notes"
import {restartable_processes} from "./utils-restartable-processes"

const readJsonFile = async (path: string): Promise<any> => {
    console.log("reading", path);
    const jf = await jsonFile(path)
    return jf.data
}

const parse_json_file = (path: string) => {
    try {
        return JSON5.parse(fs.readFileSync(path, 'utf8'))
    } catch (e){
        throw `bad JSON at file ${path}, error: ${e}`
    }
}

// TODO: use path.join everywhere

let silent: boolean = false;
const info = (...args: any[]) => {
  if (!silent) console.log(...args);
}
const warning = info

const verbose = info

/// LIBRARY SUPPORT CODE
const clone = (x: any) => {
  return x === undefined ? undefined : JSON.parse(JSON.stringify(x))
}

const unique = <T>(x: T[]): T[] => { return x.filter((v, i) => x.indexOf(v) === i) }

const del_if_exists = (path: string) => {
  // fs.existsSync doesn't work on symlinks
  try { fs.unlinkSync(path); } catch (e) { }
}

const assert = (a: boolean, msg: string = "") => {
    if (!a) throw new Error(msg)
}

const assert_eql = (a: string, b: string) => {
    assert(a.trim() === b.trim(), `assertion ${JSON.stringify(a)} === ${JSON.stringify(b)} failed`)
}

const run = async (cmd: string, opts: {
  args?: string[],
  stdin?: string,
  stdout1?: boolean,
  expected_exitcodes?: number[],
} & SpawnOptions) => {
  const args = opts.args || [];
  console.log("args", args)
  info("running", cmd, args, "in", opts.cwd);
  let stdout = ""
  let stderr = ""
    // duplicate code
  await new Promise((a, b) => {
      const child = spawn(cmd, args, Object.assign( opts, {
          stdio: [ "stdin" in opts ? "pipe" : 0 , opts.stdout1 ? 1 : "pipe" , "pipe" ],
      }));

      if (child.stdin) {
        if ("stdin" in opts && child.stdin) {
          verbose("stdin is", opts.stdin)
          // @ts-ignore
          child.stdin.setEncoding("utf8");
          child.stdin.write(opts.stdin)
        }
        // @ts-ignore
        child.stdin.end()
      }

      if (child.stdout)
        child.stdout.on("data", (s) => stdout += s)
      if (child.stderr)
        child.stderr.on("data", (s) => stderr += s)

      child.on("close", (code, signal) => {
          if ((opts.expected_exitcodes || [ 0 ]).includes(code)) a(undefined)
          else b(`${cmd.toString()} ${args.join(" ").toString()} failed with code ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`)
      })
  })
  return stdout
}

interface Cache {

  get: <T>(key: string,  f: () => T, ttl_seconds?: number) => T;

  get_async: <T>(key: string, f: () => Promise<T>, ttl_seconds?: number) => Promise<T>;
}

class DirectoryCache implements Cache {
  // sry for reimplementing it - need a *simple* fast solution
  constructor(public path: string) {
  }

  public get<T>(key: string, f: () => T, ttl_seconds?: number ): T {
    const cached = this.get_(key, ttl_seconds);
    if (cached === undefined) {
      const r = f();
      this.put_(key, r)
      return r
    }
    return cached
  }

  public async get_async<T>(key: string,  f: () => Promise<T>, ttl_seconds?: number): Promise<T> {
    const cached = this.get_(key, ttl_seconds);
    if (cached === undefined) {
      const r = await f();
      this.put_(key, r)
      return r
    }
    return cached
  }

  private tc_() {
    return new Date().getTime()
  }

  private path_(key: string) {
    return path.join(this.path, btoa(key));
  }

  private get_(key: string, ttl: number|undefined) {
    const p = this.path_(key)
    if (fs.existsSync(p)) {
      const json = JSON.parse(fs.readFileSync(p, "utf8"))
      if (ttl === undefined || !(this.tc_() - json.tc > ttl))
        return json.thing;
    }
    return undefined
  }

  private put_(key: string, thing: any) {
    if (!fs.existsSync(this.path)) fs.mkdirpSync(this.path)
    fs.writeFileSync(this.path_(key), JSON.stringify({thing, tc: this.tc_()}));
  }
}

type ConfigData = {
  cache: DirectoryCache,
  fetch_ttl_seconds: number,
  npm_install_cmd: string[], // eg ['fyn'] or ['npm', 'i']
  bin_sh: string,

  directories?: string[] // 

  "remote-location": RemoteLocation
}

type Config = ConfigData & ReturnType<typeof cfg_api>


interface Dependency {
  name: string,
  url?: string,
  npm?: boolean,    // force installing from npm
  srcdir?: string,
  allDevDependencies?: true,
  package_jsons?: string[]
  version?: string, // check or verify version constraints
  node_modules?: boolean, // requires TS -> .js .d.ts steps
  types?: boolean,
  reference_by_references?: boolean,
  origin?: string, // where this dependency was declared
  ignore_src?: boolean,
}


const parse_dependency = (s: string, origin?: string): Dependency => {
  const l = s.split(";")
  const r: Dependency = {name: l[0]}
  if (/git\+https/.test(r.name)) {
    r.url = r.name
    r.name = path.basename(r.name).replace(/\.git$/, "")
  }

  if (patches[r.name]?.npm_also_types){
      r.types = true;
  } // TODO: add versions constraints
  for (const v of l.slice(1)) {
    let x = v.split("=")
    if (x.length >= 2) {
      x = [ x[0], x.slice(1).join("=") ];
      if (x[0] === "version") r.version = x[1]
      else if (x[0] === "name") r.name = x[1]
      else if (x[0] === "srcdir") r.srcdir = x[1]
      else if (x[0] === "allDevDependencies") r.allDevDependencies = true
      else if (x[0] === "package.json") r.package_jsons = [...(r.package_jsons || []), x[1]]
      else throw new Error(`bad key=name pair: ${v}`)
    }
    if (v === "node_modules") r[v] = true;
    if (v === "types") { r[v] = true; r.npm = true; }
    if (v === "npm") r[v] = true;
    if (v === "ignore_src") r[v] = true;
  }
  if (origin !== undefined) r.origin = origin;
  return r;
}

const cfg_api = (cfg: ConfigData) => {

  const fetch_from_registry = (name: string): Promise<any> => {
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

  const npm_version_for_name = async (name: string): Promise<string|undefined> => {
    const lock = new JSONFile(".tsmonolock")
    if (!(name in lock.json)) {
      const r = await fetch_from_registry(name)
      if (r.error) return undefined
      lock.json[name] = `^${r["dist-tags"].latest}`
      lock.flush()
    }
    return lock.json[name]
  }

  return {
    fetch_from_registry,
    npm_version_for_name,
  }
}

const backup_file = (path: string)  => {
    if (fs.existsSync(path)) {
      const bak = `${path}.bak`
      if (fs.existsSync(bak))
      fs.renameSync(path, bak)
    }
}

// use object-path instead ?
const get_path = (...args: any[]): any => {
  // get_path(obj, path)
  let r = args[0]
  for (const v of args.slice(1, -1)) {
    try {
      if (!(v in r))
        return args[args.length - 1]
    } catch (e) {
      throw new Error(`get_path problem getting key ${v}, args ${args}`)
    }
    r = r[v]
  }
  return r
}

const ensure_path = (obj: any, ...args: any[]): any => {
  // ensure_path({}, 'foo', 'bar', [])
  const e = args.length - 2
  for (let i = 0, len = e; i <= e; i++) {
    const k = args[i]
    if (i === e) {
      obj[k] = obj[k] || args[e + 1]
      return obj[k]
    }
    obj[k] = obj[k] || {}
    obj = obj[k]
  }
}

const protect = (path: string, flush: () => void, force: boolean= false, protect_path: string = `${path}.protect`) => {
    if (fs.existsSync(protect_path) && fs.existsSync(path)) {
      if (!force && fs.readFileSync(protect_path, "utf8") !== fs.readFileSync(path, "utf8"))
        // TODO nicer diff or allow applying changes to tsmono.json
        throw new Error(`mv ${protect_path} ${path} to continue. Not overwriting your changes. Use --force to force`)
    }
    flush()
    fs.copyFileSync(path, protect_path)
}

class JSONFile {
  public json: any = {};

  private json_on_disc: object|undefined = undefined;

  constructor(public path: string, default_: () => object = () => ({})) {
    if (fs.existsSync(this.path)) {
      const s = fs.readFileSync(this.path, "utf8")
      this.json          = parse_json_file(this.path)
    } else {
      this.json_on_disc  = undefined
      this.json = default_()
    }
  }

  public exists(): boolean {
    return fs.existsSync(this.path)
  }

  public flush() {
    const s = JSON.stringify(this.json, undefined, 2)
    if (!deepequal(this.json_on_disc, this.json)) {
      fs.writeFileSync(this.path, s, "utf8")
    }
  }

  public flush_protect_user_changes(force: boolean = false) {
    protect(this.path, () => { this.flush(); }, force)
  }
}

class TSMONOJSONFile extends JSONFile {

  public init(cfg: Config, tsconfig: any|undefined) {
    ensure_path(this.json, "name", "")
    ensure_path(this.json, "version", "0.0.0")
    ensure_path(this.json, "dependencies", [])
    ensure_path(this.json, "devDependencies", [])
    ensure_path(this.json, "tsconfig", tsconfig)
  }

  public dirs(cfg: Config): string[] {
    return unique([
            ...(cfg.directories ?? []),
            ...get_path(this.json, "tsmono", "directories", ["../"])
        ])
  }

  // dependencies(){
  //   return {
  //     'dependencies': get_path(this.json, 'dependencies', []),
  //     'devDependencies': get_path(this.json, 'devDependencies', [])
  //   }
  // }
}

const map_package_dependencies_to_tsmono_dependencies = (versions: {[key: string]: string}) => {
  const r = []
  for (const [k, v] of Object.entries(versions)) {
    r.push(`${k};version=${v}`)
  }
  return r;
}

type DependencyWithRepository = Dependency & {repository?: Repository}

const dependency_to_str = (d: DependencyWithRepository) => {
  return `${d.name} ${d.npm && d.repository ? "npm and repository?" : (d.repository ? `from ${d.repository.path}` : `from npm ${d.version ? d.version : ""}`)} requested from ${d.origin}`
}

class DependencyCollection {

  public dependency_locactions: { [key: string]: DependencyWithRepository[]} = {}
  public dependencies: string[] = []
  public devDependencies: string[] = []

  public todo: Dependency[] = []
  public recursed: string[] = []

  public links: Links = {}

  public paths: Paths = {}

  public warnings: string[] = []

  constructor(public cfg: Config, public origin: string, public dirs: string[]) { }

  public print_warnings(): any {
    for (const [k, v] of Object.entries(this.dependency_locactions)) {
        const notes = patches[k]?.notes
        if (notes){
            console.log(chalk.magenta(`HINT: ${k} repo: ${v[0].origin} ${notes.join("\n")}`));
        }

      // TODO: check that all v's are same constraints ..
      const npms    = v.filter((x) => x.npm)
      const no_npms = v.filter((x) => !x.npm)
      if (npms.length > 0 && no_npms.length > 0)
        warning(`WARNING: ${this.origin} dependency ${k} requested as npm and from disk, choosing first ${v.map(dependency_to_str).join("\n")}`)
      // check version match etc

      const package_json_cache: Record<string, any>= {}

      let all_versions: string[] = []
      const with_version = v.map((dep) => {
        // hack just removing leading ^ - should look at lock files (fyn, node, ..) instead - but this probably is good enough
        const f = (x: string) => x.replace("^", "")

        const versions: string[] = []
        if (dep.version) versions.push(f(dep.version));

        if (dep.origin) {
          const ps = dep.package_jsons ?? [`${dep.origin}/package.json`]
            for (let p of ps) {

                if (!(dep.origin in package_json_cache) && fs.existsSync(p)) {
                    package_json_cache[p] = parse_json_file(p);
                    ["dependencies", "devDependencies"].forEach((d) => {
                        const x =
                            (dep.origin === undefined)
                            ? undefined
                            : get_path(package_json_cache[p], d, k, undefined);
                        if (x !== undefined)
                            versions.push(f(x))
                    })
                } else if (dep.version) {
                    versions.push(f(dep.version))
                }
            }
        }
        all_versions = [...all_versions, ...versions]
        return {dep, versions}
      }).filter((x) => x.versions.length > 0)

      if (unique(all_versions).length > 1) {
        warning(`WARNING: ${this.origin} transient dependencies ${k} with competing versions found:`)
        for (const v of with_version) {
          warning(v.dep.origin, v.versions);
        }
      }
    }


      for (let w of unique(this.warnings)) {
          console.log('!!!! > '+w);
      }
  }

  public dependencies_of_repository(r: Repository, dev: boolean|"dev-types", o: {addLinks: boolean}) {
      // add dependencies r to todo list to be looked at
      const deps = r.dependencies(o)

      // paths
      for (let [k, v] of Object.entries(deps.paths)) {
          this.paths[k] = [...this.paths[k] ?? [], ...v]
      }

      // links
      if (o.addLinks){
          for (let [k,v] of Object.entries(deps.links)) {
              const from = path.join(r.path, k)
              const o = this.links[from]
              if (o && o != v) debug(`warning, overwriting link ${o} ${v}`)
              this.links[from] = v
          }
      }

      const add = (key: "devDependencies"|"dependencies", filter: (x: string) => boolean = (x: string) => true ) => {
          this.todo = [...this.todo, ...deps[key]]
          this[key] = [...this[key], ...deps[key].map((x) => x.name).filter(filter)]
      }

      add("dependencies")

      if (dev === true || dev === "dev-types") add("devDependencies", (x: string) => dev !== "dev-types" || /^@types/.test(x))
  }

  public do() {
    let next: Dependency|undefined
    // tslint:disable-next-line: no-conditional-assignment
    while (next = this.todo.shift()) {

      if (next.name in ln)
        this.warnings.push(`WARNING for using library ${next.name}: ${ln[next.name]}`);

      this.find_and_recurse_dependency(next)
    }
  }

  public find_and_recurse_dependency(dep: DependencyWithRepository) {

      const locations = ensure_path(this.dependency_locactions, dep.name, [])
      locations.push(dep)
      if (this.recursed.includes(dep.name)) return;
      this.recursed.push(dep.name)

      if (dep.npm) return; // nothing to do

      console.log("searching", dep);
      const dirs_lookup = this.dirs.map((x) => path.join(x, provided_by[dep.name] ?? dep.name))

      verbose("dirs_lookup", dirs_lookup);

      const d = dirs_lookup.find((dir) => fs.existsSync(dir) )
      if (!d) {
        info(`dependency ${dependency_to_str(dep)} not found, forcing npm`);
        dep.npm = true; return
      }
      console.log("dep=", dep);
      const r = new Repository(this.cfg, d, {dependency: dep})
      dep.repository = r
      // devDependencies are likely to contain @types thus pull them, too ?
      // TODO: only pull @types/*?
      this.dependencies_of_repository(r, patches[dep.name]?.allDevDependencies ? true : "dev-types", {addLinks: true})

  }

}

class Repository {

  public tsmonojson: TSMONOJSONFile;
  public packagejsons: JSONFile[];
  public packagejson_paths: string[];
  public basename: string;

  constructor(public cfg: Config, public path: string, o: {dependency?: Dependency}) {
      this.basename = basename(path)
      if (/\/\//.test(path)) throw new Error(`bad path ${path}`)
      this.tsmonojson = new TSMONOJSONFile(`${path}/tsmono.json`)
      const p = o.dependency?.package_jsons || ['package.json']
      this.packagejson_paths = p.map((x) => `${path}/${x}`)
      this.packagejsons = this.packagejson_paths.map((x) => new JSONFile(x))
  }

    public tsmono_json_with_patches(){
        return deepmerge.all([{}, this.tsmonojson, patches[this.basename]?.tsmono ??  {}]);
    }

  public repositories(opts?: {includeThis?: boolean}): Repository[] {
    const dep_collection = new DependencyCollection(this.cfg, this.path, this.tsmonojson.dirs(this.cfg))
    dep_collection.dependencies_of_repository(this, true, {addLinks: false})
    dep_collection.do()
    dep_collection.print_warnings()

    const result = []
    if (opts && opts.includeThis)
      result.push(this);

    const seen: string[] = []
    for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      const r = v[0].repository
      if (r) {
        if (seen.includes(r.path)) continue;
        seen.push(r.path)
        result.push(r);
      }
    }
    return result;
  }

  public flush() {
    this.tsmonojson.flush()
      for (let v of this.packagejsons) {
          v.flush()
      }
  }

  public init() {
    const tsconfig = path.join(this.path, "tsconfig.json")
    this.tsmonojson.init(this.cfg, fs.existsSync(tsconfig) ? parse_json_file(tsconfig) : {})
  }

  public tsmono_json_contents(){
      const p = path.join(this.path, 'tsmono.json')
      return (fs.existsSync(p)) ? parse_json_file(p) : {}
  }

  public dependencies(o: {addLinks: boolean}): {
          links: Links,
          paths: Paths,
          dependencies: Dependency[],
          devDependencies: Dependency[],
  } {
      const to_dependency = (dep: string) => parse_dependency(dep, this.path)

      const presets = (key: "dependencies" | "devDependencies") => {
          const c_presets = get_path(this.tsmonojson.json, "presets", {})
          return Object.keys(c_presets).map(p => get_path(presets, p, key, []) as any[] ).flat(1)
      }

      const tsmono_json: any = deepmerge.all([{}, this.tsmono_json_contents(), patches[this.basename]?.tsmono ?? {}])

      const package_jsons_paths =
         ( tsmono_json?.js_like_source?.dependencies_from_package_jsons ?? ['package.json'] ).map((x:string) => path.join(this.path, x))


      const package_jsons = package_jsons_paths.filter((x: string) => fs.existsSync(x) )
          .map(parse_json_file)
      // console.log('package jsons', package_jsons_paths, package_jsons)

      const links = () => {
          const src = path.join(this.path, "src");
          const k = fs.existsSync(src) ? "src" : ""
          return { [k] : this.basename }
      }

      const package_json_dependencies    = (package_jsons.map((x: any) => map_package_dependencies_to_tsmono_dependencies(x.dependencies ?? []) ).flat())
      const package_json_devDependencies = (package_jsons.map((x: any) => map_package_dependencies_to_tsmono_dependencies(x.devDependencies ?? []) ).flat())


      const f = (x: string) => !/version=(workspace:\*|link:.\/types)$/.test(x)

      const deps = {
          dependencies:    ([...package_json_dependencies, ...(tsmono_json.dependencies ?? [])]).filter(f).map(to_dependency),
          devDependencies: ([...package_json_devDependencies, ...(tsmono_json.devDependencies ?? [])]).filter(f).map(to_dependency),
          links: tsmono_json?.js_like_source?.links ?? links(),
          paths: tsmono_json?.js_like_source?.paths ?? {},
      }
      console.log("deps of ", this.path, deps);
      return deps
  }

  public async update(cfg: Config, opts: {link_to_links?: boolean, install_npm_packages?: boolean, symlink_node_modules_hack?: boolean, recurse?: boolean, force?: boolean,
    } = {}) {
    /*
    * symlink_node_modules_hack -> see README. This will break other repos - thus you can only work on one repository
    * recurse -> run update on each dependency folder, too. This will result in duplicate installations (TODO: test on non tsmono on those just run fyn)
    *            also see reinstall-with-dependencies
    */
    // assert(!!opts.link_to_links, 'link_to_links should be true')

    // So we must link to local directory

    if (!fs.existsSync(`${this.path}/tsmono.json`)) {
      // only run fyn if package.json exists
      info("!! NO tsmono.json found, only trying to install npm packages")
      if (opts.install_npm_packages && fs.existsSync(`${this.path}/package.json`)) {
        info(`running ${cfg.npm_install_cmd} in dependency ${this.path}`)
        await run(cfg.npm_install_cmd[0] , {args: cfg.npm_install_cmd.slice(1), cwd: this.path})
      }
      return
    }

    const this_tsmono = `${this.path}/src/tsmono`
    const link_dir: string = `${this_tsmono}`; // /links

    if (opts.link_to_links) {
      // (fs.existsSync(link_dir) ? fs.readdirSync(link_dir) : []).forEach((x: string) => {
      //   fs.unlinkSync(path.join(link_dir, x))
      // })
      if (fs.existsSync(this_tsmono)) fs.removeSync(this_tsmono)
    } else {
      if (fs.existsSync(this_tsmono)) fs.removeSync(this_tsmono)
    }

    const cwd = process.cwd()
    const tsmonojson: any = this.tsmonojson.json || {}
    let package_json = clone(get_path(tsmonojson, "package", {}))
    if (package_json === undefined) {
      package_json = {}
    }
    package_json.dependencies = {}
    package_json.devDependencies = {}
    delete package_json.tsconfig
    const tsconfig: any = {}
    const dep_collection = new DependencyCollection(cfg, this.path, this.tsmonojson.dirs(this.cfg))
    dep_collection.dependencies_of_repository(this, true, {addLinks: false})
    dep_collection.do()
    dep_collection.print_warnings()

    const expected_symlinks: {[key: string]: string} = {}
    const expected_tools: {[key: string]: string} = {}

    // const path_for_tsconfig = (tsconfig_dir: string) => {
    //   const r: any = {}
    //   { // always set path
    //     for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
    //       if ( v[0].repository) {
    //         // path.absolute path.relative(from,to) ?

    //         const srcdir = patches[v[0].name]?.srcdir
    //         let src =
    //           srcdir
    //           ? srcdir
    //           :   !v[0].ignore_src && fs.existsSync(`${v[0].repository.path}/src`)
    //               ? "/src"
    //               : "";

    //         const resolved = path.resolve(cwd,
    //           (!!opts.link_to_links)
    //           ? path.join(link_dir, v[0].name, src)
    //           : path.join(v[0].repository.path, src))

    //         const rhs = path.relative(tsconfig_dir, resolved)
    //         info("tsconfig path", tsconfig_dir, "resolved", resolved, "result", rhs);

    //         const a = (lhs: string, rhs: string) => {
    //           const lhs_a = ensure_path(r, "compilerOptions", "paths", lhs, [])
    //           if (!lhs_a.includes(rhs)) {
    //             lhs_a.push(rhs)
    //           }
    //         }
    //         a(k, rhs) // without * for index.ts
    //         a(`${k}/*`, `${rhs}/*`) // for pkg/foo.ts or pkg/foo/sth.ts
    //       }
    //     }
    //   }
    //   return r;
    // };
      //
      const paths = {}

      const paths_add = (lhs: string, rhs: string) => {
          const lhs_a = ensure_path(paths, lhs, [])
          if (!lhs_a.includes(rhs)) {
              lhs_a.push(rhs)
          }
      }

      // link
      for (let [k, v] of Object.entries(dep_collection.links)) {
            if (opts.link_to_links) {
              expected_symlinks[`${link_dir}/${v}`] = path.relative(path.join(link_dir, path.dirname(v) ), path.resolve(cwd, k))
              paths_add(`${v}/*`, `src/tsmono/${v}/*`) // without * for index.ts
              paths_add(v, `src/tsmono/${v}`) // without * for index.ts
            }
      }

      // paths
      for (let [k, v] of Object.entries(dep_collection.paths)) {
          for (let v2 of v) {
              paths_add(k, `src/tsmono/${v2}`)
          }
      }



    for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      if (v[0].repository) {

        // if (opts.link_to_links) {
        //   expected_symlinks[`${link_dir}/${k}`] = `../../${v[0].repository.path}`
        // }

        const src_tool = `${v[0].repository.path}/src/tool`;
        (fs.existsSync(src_tool) ? fs.readdirSync(src_tool) : []).forEach((x) => {
          const match = /([^/\\]*)(\.ts)/.exec(x)
          if (match) {
            expected_tools[match[1]] = x
          }
        })
      }
    }

    const fix_ts_config = (x: any) => {
        ensure_path(x, "compilerOptions", {})
        if (x?.compilerOptions?.moduleResolution == 'node')
            console.log(chalk.red(`don't use moduleResolution node cause symlinks aren't found in a stable way`));

      // some sane defaults uer can overwrite which make most code just work
      // If you're not happy with these defaults you can always set the keys to overwrite these
      ensure_path(x, "compilerOptions", "preserveSymlinks", true) // so that stuff get's loaded from current directory and not multiple versions from dependencies
      ensure_path(x, "compilerOptions", "esModuleInterop", true) // eg to import m from "mithril"
      ensure_path(x, "compilerOptions", "moduleResolution", 'node')
      ensure_path(x, "compilerOptions", "module", "commonjs") // eg to import m from "mithril"
      ensure_path(x, "compilerOptions", "target", "esnext") // eg to import m from "mithril"
      ensure_path(x, "compilerOptions", "strict", true) // eg to import m from "mithril"
      ensure_path(x, "compilerOptions", "lib", [
            "es5",
            "es6", // array.find
            "dom",
            "es2015.promise",
            "es2015.collection",
            "es2015.iterable",
            "es2019", // [].flat()

            "dom", "dom.iterable" // for (const x in el.children)

      ]) // eg to import m from "mithril"

      if ("paths" in x.compilerOptions){
          if (!("baseUrl" in x.compilerOptions)){
              x.compilerOptions.baseUrl = "."
          } else {
              // Is this causing more problems than modules not being found
              throw "please drop baseUrl from your config. cause we have paths e.g. due to referenced dependencies it should be '.'"
          }
      }

      // for test/test.ts so that it can import {..} from "<lib-name>"
      // when using classic module resolution, node causes some errors
      ensure_path(x, 'compilerOptions', 'paths', this.basename, ["src/*"])

      // otherwise a lot of imports will not work
      x.compilerOptions.allowSyntheticDefaultImports = true
      x.compilerOptions.esModuleInterop = true

      // if you run tsc or such -> provide default dist folder to keep eventually created .js files apart
      ensure_path(x, "compilerOptions", "outDir", "./dist")

      // if we have an dist/outDir add to exclude
      for (const key of ["outDir", "outFile"]) {
        if (x.compilerOptions[key])
          ensure_path(x, "exclude", []).push(x.compilerOptions[key])
      }
      return x;
    }

  const path_for_tsconfig = (x: string) => {
      return {compilerOptions: {paths}};
  }

    if ("tsconfigs" in tsmonojson) {
      for (const [path_, merge] of Object.entries(tsmonojson.tsconfigs)) {
        info("tsconfig.json path", path_)
          // use protect
        fs.writeFileSync(path.join(path_, `tsconfig.json`), JSON.stringify(fix_ts_config(deepmerge.all([ tsmonojson.tsconfig || {}, path_for_tsconfig(path_), tsconfig, merge ])), undefined, 2), "utf8")
      }
    } else if ("tsconfig" in tsmonojson || Object.keys(path_for_tsconfig("")).length > 0) {
      const tsconfig_path = path.join(this.path, "tsconfig.json")
      const json: string = JSON.stringify(fix_ts_config(deepmerge( tsmonojson.tsconfig || {}, path_for_tsconfig(this.path), tsconfig )), undefined, 2)
      protect(tsconfig_path, () => { fs.writeFileSync(tsconfig_path, json, "utf8"); }, opts.force);
    }

    // clone(tsmonojson.tsconfig) || {}

    if (opts.link_to_links) {
      for (const [k, v] of Object.entries(expected_tools)) {
        // todo should be self contained but
        // node -r ts-node/register/transpile-only -r tsconfig-paths/register
        // works so well that you sohuld have a shourtcut in your .bashrc anywaya
        // so just making symlinks for now which should be good enough
        ["tsmono/tools", "tsmono/tools-bin", "tsmono/tools-bin-check" ].forEach((x) => { if (!fs.existsSync(x)) fs.mkdirSync(x) })

        // this is going to break if you have realtive symlinks ?
        expected_symlinks[`${this.path}/}tsmono/tools/${k}`] = v

        // TODO windows
        // boldly create in node_modules/.bin instead to make things just work ?
        const t = `tsmono/tools-bin/${k}`;
        del_if_exists(t);
        fs.writeFileSync(t, `#!/bin/sh\nnode -r ts-node/register/transpile-only -r tsconfig-paths/register ${v} "$@" `, "utf8")
        fs.writeFileSync(`tsmono/tools-bin-check/${k}`, `#!/bin/sh\nnode -r ts-node/register-only -r tsconfig-paths/register ${v} "$@"`, "utf8")
      }
    }

    for (const [k, v] of Object.entries(expected_symlinks)) {
      del_if_exists(k)
      fs.mkdirpSync(dirname(k))
        info(`symlinking ${k} -> ${v}`);
      if  (tsmonojson.rsync_instead_of_symlink) {
        await run('rsync', {args: ['-ra', `${path.join('src/tsmono', v)}/`, `${k}/`]})
        // rsync so that you can commit easily
      } else {
        // link
        fs.symlinkSync(v, k)
      }
    }

    ensure_path(package_json, "dependencies", {})
    ensure_path(package_json, "devDependencies", {})

    const add_dep = async (dep: string, first: Dependency, dep_name: string) => {
      if (first.url) {
        if (/git\+https/.test(first.url)) {
          ensure_path(package_json, dep, first.name, first.url)
        } else {
          throw new Error(`cannot cope with url ${first.url} yet, no git+https, fix code`)
        }

      } else ensure_path(package_json, dep, dep_name, "version" in first ? first.version : await cfg.npm_version_for_name(dep_name))
    }

    const add_npm_packages = async (dep: "dependencies" | "devDependencies") => {
      for (const dep_name of dep_collection[dep]) {
        const first = dep_collection.dependency_locactions[dep_name][0]
        if (!first.npm) continue;
        debug("adding npm", dep_name, first);
        // TODO: care about version
        await add_dep(dep, first, dep_name)
        if (first.types) {
          const type_name = `@types/${dep_name}`
          const type_version = await cfg.npm_version_for_name(type_name)
          debug(`got type version ${type_name} ${type_version}`);
          if (type_version !== undefined)
            ensure_path(package_json, "devDependencies", type_name, await cfg.npm_version_for_name(type_name))
        }
      }
    }

    // manually forcing ts-node dependency for now
    ensure_path(package_json, "devDependencies", "ts-node", await cfg.npm_version_for_name("ts-node"))

    await add_npm_packages("dependencies")
    await add_npm_packages("devDependencies")

    backup_file(package_json.path)
    this.packagejsons[0].json = package_json;
    this.packagejsons[0].flush_protect_user_changes(opts.force)

    if (opts.install_npm_packages) {
      debug("install_npm_packages");

      const to_be_installed = fs.readFileSync(this.packagejson_paths[0], "utf8")
      const p_installed = `${this.packagejson_paths[0]}.installed`
      const installed = fs.existsSync(p_installed) ? fs.readFileSync(p_installed, "utf8") : undefined
      info("deciding to run npm_install_cmd in", this.path, this.packagejson_paths[0], p_installed, installed === to_be_installed);
      if (installed !== to_be_installed || !fs.existsSync(path.join(this.path, "node_modules")))  {
        await run(cfg.npm_install_cmd[0], {args: cfg.npm_install_cmd.slice(1), cwd: this.path})
      }
      fs.writeFileSync(p_installed, to_be_installed)
    }

    if (opts.symlink_node_modules_hack) {
      for (const dir of this.tsmonojson.dirs(this.cfg)) {
        const n = `${dir}/node_modules`
        if (fs.existsSync(n)) {
          fs.unlinkSync(n)
        }
        info(`hack: symlinking node modules to ${n} ${path.relative(dir, `${this.path}/node_modules`)}`);
        fs.symlinkSync(path.relative(dir, `${this.path}/node_modules`), n)
      }
    }
    if (opts.recurse) {
      const opts2 = clone(opts)
      opts2.symlink_node_modules_hack = false; // mutually exclusive. when using it ony one repository can be active
      const repositories = Object.values(dep_collection.dependency_locactions).map((x) => x[0].repository)

      // TODO run in parallel ?
      for (const r of repositories) {
        if (r === undefined) continue
        info(`recursing into dependency ${r.path}`);
        await r.update(cfg, opts2)
      }
    }
  }

  public async add(cfg: Config, dependencies: string[], devDependencies: string[]) {
    // TODO: check prefix "auto" etc to keep unique or overwrite
    this.init()
    const j = this.tsmonojson.json;
    j.dependencies = [...j.dependencies, ...dependencies.filter((x) => !(j.dependencies || []).includes(x))]
    j.devDependencies = [...j.devDependencies, ...devDependencies.filter((x) => !(j.devDependencies || []).includes(x))]
    await this.update(cfg, {link_to_links : true, install_npm_packages : true})
  }

}

// COMMAND LINE ARGUMENTS
const parser = new ArgumentParser({
  addHelp: true,
  description: `tsmono (typescript monorepository), see github's README file`,
  version: "0.0.1",
});
const sp = parser.addSubparsers({
  title: "sub commands",
  dest: "main_action",
})
const init   = sp.addParser("init", {addHelp: true})
const add    = sp.addParser("add", {addHelp: true})
add.addArgument("args", {nargs: "*"})

const care_about_remote_checkout = (x: ArgumentParser) => x.addArgument("--care-about-remote-checkout", { action: "storeTrue", help: "on remote site update the checked out repository and make sure they are clean"})

const update = sp.addParser("update", {addHelp: true, description: "This also is default action"})
update.addArgument("--symlink-node-modules-hack", {action: "storeTrue"})
update.addArgument("--link-via-root-dirs", {action: "storeTrue", help: "add dependencies by populating root-dirs. See README "})
update.addArgument("--link-to-links", {action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks. Useful to use ctrl-p in vscode to find files. On Windows 10 cconsider activating dev mode to allow creating symlinks without special priviledges."})
update.addArgument("--recurse", {action: "storeTrue"})
update.addArgument("--force", {action: "storeTrue"})

const zip = sp.addParser("zip", {addHelp: true, description: "This also is default action"})

const print_config_path = sp.addParser("print-config-path", {addHelp: true, description: "print tsmon.json path location"})

const write_config_path = sp.addParser("write-sample-config", {addHelp: true, description: "write sample configuration file"})
write_config_path.addArgument("--force", {action: "storeTrue"})
const echo_config_path = sp.addParser("echo-sample-config", {addHelp: true, description: "echo sample config for TSMONO_CONFIG_JSON env var"})

const update_using_rootDirs = sp.addParser("update-using-rootDirs", {addHelp: true, description: "Use rootDirs to link to dependencies essentially pulling all dependecnies, but also allowing to replace dependencies of dependencies this way"})
// update_using_rootDirs.addArgument("--symlink-node-modules-hack", {action: "storeTrue"})
// update_using_rootDirs.addArgument("--link-via-root-dirs", {action: "storeTrue", help: "add dependencies by populating root-dirs. See README "})
// update_using_rootDirs.addArgument("--link-to-links", {action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks"})
update_using_rootDirs.addArgument("--recurse", {action: "storeTrue"})
update_using_rootDirs.addArgument("--force", {action: "storeTrue"})

const commit_all  = sp.addParser("commit-all", {addHelp: true, description: "commit all changes of this repository and dependencies"})
commit_all.addArgument("--force", {action: "storeTrue"})
commit_all.addArgument("-message", {})

const push = sp.addParser("push-with-dependencies", {addHelp: true, description: "upload to git repository"})
push.addArgument("--shell-on-changes", {action: "storeTrue", help: "open shell so that you can commit changes"})
push.addArgument("--git-push-remote-location-name", { help: "eg origin"})
care_about_remote_checkout(push)

type TsmonoConfig = {
    directories: string
}

interface RemoteLocation {
    server: string,
    "repositories-path-bare": string,  // where to push to  (remote basename eg repos will be put into bare-repositories/<NAME>
    "repositories-path-checked-out": string,      // where to keep checked out versiorn if you choose --care-about-remote-checkout)
    gitRemoteLocationName: string, // .git/config
    ignoreWhenPulling?: string[]
    ignoreWhenPushing?: string[]
}


push.addArgument("--config-json", { help: "See README.md"})

push.addArgument("--run-remote-command", {help: "remote ssh location to run git pull in user@host:path:cmd"})

const pull = sp.addParser("pull-with-dependencies", {addHelp: true, description: "pull current directory from remote location with dependencies"})
pull.addArgument("--update", { help: "if there is a tsmono.json also run tsmono update"})
pull.addArgument("--link-to-links", { help: "when --update use --link-to-links see update command for details"})
care_about_remote_checkout(pull)

const clean = sp.addParser("is-clean", {addHelp: true, description: "check whether git repositories on local/ remote side are clean"})
clean.addArgument("--no-local", { action: 'storeTrue', help: "don't look at local directories"})
clean.addArgument("--no-remote", { action: 'storeTrue', help: "don't\t look at remote directories"})
clean.addArgument("--shell", {action: "storeTrue", help: "if dirty start shell so that you can commit"})

const list_dependencies = sp.addParser("list-local-dependencies", {addHelp: true, description: "list dependencies"})

const from_json_files = sp.addParser("from-json-files", {addHelp: true, description: "try to create tsmono.json fom package.json and tsconfig.json file"})
push.addArgument("--force", {action: "storeTrue", help: "overwrites existing tsconfig.json file"})

const reinstall = sp.addParser("reinstall-with-dependencies", {addHelp: true, description: "removes node_modules and reinstalls to match current node version"})
reinstall.addArgument("--link-to-links", {action: "storeTrue", help: "link ts dependencies to tsmono/links/* using symlinks"})

const watch  = sp.addParser("watch", {addHelp: true})


const esbuild_server_client_dev = sp.addParser("esbuild-server-client-dev", {addHelp: true, description: "experimental"})
esbuild_server_client_dev.addArgument("--server-ts-file", { help: "server.ts"})
esbuild_server_client_dev.addArgument("--web-ts-file", { help: "web client .ts files"})

const vite_server_and_api = sp.addParser("vite-server-and-api", {addHelp: true, description: "experimental"})
vite_server_and_api.addArgument("--server-ts-file", { help: "server.ts"})
vite_server_and_api.addArgument("--api-ts-file",   { help: "server.ts like file providing API"})

const args = parser.parseArgs();

const dot_git_ignore_hack = async () =>  {
  if (!fs.pathExistsSync("tsmono.json")) return;

  const f = ".gitignore"
  const lines = (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "").split("\n")

  const to_be_added = [
    "/node_modules",
    "/.vscode",
    "/dist",
    "/.fyn",
    "/tsconfig.json.protect",
    "/package.json.installed",
    "/package.json.protect",
    "/package.json",  // derived by tsmono, but could be comitted
    "/tsconfig.json", // derived by tsmono, contains local setup paths
    "/src/tsmono"
  ].filter((a) => ! lines.find((x) => x.startsWith(a)))

  if (to_be_added.length > 0) {
    fs.writeFileSync(f, [...lines, ...to_be_added].join("\n"), "utf8")
  }
}

const tslint_hack = async () => {
  // this is biased  but its going to save your ass
  if (!fs.existsSync("tslint.json")) {
    fs.writeFileSync("tslint.json", `
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
    `, "utf8")

  } else {
    const j = parse_json_file("tslint.json")
    if (!j.rules["no-floating-promises"] && !j.rules["await-promise"])
      throw new Error(`please add

            "no-floating-promises": true,
            "no-return-await": true,
            "await-promise": [true, "PromiseLike"],

            to your tslint.json 's rules section because it might save your ass
      `)
  }

}

type WithUser = <R>(run: () => Promise<R>) => Promise < R >

type Task = <R>(o: {with_user: WithUser}) => Promise < void >

interface TaskDescription {
    task: string,
    start: Task,
}

interface Wait < R > {r: (r: R) => void, action: () => Promise<R>}

const run_tasks = async (tasks: TaskDescription[]) => {
    // parallel implementation of running tasks but synchronize when requesting
    // action from user
    //
    const lock = createLock({preventExit: true})

    const with_user: WithUser = async (run) => {
        const release = await lock.aquire_lock()
        try {
            return await run()
        } finally {
            release();
        }
    }

    await Promise.all(tasks.map(async (x) => {
        await with_user(async () => info(`starting ${x.task}`) )
        await x.start({with_user: (run) => {
            return with_user(async () => {
                info(`!=== task ${x.task} requires your attention`)
                return run()
            })
        }})
        await with_user(async () => info(`done ${x.task}`) )
    }))
}

const main = async () => {
  const hd = homedir()
  const cache = new DirectoryCache(`${hd}/.tsmono/cache`)

  const configDefaults = {
    cache,
    fetch_ttl_seconds : 60 * 24,
    bin_sh: "/bin/sh",
    npm_install_cmd: ["fyn"],
    cacheDir: "~/.tsmono/cache",
  }

  const json_or_empty = (s: string|undefined) => {
      if (s){
          try {
              return JSON.parse(s)
          } catch (e){
              throw `error parsing JSON ${s}`
          }
      } else return {}
  }

  const config_from_home_dir_path = path.join(hd, ".tsmmono.json")

  const env_configs = ["", "1", "2", "3"].map((x) => json_or_empty( process.env[`TSMONO_CONFIG_JSON${x}`] ))
  const env_config2 = json_or_empty( process.env.TSMONO_CONFIG_JSON2 )
  const homedir_config = json_or_empty (fs.existsSync(config_from_home_dir_path) ? fs.readFileSync(config_from_home_dir_path, "utf8") : undefined)
  const args_config = json_or_empty(args.config_json)

  const config: ConfigData = Object.assign({ }, configDefaults, homedir_config, args_config, ...env_configs, env_config2 )
  const cfg: Config = { ...cfg_api( config ), ...config  }

  if (! ( cfg.directories == undefined ||  Array.isArray(cfg.directories) ))
    throw `directories must be an array! Check your configs`

  console.log(`configDefaults is ${JSON.stringify(configDefaults, undefined, 2)}`)
  console.log(`env_configs are ${JSON.stringify(env_configs, undefined, 2)}`)
  console.log(`env_config2export is ${JSON.stringify(env_config2, undefined, 2)}`)
  console.log(`homedir_config is ${JSON.stringify(homedir_config, undefined, 2)}`)
  console.log(`args_config is ${JSON.stringify(args_config, undefined, 2)}`)

  const ssh_cmd = (server: string) =>  async (stdin: string, args?: {stdout1: true}): Promise<string> => {
      return run("ssh", {args: [server], stdin, ...args})
  }

  const p = new Repository(cfg, process.cwd(), {})

  const ensure_is_git = async (r: Repository) => {
    if (!fs.existsSync(path.join(r.path, ".git"))) {
      console.log(`Please add .git so that this dependency ${r.path} can be pushed`)
      await run(cfg.bin_sh, { cwd: r.path, stdout1: true })
    }
  }

  const update = async () => {
    await p.update(cfg, {link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: args.symlink_node_modules_hack, recurse: args.recurse, force: args.force})
  }

  if (args.main_action === "init") {
    p.init()
    return;
  }
  if (args.main_action === "add") {
    const d: string[]  = []
    const dd = []
    let  add = d
    for (const v of args.args) {
      if (v === "-d") {
        add = dd
      }
      dd.push(v)
    }
    await p.add(cfg, d, dd)
    return;
  }

  if (args.main_action === "zip") {
      console.log("TODO : zip target.zip $( echo tsconfig.json; echo package.json; find -L  src | grep -ve 'tsmono.*tsmono|\\.git'")
  }

  if (args.main_action === "update") {
    await update();
    await tslint_hack();
    await dot_git_ignore_hack()
    return
  }
  if (args.main_action === "update_using_rootDirs") {
    // await update_using_rootDirs();
    await tslint_hack();
    return
  }

  if (args.main_action === "print-config-path") {
    console.log("config path:", config_from_home_dir_path)
    return
  }
  if (args.main_action === "write-sample-config") {
    if (!fs.existsSync(config_from_home_dir_path) || args.force) {
      fs.writeFileSync(config_from_home_dir_path, config)
    } else {
      console.log(config_from_home_dir_path, "not written because it exists. Try --force")
    }
    return;
  }

  if (args.main_action === "echo-sample-config") {
    console.log(`TSMONO_CONFIG_JSON=${JSON.stringify(config)}`)
    return;
  }
  if (args.main_action === "add") {
    throw new Error("TODO")  }

  if (args.main_action === "list-local-dependencies") {
    silent = true;
    const p = new Repository(cfg, process.cwd(), {})
    for (const r of p.repositories()) {
        console.log("rel-path: ", r.path);
    }
  }

  if (args.main_action === "from-json-files") {
    // try creating tsmono from json files
    // TODO: test this

      if (fs.existsSync("tsmono.json") && ! args.force) {
          console.log("not overwriting tsmono.json, use --force");
          return;
      }

      console.log("pwd", process.cwd())
      const pwd = process.cwd()

      const package_contents = fs.existsSync("package.json") ? (await readJsonFile(path.join(pwd, "./package.json")))  : undefined;
      let tsconfig_contents = fs.existsSync("tsconfig.json") ? (await readJsonFile(path.join(pwd, "./tsconfig.json"))) : undefined;

      if (package_contents === undefined && tsconfig_contents === undefined) {
          console.log("Neither package.json nor tsconfig.json found");
          return ;
      }

      tsconfig_contents = tsconfig_contents || {}

      const tsmono_contents = {
          package : {} as {[key: string]: any},
          dependencies: [] as string[],
          devDependencies: [] as string[],
          tsconfig: tsconfig_contents || {},
      };

      // process package.json
      for (const [k, v] of Object.entries(package_contents || {})) {
          if (k === "dependencies" || k === "devDependencies") {
              for (const [pack, version] of Object.entries(v as {})) {
                  tsmono_contents[k].push(`${pack};version=${version as string}`)
              }
          } else {
              tsmono_contents.package[k] = v
          }
      }
      fs.writeFileSync("tsmono.json", JSON.stringify(tsmono_contents, undefined, 2), "utf8")
  }

  if (args.main_action === "pull-with-dependencies") {
    // TODO: think about relative directories ..
    const cwd = process.cwd()
    const reponame: string = path.basename(cwd)
    const rL = cfg["remote-location"]
    const sc = ssh_cmd(rL.server)

    let remote_exists = true;

    // test remote is git repository
    try {
      await sc(`
      [ -f ${rL["repositories-path-checked-out"]}}/${reponame}/.git/config ]
      `, {stdout1: true})
    } catch (e) {
      info(`remote directory ${rL["repositories-path-checked-out"]}/${reponame}/.git/config does not exit, cannot determine dependencies`)
      remote_exists = false
    }

    const items = await ( async () =>  {
    if (!remote_exists) return [];

       // // use remote list-local-dependencies
       try {
           return ( await sc(`
             cd ${rL["repositories-path-checked-out"]}/${reponame} && tsmono list-local-dependencies
           `)).split("\n").filter((x) => /rel-path: /.test( x) ).map((x) => x.slice(11) )
       } catch (e){
           console.log(chalk.red(`error getting dependencies assuming empty list`));
           console.log(e);
           return []
       }
    })()

    info("pulling " + JSON.stringify(items))

    for (const path_ of ([`../${reponame}`, ...items])) {
      info(`pulling ${path_}`)
      const p_ = path.join(cwd, path_)
      const repo = basename(p_)

      if ((rL.ignoreWhenPulling || []).includes(repo)) continue;

      if (!fs.existsSync(p_)) {
        info(`creating ${p_}`)
        fs.mkdirpSync(p_)
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
            git remote add origin ${path.relative(path.join(rL["repositories-path-checked-out"], repo), rL["repositories-path-bare"])}/${repo}
            git push --set-upstream origin master
          )
        }
        ${ args.care_about_remote_checkout ? `( cd $repo; git pull  )` : ""}
        `)


      if (!fs.existsSync(path.join(p_, ".git/config"))) {
        await run("git", { args: ["clone", `${rL.server}:${rL["repositories-path-bare"]}/${repo}`, p_] })
      }
      info(`pulling ${p_} ..`)
      await run("git", { args: ["pull"], cwd: p_ })

      if (args.update && fs.existsSync(path.join(p_, "tsmono.json"))) {
          // run tsmono update
          const p = new Repository(cfg, p_, {})

          await p.update(cfg, {
            link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: false, recurse: true, force: true,
            // , update_cmd: {executable: "npm", args: ["i"]}
          })
      }
    }

  }

  if (args.main_action === "is-clean") {
      info("using local dependencies as reference")
      const repositories = p.repositories({includeThis: true})

      const rL = cfg["remote-location"]

      const sc = () => ssh_cmd(rL.server)

      const results: string[] = []

      const check_local =  (r: Repository): Task => async (o) => {
        const is_clean = async () => ("" === await run("git", { args: ["diff"], cwd: r.path }) ? "clean" : "dirty")
        const clean_before = await is_clean()
        if (clean_before === "dirty"  && args.shell) {
          await o.with_user(async () => {
            info(`${r.path} is not clean, starting shell`)
            await run(cfg.bin_sh, { cwd: r.path, stdout1: true })
          })
        }
        results.push(`${r.basename}: ${clean_before} -> ${await is_clean()}`)
      }

      const check_remote =  (r: Repository): Task => async (o) => {
       const is_clean = async () => ("" === await sc()(`cd ${rL["repositories-path-bare"]}/${r.basename}; git diff`) ? "clean" : "dirty")
       const clean_before = await is_clean()
       if (clean_before === "dirty"  && args.shell) {
          await o.with_user(async () => {
            info(`${r.path} is not clean, starting shell`)
            await run("ssh", {args: [rL.server, `cd ${rL["repositories-path-checked-out"]}/${r.basename}; exec $SHELL -i`], stdout1: true })
          })
        }
       results.push(`remote ${r.basename}: ${clean_before} -> ${await is_clean()}`)

      }

    // check local

      const tasks: TaskDescription[] = [
        ...(
          (!args.no_local)
          ?  repositories.map((x) => ({ task: `local clean? ${x.path}`, start: check_local(x)}))
          : []),
        ...(
          (!args.no_remote)
          ?  repositories.map((x) => ({task: `remote clean? ${x.path}`, start: check_remote(x)}))
          : []),
    ]

      await run_tasks(tasks)

      info("=== results ===")
      for (const i of results) {
        info(i)
      }
  }

  if (args.main_action === "push-with-dependencies") {
    const p = new Repository(cfg, process.cwd(), {})
    const rL = cfg["remote-location"]

    const basenames_to_pull: string[] = []
    const seen: string[] = [] // TODO: why aret there duplicates ?

    const ensure_repo_committed_and_clean = async (r: Repository) => {
      info(r.path, "checking for cleanness")
      // 1 updates / commit
      if (args.shell_on_changes && "" !== await run("git", {args: ["diff"], cwd: r.path})) {
          info(`${r.path} is dirty, please commit changes starting shell`)
          await run(cfg.bin_sh, {cwd: r.path, stdout1: true})
       }
    }

    const ensure_remote_location_setup = async (r: Repository) => {
      info(r.path, "ensuring remote setup")
        // ensure remote location is there
      const reponame = r.basename
      if ("" === await run(`git`, {expected_exitcodes: [0, 1], args: `config --get remote.${rL.gitRemoteLocationName}.url`.split(" "), cwd: r.path})) {
          // local side
          await run(`git`, {args: `remote add ${rL.gitRemoteLocationName} ${rL.server}:${rL["repositories-path-bare"]}/${reponame}`.split(" "), cwd: r.path })

          // remote side
          await run(`ssh`, {args: [ rL.server], cwd: r.path, stdin: `
          bare=${rL["repositories-path-bare"]}/${reponame}
          target=${rL["repositories-path-checked-out"]}/${reponame}
          [ -d "$bare" ] || mkdir -p "$bare"; ( cd "$bare"; git init --bare; )
          ${ args.care_about_remote_checkout ? `[ -d "$target" ] || ( git clone $bare $target; cd $target; git config pull.rebase true; )` : ""}
          ` })

          // local side .git/config
          await run(`git`, {args: `push --set-upstream ${rL.gitRemoteLocationName} master`.split(" "), cwd: r.path })
        }
    }

    const remote_update = async (r: Repository) => {
      if (!args.care_about_remote_checkout) return;
      const reponame = r.basename
      await run(`ssh`, {args: [ rL.server],
        cwd: r.path, stdin: `
          target=${rL["repositories-path-checked-out"]}/${reponame}
          cd $target
          git pull
      `})

    }

    const push_to_remote_location = async ( r: Repository) => {
        await ensure_is_git(r)
        await ensure_repo_committed_and_clean(r)
        await ensure_remote_location_setup(r)

        // 2 push
        if (rL.gitRemoteLocationName) {
          info(`... pushing in ${r.path} ...`)
          await run("git", {args: ["push", rL.gitRemoteLocationName], cwd: r.path})
        }
        // 3 checkout
        await remote_update(r)
    }

    for (const rep of p.repositories({includeThis: true})) {
        await push_to_remote_location(rep)
    }

    // for (const v of basenames_to_pull) {
    //     const user_host  = args.run_remote_command.split(":")
    //     const target_path = `${user_host[1]}/${v}`
    //     console.log(`... pulling ${args.ssh_remote_location_git_pull}${v} ...`)
    //     await run("ssh", {args: [user_host[0]], stdin: `cd ${target_path}; ${user_host[2]}`}  )
    // }
  }

  if (args.main_action === "commit-all") {
    const force = args.force

    const p = new Repository(cfg, process.cwd(), {})
    for (const r of p.repositories()) {
      if (fs.existsSync(path.join(r.path, ".git"))) {
        const stdout = await run("git", {args: ["diff"], cwd: r.path})
        if (stdout !== "") {
           console.log(stdout)
           if (force) {
              await run("git", {args: ["commit", "-am", args.message], cwd: r.path})
           } else {
              console.log(r.path, "has uncommited changes, commit now")
              await run(cfg.bin_sh, { cwd: r.path, stdout1: true })
           }
        }
      }
    }
  }

  if (args.main_action === "reinstall-with-dependencies") {
    const p = new Repository(cfg, process.cwd(), {})
    const dep_collection = new DependencyCollection(cfg, p.path, p.tsmonojson.dirs(cfg))
    dep_collection.dependencies_of_repository(p, true, {addLinks: false})
    dep_collection.do()
    dep_collection.print_warnings()
    const seen: string[] = [] // TODO: why aret there duplicates ?
    for (const [k, v] of Object.entries(dep_collection.dependency_locactions)) {
      const r = v[0].repository
      if (r) {
        if (seen.includes(r.path)) continue;
        seen.push(r.path)
      }
    }

    for (const r of p.repositories()) {
        fs.removeSync(path.join(r.path, "node_modules"))
        const package_json_installed = path.join(r.path, "package.json.installed");
        if (fs.existsSync(package_json_installed))
          fs.removeSync(package_json_installed)
    }

    await p.update(cfg, {link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: false, recurse: true, force: true,
        // , update_cmd: {executable: "npm", args: ["i"]}
    })
  }

  const external_libarries = ["fsevents", "esbuild", "oracledb", "better-sqlite3", "sqlite3", "pg-native", "tedious", "mysql2"]
  const esbuild_external_flags = external_libarries.map((x) => `--external:${x}`)

  type CompileOtions = {ts_file: string}
  const restartable = () => {
    const r = restartable_processes();

    const dist_dir = (o: CompileOtions) => `./dist/${path.basename(o.ts_file)}`

    const compile_server = (o: CompileOtions) => r.spawn(`compile_${path.basename(o.ts_file)}`,  'esbuild', [ `--outdir=${dist_dir(o)}`, "--bundle", `--platform=node`, o.ts_file, ...esbuild_external_flags])
    const compile_web = (o: CompileOtions)    => r.spawn(`compile_${path.basename(o.ts_file)}`,  'esbuild', [ `--outdir=${dist_dir(o)}`, "--bundle", `--sourcemap`, o.ts_file])

    const restart = (o: CompileOtions) => r.spawn(`run_${path.basename(o.ts_file)}`, 'node', [path.join(dist_dir(o), path.basename(o.ts_file).replace(/\.ts/,'.js') )], true)

    return {
        compile_server,
        compile_web,
        restart,
        ...r,

    }
  }

  const watch = (f: () => void) => {
        let timer: any = "wait"

        import('chokidar').then((chokidar) => {
        chokidar.watch('.', {
            followSymlinks: true,
            ignored: /dist.*|.log/,
            // ignored: /(^|[\/\\])\../,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            },
        })
        .on('ready', () => { timer = undefined; console.log(chalk.green(`chokidar setup`)); })
        .on('all', (...args) => {
            if (timer == "wait") return;
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
            for (let arg of args) {
                console.log("recompiling cause ", JSON.stringify(args), 'changed');
            }
                f();
            }, 50)
        }); })

  }

    if (args.main_action == "esbuild-server-client-dev"){

        const {compile_server, compile_web, restart, kill_all} = restartable()
        process.on('exit', () => kill_all());
        // process.on('SIGINT', )

        const server_ts = args.server_ts_file
        const o_server = { ts_file: server_ts }
        const o_web = { ts_file: args.web_ts_file }

        const recompileAndStart = () => {
            compile_web(o_web).catch(e => {})
            if (server_ts) compile_server(o_server).then(() => restart(o_server)).catch(e => {});
        }

        watch(() => recompileAndStart())

        recompileAndStart()
    }


    if (args.main_action == "vite-server-and-api"){
        /* node like development is compilcated cause you cannot easily hot reload api
         * but you can recompile and reload.
         * You don't want to recompile and reload the server manging HRM of your web app.
         *
         * So for developming you want to restart the api and ssr, but not the
         * dev server managing the the client updates
         *
         * vite comes close - this just implements resterting the parties ..
         */

        const {compile_server, compile_web, restart, kill_all, spawn} = restartable()
        process.on('exit', () => kill_all());

        // spawn("build_ssr", "fyn", ["run", "build:ssr"], true)

        const o_server = { ts_file: args.server_ts_file }
        const o_api = { ts_file: args.api_ts_file }

        compile_server(o_server).then(() => restart(o_server)).catch(e => {});

        // const recompileAndStartAPI = () => compile_server(o_api).then(() => restart(o_api)).catch((e) => "compiling / starting api failed")
        // watch(() => recompileAndStartAPI())
        // recompileAndStartAPI()
    }

  // default action is update - does not work due to argparse (TOOD, there is no reqired: false for addSubparsers)
  // await update()
}

process.on("unhandledRejection", (error: any) => {
  console.error(error); // This prints error with stack included (as for normal errors)
  if (error.message)
    console.error(error.message); // the error above does not print the message for whatever reason, so do so

  throw error; // Following best practices re-throw error and let the process exit with error code
});

main().then(
  () => {},
  (e) => {
      console.log(chalk.red(e))
      process.exit(1)
  },
)
