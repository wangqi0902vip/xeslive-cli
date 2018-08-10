#!/usr/bin/env node
const program = require('commander')
const scripts = require('./core/index')
const clc = require('cli-color')
const error = clc.red.bold
const warn = clc.cyanBright
const notice = clc.magentaBright
program.version(require('./package.json').version, '-v, --version')
  .action((...arr) => {
    if (arr.length-1 < 1) {
      console.log(warn(`
      
      Usage: xeslive <command>
      xeslive -t or --template
      xeslive -v
      xeslive init <template> <dirname>
      
      Have fine!
      `))
    } else {
      let script = arr[0]
      let arguments = arr.splice(1, arr.length - 2)
      scripts[script](arguments)
    }
  })
  .parse(process.argv)
