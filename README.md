tsmono: work with modular repositories as if they were a monorepository
and sync multiple repositories to a remote location with one command
=======================================================================

WHY?
====

* edit libraries and target lib/application in the same vscode session and
  refactor or edit without intermediary transpiling

* allow multiple versions of dependencies in the same project (does not work
  with different versions of transient dependencies managed by node, becaues
  they end up in package.json dependecies fields)

* get code of target platform automatically

Without tsmono, what is next best option?
========================================

"references" in tsconfig.json -> comes close, but you still need multiple
actions to use a library: adding it to "references" and linking it.
While it gets the job done, I think adding dependecies should be as easy as
tsmono adding foo it.

Caution: Tested on linux only for now.

How to use:
===========

git clone the repo
tsc -p .
then create bash function like this:


```
# recommended way: use the dist/tsmono.json, cause ts-node messes up with target project's configuration
tsmono(){ NODE_MODULES=$TSMONO/node_modules node $TSMONO/dist/tsmono.js "$@"; }
```

Then see tsmono.json example below, run tsmono update and be done.

Add your package.json contents to the tsmono.json file ..


CONFIG eg for MSYS2
===========
tsmono --print-config-path
tsmono --write-sample-config

or export TSMONO_CONFIG_JSON

ROADMAP / TODO:
===============

  [ ] xxhashjs requires webpack.ProvidePlugin({"buffer": ["buffer","Buffer"]})
      find a way to collect all of this shimming so that it can be used by
      webpack or other tools automatically.

      Eg wirte shim.json or such merging all shimmings from all packages

  [ ] completion for vscode & vim to find libraries nearby ?

  [ ] propagated dependencies
      I think best is to use functional modular languages.

  [ ] document and test https://nodejs.org/api/cli.html#cli_preserve_symlinks

  [ ] add support turning into npm module
      or use postinstall hooks tu run tsc -p . instead ?

  [ ] implement pull-with-dependencies and push-with-dependencies using run_tasks
       thus make them parallel unless user action is required

      When refactoring eventually implement two different 'push' locations:
      from loca to ssh location (see --care-about-remote-checkout)

      But also allow to local bare repositories (eg when working one remote
      checkouts on remote locations so that tsmono_pull/push can be used to pull/push
      all dependencies as well)

  [ ] some tools egnext.js have issues with files being outside of current directory.
      Thus think about finally implementing the tsconfig compile other projects
      and create .js files with sourcemapping but loosing ability to refactor instead ?

  [ ] turn this repository into npm module

  [ ] think about polyfills
       * add typings to tsconfig
       * conifgure webpack plugins

  [ ] think about adding JS git support to always work everywhere:
        https://github.com/isomorphic-git/isomorphic-git
        https://github.com/creationix/js-git

  [ ] transient dependencies

  [ ] tslint by eslint cause projects should be merged ?
      Only consider doing so if missing await floating promises get caught

  [ ]
      https://github.com/jfgodoy/knex-postgis/issues/35
      How to handel this cases - automatically add fixes?
      Yarn has solutions.


peer dependency support
=======================

support peer dependencies, how?

* want to test / typecheck code in repo (thus need to be installed)
* need to check its present in target repository (ts-node will fail)
* despite having node_modules locally should not interfer with installation
  in target ?

Conclusion -> just adding to dependencies 'works' for now but is shit
Getting all goal done -> some work

or use devDepencdencies only like polythene ?0

Thus is it a problem at all ?

Problems:
=========
Well if the depending packages have conflicting tsconfig settings then you
might run into trouble, see node_modules flag (untested / to be developed)

tsconfig options which might cause problems if set differently (incomplete list)
suppressImplicitAnyIndexErrors

TODO: take care of it and tell user

FILES ON DISK
=============
package.json.installed: If package.json{,.installed} are same don't run npm i/fyn
*.protect: used to detect user changes. Don't overwrite files changed by users unless --force is used

convenient fixes for tsconfig files
===================================
See fix_tsconfig
* if outDir or outFile is set automatically add to excludes to prevent multiple files would write to same distination file errors

Example:
========

```
  monorepo/lib
  monorepo/lib/tsmono.json {"devDependencies", "dependencies": h}
  monorepo/lib/src/lib.ts

  monorepo/tool
  monorepo/tool/tsmono.json {"devDependencies", "dependencies": h}
  monorepo/tool/tool/tool.ts

  monorepo/project
  monorepo/project/tsmono.json (package.json / tsconfig.json will be derived from it)

  {
    // more examples see below
    "directories": ["../"]
    "dependencies": ["lib", "tool", "git+https://github.com/bar/baz.git:name=baz", "bar:types"] // lib and tool will be made available if found in directories
  }
```

Running ```tsmono update``` then will create package.json adding all the dependencies
and dependencies of dependencies looking in mono repository first.

All the mono repository data will be linked to src/* so that tools pick the
files up.

Progress
========
See test/test.ts

libraries with package.json and tsmono.json get linked and run with the
../node_modules symlinks hack, or --recurse (running the risk that you use
different versions of the same library)..

More work is required to put executables in path, too.
Eg finish symlinking them all to tsmono/bin or so.

Warnings about differing versions should be implemented.

Why extra file
==============
I want one file to be stable.
package.json and tsconfig.json might depend on way of how packages get
installed (from npm or linking to mono repository).

So the tsmono.json file will be ground of truth even if it means that we have
to duplicate npm i like commands


options
=======
tsmono.json example file:

```
{
  "package": {
    // package.json contents

    "name": "..",

  }

  "directories": ["../"],

  // command to install npm packages from package.json 
  "npm-install-cmd": ["npm", "i"], # or ["fyn"]

  // dependencies by name see "dep" below
  "dependencies":    [dep, dep see below],
  "devDependencies": [dep, dep see below],

  // more package.json like configs like "run" section
  "tsconfig": {
    // if given write a tsconfig.json
    // if tsconfigs is given, this gets merged into tsconfigs
  },

  "presets": {
    react: {},
  },

  "tsconfigs": {

    // optional

    // by path
    "": {},

    // if you need multiple tsconfig files you cat place one in tool/tsconfig.json
    "tool": {
    }

  }

}


dep:
  "<name>[;flag ...]"

  "name" -> reference ts project from local directory if not found get from npm
  "name;npm;version=^1.3;types"  -> force installing from npm optionally give version and fetch types

  "name;node_modules" -> 

  "git+https//.....:name=bar" -> name is optional, fetch from github

  flags:
  ;types -> when installing from npm try to fetch types also
  ;version=^1.3 - npm version


  TODO:
  ;reference_by_references -> add to "references" section so that it gets recomplied by TS
  ;node_modules -> requires own ts -> js compilation, dependencies are hidden in node_modules/* the usual way
                   I think we can handle this with "references" or by running own command depending on config
                   "references" should be the default way I think ?
                   TODO: think about 

                   I think the best fix is to allow different compilerOptions
                   to be applied for parst of the sources, thus to extend tsconfig files. 
                   https://github.com/Microsoft/TypeScript/issues/31035

```

On linux dependencies are symlinked to src/* so that you can
grep/search/replace them

On windows: seems to work without --link-to-links


presets
=======
Because I am tired of adding some libraries over and over again I introduced presets.
They add sets of dependencies (I use)..

command line options
====================
```
  tsmono update [--symlink-node-modules] 
  # rewrite package.json and tsconfig.json files then run npm-install-cmd
  # --symlink-node-modules-hack link node_modules to all dirs so that dependencies
  # an alternativet would be to implement --recuse to run update on all
  # dependencies installing npm based dependencies - but then you run the risk
  # getting multiple verisons which will be harder to test


  # are found. The problem if if you use "paths" in tsconfig.json it doesn't matter whether
  # you symlink the .ts files to local ./tsmono/links directory or point to ../other-dir/srcr/*
  # node -r ts-node/register/trasnpile-only will look for the dependencies
  # relative to the link target, not the symlink location.

  # TODO add --lock-time option as in fyn
  to be implemented (eg looking up the code to query node from fyn, eg https://registry.npmjs.org/@types%2fobjecthash
  tsmono watch  # run tsc or so in node_modules depenendency directories (TODO)
  tsmono add [--no-types] foo -d bar # add foo and devDependencies bar, then run update
  tsmono remove foo -bar # remove libraries again

  tsmono push-with-dependencies --shell-on-change --git-remote-config-json='{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}'
  # pushes multiple repositories to a remote location optionally pulilng them, too.
  # great for keeping a test or server inv up to date with your local changes

  mkdir repo-to-pull; cd repo-to-pull
  tsmono pull-with-dependencies --shell-on-change --git-remote-config-json='{"gitRemoteLocationName":"remote", "server": "user@host", "bareRepositoriesPath": "repos-bare", "repositoriesPath": "repository-path"}'
  # pulls repository with dependencies
  # tsmono must be runnable by ssh on the remote site (eg add to .bashrc or .zprofile or such)
  # because tsmono list-local-dependencies is used to determine what repositories to fetch

  tsmono is-clean [--no-local] [--no-remote] [--shell] --git_remote_config_json={..}

  tsmono list-local-dependencies
  # just lists all dependencies so that you can pack them manually

  tsmono from-json-files
  # try to create tsmono.json fom package.json and tsconfig.json file

  tsmono commit-all
  # for each directory having changes start shell that you can commit
  # use -f -m 'message' to use commit message on all

  tsmono reinstall-with-dependencies [--link-to-links]
  Maybe --preserve-symlinks not required. Maybe update is enough

  tsmono esbuild-server-client-dev --server-ts-file src/server.ts --web-ts-file src/web.ts
```

Think about this:
=================
When adding dependencies automatically fetch @types/<lib>, too
If its wrong, you can remove them from tsmono.json easily

Take version hintings from lockfiles ?



=====================
references feature:
if you have a testcase like below tsc --build will rebuild the dependencies


#!/bin/sh

rm -fr tmp

mkdir -p tmp/lib/src
mkdir -p tmp/project/src

# COMMON PROJECT CONFIG
( cd tmp/

cat > project-tsconfig.json <<EOF
{
  "compilerOptions": {
    "declaration": true,
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "composite": true
  },
}
EOF
)

# library
( cd tmp/lib
cat > tsconfig.json <<EOF
{
  "extends": "../project-tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./out",
    "rootDir": "."
  }
}
EOF

cat > lib.ts <<EOF
export const lib: string = "test"
EOF

)

# project using library
( cd tmp/project
cat > tsconfig.json <<EOF
{
  "extends": "../project-tsconfig.json",
  "compilerOptions": {
    "rootDir": "."
  },
  "references": [
    {"path": "../lib"}
  ]
}
EOF

cat > src/project.ts <<EOF
import {lib} from "lib/lib"
console.log(lib)
EOF

tsc --build .
)


Making VSCODE run tsmono update on tsmono.json save:
====================================================

There is an extension now also providing completion:
https://mawercer.de/tmp/webkos-0.0.1.vsix


# TODO
If a local dependency is a version controlled package each time tsmono update is run record that hash
This way you have some control over updates. Thus if s.th breakes you know where to start looking for changes

.gitignore and .node ignore like file

# G


NOTES FOR WINDOWS
=================
Symlinks seem to reqiure special privileges.
Eg run as administrator or google how to change priviledges.
Maybe there are more ways.



alternatives
============
Maybe I have missed the point and there are alternatives ..
https://classic.yarnpkg.com/en/docs/workspaces/

TROUBLE SHOOTING
=================
drop baseUrl (should be "./")


NEEDS GLOBAL shimming
==========================
TODO

{
  "needs_globals": {
      "Buffer": ["buffer", "Buffer"]
  },

  "dependencies": [
    "buffer"
  ]

}


related work
============
https://rushstack.io/
lerna
