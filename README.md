tsmono: typescript monorepositories
===================================

1) TS -> JS (transpile) -> babel -> just a lot of overhead
2) TS -> target (transpile maybe with type checking) -> works, but requires all .ts files sharing same tsconfig settings.

1) is annoying if you change files developing
2) is what this repository is about

"references" in tsconfig.json -> comes close, but you still need multiple
actions to use a library: adding it to "references" and linking it.
While it gets the job done, I think adding dependecies should be as easy as
tsmono adding foo it.

Caution: Tested on linux only for now.

How to use:
===========

```
npm install tsmono # or similar tools from fyn to ..
```

Then see tsmono.json example below, run tsmono update and be done.

Add your package.json contents to the tsmono.json file ..


Example:
========

```
  monorepo/lib
  monorepo/lib/tsmono.json {"devDependencies", "depnedencies": h}
  monorepo/lib/src/lib.ts

  monorepo/tool
  monorepo/tool/tsmono.json {"devDependencies", "depnedencies": h}
  monorepo/tool/tool/tool.ts

  monorepo/project
  monorepo/project/tsmono.json (package.json / tsconfig.json will be derived from it)

  {
   tsmono: {
    "directories": ["../"]
    "dependencies": ["lib", "tool"] // lib and tool will be made available if found in directories
   },
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

  // command to install npm packages from package.json 
  "npm-install-cmd": ["npm", "i"], # or ["fyn"]

  // dependencies by name see "dep" below
  "dependencies":    [dep, dep see below],
  "devDependencies": [dep, dep see below],

  // more package.json like configs like "run" section
  "tsconfig": {
    // if given write a tsconfig.json
    // if tsconfigs is given, this gets merged into tsconfigs
  }

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
  "<name>[:flag ...]"

  "name" -> reference ts project from local directory if not found get from npm
  "name:npm:version=^1.3:types"  -> force installing from npm optionally give version and fetch types

  "name:node_modules" -> 

  flags:
  :types -> when installing from npm try to fetch types also
  :version=^1.3 - npm version


  TODO:
  :reference_by_references -> add to "references" section so that it gets recomplied by TS
  :node_modules -> requires own ts -> js compilation, dependencies are hidden in node_modules/* the usual way
                   I think we can handle this with "references" or by running own command depending on config
                   "references" should be the default way I think ?
                   TODO: think about 

```

On linux dependencies are symlinked to src/* so that you can
grep/search/replace them

On windows: untested, help me.


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
