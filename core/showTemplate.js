let templateList = require('../config/template.conf.json')
const clc = require('cli-color')
const error = clc.red.bold
const warn = clc.cyanBright
const notice = clc.magentaBright

module.exports = ()=>{
  'use strict'
  console.log(notice(`We have these templates: `))
  templateList.templates.map(v=>{
    console.log(warn(v.name))
  })
}