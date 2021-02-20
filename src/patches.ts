export type Patch = {
    local_subdirectory?: string, // use this subdirectory when referencing
    npm_also_types?: true // also insall types
}

export const patches: {[key:string]: Patch} = {
    // ts-tream from npm didn't know how to import the transformer batcher thus using source
    "ts-stream": {
        "local_subdirectory": "src/lib"
    },

    "react": {npm_also_types:true},
    "react-dom": {npm_also_types:true},
    "react-router-dom": {npm_also_types:true},

    "moment": {npm_also_types:true},
    "bluebird": {npm_also_types:true},
    "express": {npm_also_types:true},
    "deep-equal": {npm_also_types:true},
    "chalk": {npm_also_types:true},
    "axios": {npm_also_types:true},
    "qs": {npm_also_types:true},
    "lodash": {npm_also_types:true},

    "webpack-hot-middleware":{ npm_also_types:true},
    "webpack-dev-middleware": {npm_also_types:true},
    "webpack-merge": {npm_also_types:true},
    "mithril": {npm_also_types:true},
    "puppeteer": {npm_also_types: true}
}
