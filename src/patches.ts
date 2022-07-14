import {Links, Paths} from "./types";

export type Patch = {
    // srcdir?: string, // use this subdirectory when referencing
    npm_also_types?: true, // also insall types
    notes?: string[],
    allDevDependencies?: true,

    provides?: string[],

    tsmono?: {
        js_like_source?: {
            links?: Links,
            paths?: Paths,
            dependencies_from_package_jsons?: string[]
        }
    }
}

export const patches: {[key:string]: Patch} = {
    // ts-tream from npm didn't know how to import the transformer batcher thus using source
    "ts-stream": {
        // srcdir: "src/lib"
        tsmono: {
            js_like_source: {
                links: {
                    'src/lib': 'ts-stream',
                },
            }
        }
    },

    "react": {npm_also_types:true},
    "argparse": {npm_also_types:true},
    "react-dom": {npm_also_types:true},
    "react-router-dom": {npm_also_types:true},

    "moment": {npm_also_types:true},
    "momentjs": {notes: [`I'ts recommended to switch to alternatives for new projects only because it is not COW. https://momentjs.com/docs/#/-project-status/future/ - if in doubt try day.js for size reasons`]},
    "bluebird": {npm_also_types:true},
    "deep-equal": {npm_also_types:true},
    "chalk": {npm_also_types:true},
    "axios": {npm_also_types:true},
    "qs": {npm_also_types:true},
    "lodash": {npm_also_types:true},

    "webpack-hot-middleware":{ npm_also_types:true},
    "webpack-dev-middleware": {npm_also_types:true},
    "webpack-merge": {npm_also_types:true},
    "mithril": {npm_also_types:true},
    "puppeteer": {npm_also_types: true},

    "fs-extra": {npm_also_types: true},

    "express": {npm_also_types:true},
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
                    'packages/core': '@prefresh/core',
                    'packages/utils': '@prefresh/utils',

                    'packages/vite': '@prefresh/vite',

                    'packages/babel/src/index.mjs': '@prefresh/babel-plugin/index.js',

                    // 'packages/vite/src/index.js': '@prefresh/vite/index.js',
                    // 'packages/vite/index.d.ts': '@prefresh/vite/index.d.ts',
                },

                paths: {
                    "@prefresh/babel-plugin":  ["@prefresh/babel-plugin"],
                    "@prefresh/babel-plugin/*":  ["@prefresh/babel-plugin/*"],
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
                    'src': '@preact/preset-vite',
                },

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
                    'packages/vite/src/node': 'vite',
                    'packages/vite/src/client': 'vite-client',
                },


                paths: {
                    "vite/dist/client/*":  ["vite-client/*"],
                },

                dependencies_from_package_jsons: [ 'packages/vite/package.json', 'package.json' ],

                // paths: {
                //     "@prefresh/babel-plugin":  ["@prefresh/babel-plugin"],
                //     "@prefresh/babel-plugin/*":  ["@prefresh/babel-plugin/*"],
                // }
            }
        }
    },

}

// eg @prefresh/vite provided by prefresh
export const provided_by: Record< string, string> = {}
for (let [k, v] of Object.entries(patches)) {
    for (let p of v.provides ?? []) {
        provided_by[p] = k
    }
}
