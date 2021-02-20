export const presets = {

    tsconfig: {
        dependencies: ["tslib"],
    },

    react: {

        "devDependencies":[
            "typescript",
            "@types/node",
            "webpack",
            "webpack-cli",
            "webpack-dev-server",
            "tsconfig-paths-webpack-plugin",
            "@babel/core",
            "@babel/preset-typescript",
            "@babel/preset-react",
            "@babel/preset-env",

            "webpack-hot-middleware;types",
            "webpack-dev-middleware;types",
            "babel-loader",
        ],

        "dependencies": [
            "react;types",
            "react-dom;types",
            "react-router-dom;types",
            "@babel/polyfill",
        ],

    },

    "dev-utils": {
        "devDependencies":[
            "hmr-for-node"
        ]
    },


    "many-utils": {
        "devDependencies": [
            "@types/node",
            "tsconfig-paths-webpack-plugin",
        ],
        "dependencies": [
            "ttslib",
            "axios;types",
            "object-hash;types",
        ]
    }
}
