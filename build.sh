#!/bin/sh

# tsc -w -p . also works
esbuild --watch --preserve-symlinks --platform=node --target=node10 --bundle src/tsmono.ts --sourcemap --outfile=dist/tsmono.js
