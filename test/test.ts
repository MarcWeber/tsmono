import * as fs from "fs-extra"
import { spawn } from "child_process";
import { runInContext } from "vm";

const run = async (cmd: string, ...args:string[]) => {
  console.log("running", cmd, args);
    // duplicate code
    await new Promise((a, b) => {
        const child = spawn(cmd, args, {
            stdio: [ 0, 1, 2 ]
        });
        child.on('close', (code, signal) => {
            if (code === 0) a()
            b(`${cmd.toString()} ${args.join(' ').toString()} failed with code ${code}`)
        })
    })
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

const test_tmp = "test-tmp";

const prepare_tmp = () => {

    if (!fs.existsSync('test-tmp'))
      fs.mkdirSync('test-tmp')
    fs.emptyDirSync("test-tmp")

    // lib with package json
    var p = `${test_tmp}/lib-with-package-json`
    fs.mkdirpSync(`${p}/src`)
    fs.writeFileSync(`${p}/package.json`,`
    {
        "name":"lib-with-package-json",
        "dependencies": {
          "object-hash": "^1.3.1"
        },
        "devDependencies": {
          "@types/object-hash": "^1.2.0",
        }
    }
    `, 'utf-8')
    fs.writeFileSync(`${p}/src/lib.ts`,`
    import hash from "object-hash"
    export const libwithpackagejson:string = hash("lib")
    `, 'utf-8')


    var p = `${test_tmp}/lib-with-tsmono-json`
    fs.mkdirpSync(`${p}/src`)
    fs.writeFileSync(`${p}/tsmono.json`,`
    {
        "package": {
          "name":"lib-with-tsmono-json",
        },
        "dependencies": ["object-hash:types", "deep-equal:types"],
        "tsconfig": {
          "allowSyntheticDefaultImports": true
        }
    }
    `, 'utf-8')
    fs.writeFileSync(`${p}/src/lib.ts`,`
    import hash from "object-hash"
    import deepequal from "deep-equal"
    export const libwithtsmonojson:string = JSON.stringify([hash("lib"), deepequal([], [])])
    `, 'utf-8')


    // lib-using-libs
    p = `${test_tmp}/lib-using-libs`
    fs.mkdirpSync(`${p}/src`)
    fs.writeFileSync(`${p}/tsmono.json`,`
    {
        "package": {
          "name":"lib-using-libs",
        },
        "dependencies":["lib-with-package-json", "lib-with-tsmono-json"]
    }
    `, 'utf-8')
    fs.writeFileSync(`${p}/src/lib-using-libs.ts`,`
    import {libwithpackagejson} from "lib-with-package-json/lib"
    import {libwithtsmonojson} from "lib-with-tsmono-json/lib"
    export libwithtsmonojson
    export libwithpackagejson
    `, 'utf-8')

    // tool
    p = `${test_tmp}/tool`
    fs.mkdirpSync(`${p}/tool`)
    fs.writeFileSync(`${p}/tsmono.json`,`
    { 
      "package": {
        "name":"tool"
      },
      "dependencies":["lib-with-package-json", "lib-with-tsmono-json"]
    }
    `, 'utf-8')
    fs.writeFileSync(`${p}/tool/tool.ts`,`
    import {libwithpackagejson} from "lib-with-package-json/lib"
    import {libwithtsmonojson} from "lib-with-tsmono-json/lib"
    console.log("libwithpackagejson", libwithpackagejson)
    console.log("libwithtsmonojson", libwithtsmonojson)
    `, 'utf-8')


    // project
    p = `${test_tmp}/project`
    fs.mkdirpSync(`${p}/tool`)
    fs.mkdirpSync(`${p}/src`)
    fs.writeFileSync(`${p}/tsmono.json`,`
    {
        "package": {
          "name":"project",
        }
    }
    `, 'utf-8')
    fs.writeFileSync(`${p}/tool/project-tool.ts`,`
    import {lib} from "lib/lib"
    console.log(\"hash of lib is", lib)
    `, 'utf-8')
    fs.writeFileSync(`${p}/src/lib.ts`,`
    import * as lib from "lib/lib"
    import * as lib_using_lib from "lib-using-libs"
    `, 'utf-8')
}


const cwd = process.cwd()

const tsmono = async (...args:string[]) => {
    await run("node", "-r", "ts-node/register/transpile-only", `${cwd}/tool/tsmono.ts`, ...args)
}

const assert = (a:boolean, msg:string = "") => {
    if (!a) throw new Error(msg)
}

const assert_eql = (a:string, b:string) => {
    assert(a.trim() === b.trim(), `assertion ${JSON.stringify(a)} === ${JSON.stringify(b)} failed`)
}

const hash = "libwithpackagejson 78376af8db2edfecc2e8f6e3abddb2c0e34021ea\nlibwithtsmonojson [\"78376af8db2edfecc2e8f6e3abddb2c0e34021ea\",true]"

const main = async () => {
  await prepare_tmp()

  process.env['TS_NODE_COMPILER_OPTIONS'] = '{ "esModuleInterop": true  }'

  assert_eql('a', await run_stdout('echo', "a"))

  // tool can use lib
  console.log("IN TOOL");
  process.chdir("test-tmp/tool")
  // await tsmono("add", "lib")
  await tsmono("update", "--symlink-node-modules-hack")

  // should be hash result ..
  assert_eql(hash, await run_stdout("node", '-r', 'ts-node/register/transpile-only', '-r', 'tsconfig-paths/register', 'tool/tool.ts'))

  // will take care of this later:
  // project can use tool and lib-using-libs (level 2 deps)
  console.log("IN PROJECT");
  process.chdir("../project")
  await tsmono("add", "lib-using-libs", '-d', 'tool') // should also pull lib
  await tsmono("update", "--symlink-node-modules-hack")

  // TODO: test that add works

  // tool should be running
  assert_eql(hash, await run_stdout("tsmono/tools-bin/tool"))

  // project-tool should be running
  assert_eql(hash, await run_stdout("node", '-r', 'ts-node/register/transpile-only', 'tool/project-tool.ts'))
  
}

main().then(
    console.log,
    console.log
)
