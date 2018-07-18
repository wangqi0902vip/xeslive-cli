#!/usr/bin/env node
const program = require('commander')
const scripts = require('./core/index')
program.version(require('./package.json').version, '-v, --version')
  .action((...arr) => {
    let script = arr[0]
    let arguments = arr.splice(1, arr.length - 1)
    scripts[script](arguments)
  })
  .parse(process.argv)
