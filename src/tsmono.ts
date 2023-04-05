import { DirectoryCache, ConfigData, Config, cfg_api } from "./types"
import { ArgumentParser } from "argparse";
import {Links, Paths} from "./types";
import Os from 'os'
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
import { Repository, silent, t_cfg, readJsonFile, DependencyCollection, action_update, tslint_hack, run } from "./"

// COMMAND LINE ARGUMENTS
const parser = new ArgumentParser({
  add_help: true,
  description: `tsmono (typescript monorepository), see github's README file`,
    // version: "0.0.1",  add_argument(..., { action: 'version', version: 'N', ... }) 
});
const sp = parser.add_subparsers({
  title: "sub commands",
  dest: "main_action",
})
const init   = sp.add_parser("init", {add_help: true})
const add    = sp.add_parser("add", {add_help: true})
add.add_argument("args", {nargs: "*"})

const care_about_remote_checkout = (x: ArgumentParser) => x.add_argument("--care-about-remote-checkout", { action: "store_true", help: "on remote site update the checked out repository and make sure they are clean"})

const update = sp.add_parser("update", {add_help: true, description: "This also is default action"})
update.add_argument("--symlink-node-modules-hack", {action: "store_true"})
update.add_argument("--link-via-root-dirs", {action: "store_true", help: "add dependencies by populating root-dirs. See README "})
update.add_argument("--link-to-links", {action: "store_true", help: "link ts dependencies to tsmono/links/* using symlinks. Useful to use ctrl-p in vscode to find files. On Windows 10 cconsider activating dev mode to allow creating symlinks without special priviledges."})
update.add_argument("--recurse", {action: "store_true"})
update.add_argument("--force", {action: "store_true"})

const zip = sp.add_parser("zip", {add_help: true, description: "This also is default action"})

const print_config_path = sp.add_parser("print-config-path", {add_help: true, description: "print tsmon.json path location"})

const write_config_path = sp.add_parser("write-sample-config", {add_help: true, description: "write sample configuration file"})
write_config_path.add_argument("--force", {action: "store_true"})
const echo_config_path = sp.add_parser("echo-sample-config", {add_help: true, description: "echo sample config for TSMONO_CONFIG_JSON env var"})

const update_using_rootDirs = sp.add_parser("update-using-rootDirs", {add_help: true, description: "Use rootDirs to link to dependencies essentially pulling all dependecnies, but also allowing to replace dependencies of dependencies this way"})
// update_using_rootDirs.add_argument("--symlink-node-modules-hack", {action: "store_true"})
// update_using_rootDirs.add_argument("--link-via-root-dirs", {action: "store_true", help: "add dependencies by populating root-dirs. See README "})
// update_using_rootDirs.add_argument("--link-to-links", {action: "store_true", help: "link ts dependencies to tsmono/links/* using symlinks"})
update_using_rootDirs.add_argument("--recurse", {action: "store_true"})
update_using_rootDirs.add_argument("--force", {action: "store_true"})

const commit_all  = sp.add_parser("commit-all", {add_help: true, description: "commit all changes of this repository and dependencies"})
commit_all.add_argument("--force", {action: "store_true"})
commit_all.add_argument("-message", {})

const push = sp.add_parser("push-with-dependencies", {add_help: true, description: "upload to git repository"})
push.add_argument("--shell-on-changes", {action: "store_true", help: "open shell so that you can commit changes"})
push.add_argument("--git-push-remote-location-name", { help: "eg origin"})
care_about_remote_checkout(push)



push.add_argument("--config-json", { help: "See README.md"})

push.add_argument("--run-remote-command", {help: "remote ssh location to run git pull in user@host:path:cmd"})

const pull = sp.add_parser("pull-with-dependencies", {add_help: true, description: "pull current directory from remote location with dependencies"})
pull.add_argument("--update", { help: "if there is a tsmono.json also run tsmono update"})
pull.add_argument("--parallel", { action: 'store_true', help: "run actions in parallel"})
pull.add_argument("--link-to-links", { help: "when --update use --link-to-links see update command for details"})
care_about_remote_checkout(pull)

const clean = sp.add_parser("is-clean", {add_help: true, description: "check whether git repositories on local/ remote side are clean"})
clean.add_argument("--no-local", { action: 'store_true', help: "don't look at local directories"})
clean.add_argument("--no-remote", { action: 'store_true', help: "don't\t look at remote directories"})
clean.add_argument("--shell", {action: "store_true", help: "if dirty start shell so that you can commit"})

const list_dependencies = sp.add_parser("list-local-dependencies", {add_help: true, description: "list dependencies"})

const from_json_files = sp.add_parser("from-json-files", {add_help: true, description: "try to create tsmono.json fom package.json and tsconfig.json file"})
push.add_argument("--force", {action: "store_true", help: "overwrites existing tsconfig.json file"})

const reinstall = sp.add_parser("reinstall-with-dependencies", {add_help: true, description: "removes node_modules and reinstalls to match current node version"})
reinstall.add_argument("--link-to-links", {action: "store_true", help: "link ts dependencies to tsmono/links/* using symlinks"})

const watch  = sp.add_parser("watch", {add_help: true})


const esbuild_server_client_dev = sp.add_parser("esbuild-server-client-dev", {add_help: true, description: "experimental"})
esbuild_server_client_dev.add_argument("--server-ts-file", { help: "server.ts"})
esbuild_server_client_dev.add_argument("--web-ts-file", { help: "web client .ts files"})

const vite_server_and_api = sp.add_parser("vite-server-and-api", {add_help: true, description: "experimental"})
vite_server_and_api.add_argument("--server-ts-file", { help: "server.ts"})
vite_server_and_api.add_argument("--api-ts-file",   { help: "server.ts like file providing API"})

const args = parser.parse_args();



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
        await with_user(async () => t_cfg.info(`starting ${x.task}`) )
        await x.start({with_user: (run) => {
            return with_user(async () => {
                t_cfg.info(`!=== task ${x.task} requires your attention`)
                return run()
            })
        }})
        await with_user(async () => t_cfg.info(`done ${x.task}`) )
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
  const cfg:    Config = { ...cfg_api( config ), ...config  }

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
  const cp = {cfg, p}

  const ensure_is_git = async (r: Repository) => {
    if (!fs.existsSync(path.join(r.path, ".git"))) {
      console.log(`Please add .git so that this dependency ${r.path} can be pushed`)
      await run(cfg.bin_sh, { cwd: r.path, stdout1: true })
    }
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
      console.log("TODO: zip target.zip $( echo tsconfig.json; echo package.json; find -L  src | grep -ve 'tsmono.*tsmono|\\.git'")
  }

  if (args.main_action === "update") {
      action_update({
        cfg,
        cwd: process.cwd(),
        flags: args
      })
  }
  if (args.main_action === "update_using_rootDirs") {
    // await update_using_rootDirs();
    await tslint_hack({cfg, p});
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
    t_cfg.silent = true;
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

    // // test remote is git repository
    // try {
    //   await sc(`
    //   [ -f ${rL["repositories-path-checked-out"]}/${reponame}/.git/config ]
    //   `, {stdout1: true})
    // } catch (e) {
    //   info(`remote directory ${rL["repositories-path-checked-out"]}/${reponame}/.git/config does not exit, cannot determine dependencies`)
    //   remote_exists = false
    // }

    const items = await ( async () =>  {
    if (!remote_exists) return [];

       // // use remote list-local-dependencies
       try {
           const local_deps = ( await sc(`
             cd ${rL["repositories-path-bare"]}/${reponame} && ( git show HEAD:.tsmono-local-deps )
           `)).split("\n").filter((x) => /dep-basename: /.test(x) ).map((x) => path.join('../', x.slice('dep-basename: '.length)) )
           console.log(`local deps: ${local_deps}`);
           return local_deps
       } catch (e){
           console.log(chalk.red(`error getting dependencies assuming empty list`));
           console.log(e);
           return []
       }
    })()

    t_cfg.info("pulling " + JSON.stringify(items))

    const actions = []

    for (const path_ of ([`../${reponame}`, ...items])) {

        actions.push( async () => {
          t_cfg.info(`updating ${path_}`)
          const p_ = path.join(cwd, path_)
          const repo = basename(p_)

          if ((rL.ignoreWhenPulling || []).includes(repo)) return

          if (!fs.existsSync(p_)) {
            t_cfg.info(`creating ${p_}`)
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
          t_cfg.info(`pulling ${p_} ..`)
          await run("git", { args: ["pull"], cwd: p_ })

          if (args.update && fs.existsSync(path.join(p_, "tsmono.json"))) {
              // run tsmono update
              const p = new Repository(cfg, p_, {})

              await p.update(cfg, {
                link_to_links: args.link_to_links, install_npm_packages: true, symlink_node_modules_hack: false, recurse: true, force: true,
                // , update_cmd: {executable: "npm", args: ["i"]}
              })
          }
        })
    }

        // parallel
      if (args['parallel']){
          await Promise.all(actions.map((a) => a()))
      } else {
          for (let a of actions ) {
              await a()
          }
      }
  }

  if (args.main_action === "is-clean") {
      t_cfg.info("using local dependencies as reference")
      const repositories = p.repositories({includeThis: true})

      const rL = cfg["remote-location"]

      const sc = () => ssh_cmd(rL.server)

      const results: string[] = []

      const check_local =  (r: Repository): Task => async (o) => {
        const is_clean = async () => ("" === await run("git", { args: ["diff"], cwd: r.path }) ? "clean" : "dirty")
        const clean_before = await is_clean()
        if (clean_before === "dirty"  && args.shell) {
          await o.with_user(async () => {
            t_cfg.info(`${r.path} is not clean, starting shell`)
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
            t_cfg.info(`${r.path} is not clean, starting shell`)
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

      t_cfg.info("=== results ===")
      for (const i of results) {
        t_cfg.info(i)
      }
  }

  if (args.main_action === "push-with-dependencies") {
    const p = new Repository(cfg, process.cwd(), {})
    const rL = cfg["remote-location"]

    const basenames_to_pull: string[] = []
    const seen: string[] = [] // TODO: why aret there duplicates ?

    const ensure_repo_committed_and_clean = async (r: Repository) => {
      t_cfg.info(r.path, "checking for cleanness")
      // 1 updates / commit

      if (args.shell_on_changes && "" !== await run("git", {args: ["diff"], cwd: r.path})) {
          t_cfg.info(`${r.path} is dirty, please commit changes`)
          if (Os.platform() === 'win32'){
            t_cfg.info(`starting shell on Windows not supported. Commit your changes and rerun. Quitting`);
            process.exit();
          } else {
            t_cfg.info(`starting shell quit with ctrl-d or by typing exit return`);
            await run(cfg.bin_sh, {cwd: r.path, stdout1: true})
          }
       }
    }

    const ensure_remote_location_setup = async (r: Repository) => {
      t_cfg.info(r.path, "ensuring remote setup")
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
          t_cfg.info(`... pushing in ${r.path} ...`)
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

  // default action is update - does not work due to argparse (TOOD, there is no reqired: false for add_subparsers)
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
