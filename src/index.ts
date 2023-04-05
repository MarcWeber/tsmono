import { cfg_api, Links, Paths, RemoteLocation, Config, CP, DirectoryCache, ConfigData} from "./types";
import * as fs from "fs-extra";
import { JSONFile, parse_json_file, protect } from "./jsonfile";
import Os from 'os'
import chalk from "chalk";
import * as path from "path";

import debug_ from "./debug";
const debug = debug_("tsmono.index")

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

export const readJsonFile = async (path: string): Promise<any> => {
    debug("reading", path);
    const jf = await jsonFile(path)
    return jf.data
}


// TODO: use path.join everywhere

const info = (...args: any[]) => {
      if (!silent) console.log(...args);
    }

export const t_cfg = {
    silent: false as boolean,

    info,
    warning: info,

    verbose: info
}

export let silent: boolean = false;

/// LIBRARY SUPPORT CODE
export const clone = (x: any) => {
  return x === undefined ? undefined : JSON.parse(JSON.stringify(x))
}

export const unique = <T>(x: T[]): T[] => { return x.filter((v, i) => x.indexOf(v) === i) }

export const del_if_exists = (path: string) => {
  // fs.existsSync doesn't work on symlinks
  try { fs.unlinkSync(path); } catch (e) { }
}

export const assert = (a: boolean, msg: string = "") => {
    if (!a) throw new Error(msg)
}

export const assert_eql = (a: string, b: string) => {
    assert(a.trim() === b.trim(), `assertion ${JSON.stringify(a)} === ${JSON.stringify(b)} failed`)
}

export const run = async (cmd: string, opts: {
  args?: string[],
  stdin?: string,
  stdout1?: boolean,
  expected_exitcodes?: number[],
} & SpawnOptions) => {
  const args = opts.args || [];
  console.log("args", args)
  t_cfg.info("running", cmd, args, "in", opts.cwd);
  let stdout = ""
  let stderr = ""
    // duplicate code
  await new Promise((a, b) => {
      const child = spawn(cmd, args, Object.assign( opts, {
          stdio: [ "stdin" in opts ? "pipe" : 0 , opts.stdout1 ? 1 : "pipe" , "pipe" ],
      }));

      if (child.stdin) {
        if ("stdin" in opts && child.stdin) {
          t_cfg.verbose("stdin is", opts.stdin)
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


export const parse_dependency = (s: string, origin?: string): Dependency => {
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


export const backup_file = (path: string)  => {
    if (fs.existsSync(path)) {
      const bak = `${path}.bak`
      if (fs.existsSync(bak))
      fs.renameSync(path, bak)
    }
}

// use object-path instead ?
export const get_path = (...args: any[]): any => {
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

export const ensure_path = (obj: any, ...args: any[]): any => {
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



export class TSMONOJSONFile extends JSONFile {

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

export const map_package_dependencies_to_tsmono_dependencies = (versions: {[key: string]: string}) => {
  const r = []
  for (const [k, v] of Object.entries(versions)) {
    r.push(`${k};version=${v}`)
  }
  return r;
}

export type DependencyWithRepository = Dependency & {repository?: Repository}

export const dependency_to_str = (d: DependencyWithRepository) => {
  return `${d.name} ${d.npm && d.repository ? "npm and repository?" : (d.repository ? `from ${d.repository.path}` : `from npm ${d.version ? d.version : ""}`)} requested from ${d.origin}`
}

export class DependencyCollection {

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
        t_cfg.warning(`WARNING: ${this.origin} dependency ${k} requested as npm and from disk, choosing first ${v.map(dependency_to_str).join("\n")}`)
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
        t_cfg.warning(`WARNING: ${this.origin} transient dependencies ${k} with competing versions found:`)
        for (const v of with_version) {
          t_cfg.warning(v.dep.origin, v.versions);
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
      let dirs_lookup = this.dirs.map((x) => path.join(x, provided_by[dep.name] ?? dep.name))
      dirs_lookup = [...dirs_lookup, ...dirs_lookup.map( (x) => `${dirname(x)}/ts-${basename(x)}`)]

      t_cfg.verbose("dirs_lookup", dirs_lookup);

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

export class Repository {

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
              expected_symlinks[`${link_dir}/${v.replace(/^ts-/, '')}`] = path.relative(path.join(link_dir, path.dirname(v) ), path.resolve(cwd, k))
              paths_add(`${v.replace(/^ts-/, '')}/*`, `src/tsmono/${v.replace(/^ts-/, '')}/*`) // without * for index.ts
              paths_add(v.replace(/^ts-/, ''), `src/tsmono/${v.replace(/^ts-/, '')}`) // without * for index.ts
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
        // if (x?.compilerOptions?.moduleResolution == 'node')
            // console.log(chalk.red(`don't use moduleResolution node cause symlinks aren't found in a stable way`));

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
              throw `please drop baseUrl from your config in ${this.path}. cause we have paths e.g. due to referenced dependencies it should be '.'`
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

export const tslint_hack = async ({cfg, p} : CP) => {
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

const dot_git_ignore_hack = async (cfg: Config) =>  {
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

export const build_config = (o: {config_json?: string} = {}) => {
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
  const args_config = json_or_empty(o.config_json)

  const config: ConfigData = Object.assign({ }, configDefaults, homedir_config, args_config, ...env_configs, env_config2 )

  debug(`configDefaults is ${JSON.stringify(configDefaults, undefined, 2)}`)
  debug(`env_configs are ${JSON.stringify(env_configs, undefined, 2)}`)
  debug(`env_config2export is ${JSON.stringify(env_config2, undefined, 2)}`)
  debug(`homedir_config is ${JSON.stringify(homedir_config, undefined, 2)}`)
  debug(`args_config is ${JSON.stringify(args_config, undefined, 2)}`)

  return {
      cfg: { ...cfg_api( config ), ...config  } as Config,
      more: {
          config,
          config_from_home_dir_path,
      }
  }
}


export type UpdateFlags = {
    link_to_links?: boolean,
    symlink_node_modules_hack?: boolean
    recurse?: boolean
    force?: boolean
}

const update = async ({cfg, p}: CP, flags: UpdateFlags) => {
    await p.update(cfg, {link_to_links: flags.link_to_links, install_npm_packages: true, symlink_node_modules_hack: flags.symlink_node_modules_hack, recurse: flags.recurse, force: flags.force})
}

export const action_update = async (o: {
    cfg: Config
    cwd: string
    flags: UpdateFlags
}) => {

    const p = new Repository(o.cfg, o.cwd, {})

    const cp = {cfg: o.cfg, p}

    await update(cp, o.flags);
    await tslint_hack(cp);
    await dot_git_ignore_hack(o.cfg)

    t_cfg.silent = true;
    const lines = []
    for (const r of p.repositories()) {
        lines.push(`dep-basename: ${path.basename(r.path)}`)
    }
    const local_deps_file = ".tsmono-local-deps"
    if (!fs.pathExistsSync(local_deps_file)){
        console.log(chalk.red(`please commit ${local_deps_file}`));
    }
    fs.writeFileSync(local_deps_file, lines.join("\n"), 'utf-8')
    return

}
