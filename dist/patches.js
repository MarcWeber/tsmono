"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patches = void 0;
exports.patches = {
    // ts-tream from npm didn't know how to import the transformer batcher thus using source
    "ts-stream": {
        srcdir: "src/lib"
    },
    "react": { npm_also_types: true },
    "react-dom": { npm_also_types: true },
    "react-router-dom": { npm_also_types: true },
    "moment": { npm_also_types: true },
    "momentjs": { notes: ["I'ts recommended to switch to alternatives for new projects only because it is not COW. https://momentjs.com/docs/#/-project-status/future/ - if in doubt try day.js for size reasons"] },
    "bluebird": { npm_also_types: true },
    "deep-equal": { npm_also_types: true },
    "chalk": { npm_also_types: true },
    "axios": { npm_also_types: true },
    "qs": { npm_also_types: true },
    "lodash": { npm_also_types: true },
    "webpack-hot-middleware": { npm_also_types: true },
    "webpack-dev-middleware": { npm_also_types: true },
    "webpack-merge": { npm_also_types: true },
    "mithril": { npm_also_types: true },
    "puppeteer": { npm_also_types: true },
    "fs-extra": { npm_also_types: true },
    "express": { npm_also_types: true },
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
    "vite": {
        srcdir: 'packages/vite/src/node',
        // package_jsons: ['package.json', 'packages/vite/package.json', 'packages/playground/ssr-react/package.json'],
        allDevDependencies: true
    },
};
