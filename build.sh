#!/bin/sh

# tsc -w -p . also works
esbuild --watch --platform=node --target=node10 --bundle src/tsmono.ts --outfile=dist/tsmono.js
