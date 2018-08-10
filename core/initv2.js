const https = require('https')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const url = 'https://git.xesv5.com/wangqi15/XTemplate/repository/master/archive.zip'
const _cliProgress = require('cli-progress')
const inquirer = require('inquirer')
const prompt = inquirer.createPromptModule()
const clc = require('cli-color')
const error = clc.red.bold
const warn = clc.cyanBright
const notice = clc.magentaBright
const _colors = require('colors')
const unzip = require('unzip')
const templateList = require('../config/template.conf.json')

const removeBar = new _cliProgress.Bar({
  clearOnComplete: true,
  format: `Removing directory {dirname} [${_colors.blue('{bar}')}] {percentage}% | {value}/{total}`
}, _cliProgress.Presets.shades_classic)

const downloadBar = new _cliProgress.Bar({
  clearOnComplete: true,
  format: `Downloading template [${_colors.blue('{bar}')}] {percentage}% | {value}/{total}`
}, _cliProgress.Presets.shades_classic)

const unzipBar = new _cliProgress.Bar({
  clearOnComplete: true,
  format: `Unzipping template files [${_colors.blue('{bar}')}] {percentage}% | file:{filename} | {value}/{total}`
}, _cliProgress.Presets.shades_classic)

function dirExist (xname) {
  return new Promise((resolve, reject) => {
    'use strict'
    if (fs.existsSync(path.resolve('./' + xname))) {
      prompt({
        type: 'list',
        name: 'remove',
        choices: ['yes', 'no'],
        message: `Directory ${xname} has already existed, remove it or stop this process?`
      }).then(answer => {
        'use strict'
        if (answer.remove === 'no') {
          process.exit()
        } else {
          console.log(notice('Removing!'))
          removeBar.start(1, 0, {dirname: xname})
          fse.remove(path.resolve('./' + xname)).then(
            removeBar.update(1, {dirname: xname})
          )
          removeBar.stop()
          console.log(warn(`Remove success!`))
          resolve()
        }
      })
    } else {
      resolve()
    }
  })

}

function getUrl (xname, template) {
  if (!templateList.templates.find(v=>v.name===template)) {
    console.log(error(`Please input a template which we had!`))
    console.log(warn(`Usage: xeslive init <template> <project name>`))
    require('./showTemplate')()
    process.exit()
  }
  dirExist(xname).then(() => {
    'use strict'
    console.log(notice(`Start download!`))
    console.log(notice(`Connecting......`))
    https.get(url, (res) => {
      'use strict'
      let dataArray = []
      let size = 0
      let total = res.headers['content-length'] * 1
      console.log(notice(`Start download ${template}`))
      console.log(notice(`Downloading:`))
      downloadBar.start(total, 0)
      let filename = res.headers['content-disposition'].match(/".*?"/i)[0].match(/[^"]+/i)[0]

      res.on('data', (data) => {
        dataArray.push(data)
        downloadBar.update(size)
        size += data.length
      })

      res.on('end', (data) => {
        downloadBar.stop()
        console.log(warn(`Download ${template} finish!`))
        let buffer = Buffer.concat(dataArray, size)
        let tempfile = path.resolve('./temp.zip')
        fs.writeFile(tempfile, buffer, (e) => {
          console.log(notice(`Start unzip template ${template}!`))
          unZip(tempfile, filename, './' + xname)
        })
      })
    })
  })

}

function unZip (file, filename, to) {
  if (!fs.existsSync(path.resolve(to))) {
    fs.mkdirSync(path.resolve(to))
  }
  filename = filename.replace('.zip', '')
  fs.createReadStream(file)
    .pipe(unzip.Parse())
    .on('entry', (entry) => {
      'use strict'
      if (entry.path !== filename + '/') {
        entry.path = entry.path.replace(filename + '/', '')
        if (entry.type === 'File') {
          unzipBar.start(1, 0, {filename: entry.path})
          entry.pipe(fs.createWriteStream(path.resolve(to + '/' + entry.path))).on('finish', () => {
            unzipBar.update(1, {filename: entry.path})
            unzipBar.stop()
          })
        } else {
          fs.mkdirSync(path.resolve(to + '/' + entry.path))
        }
      }
    }).on('close', (e) => {
    'use strict'
    fse.remove(file).then(() => {
      console.log(warn(`Remove temp files!`))
    })
    console.log(warn('Unzip finish!'))
    console.log(notice('文件夹：' + to + ' 创建完毕'))
    console.log(notice('运行：cd ' + to))
    console.log(notice('运行：npm install'))
    console.log(notice('运行：npm run init 启动资源服务'))
    console.log(notice('运行：npm run dev 打开另一个命令窗口，启动调试服务'))

  })
}

module.exports = (name) => {
  'use strict'
  if (name.length < 1) {
    console.log(error(`error command!
    
      
      Usage: xeslive <command>
      xeslive -v
      xeslive init <template> <dirname>
      
      Have fine!
    `))
    process.exit()
  }
  getUrl(name[1], name[0])
}