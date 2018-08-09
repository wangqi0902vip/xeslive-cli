const https = require('https')
const fs = require('fs')
const path = require('path')
const url = 'https://git.xesv5.com/wangqi15/XTemplate/repository/master/archive.zip'
const _cliProgress = require('cli-progress')
const _colors = require('colors')
const unzip = require('unzip')
const downloadBar = new _cliProgress.Bar({
  clearOnComplete: true,
  format: `Downloading template [${_colors.blue('{bar}')}] {percentage}% | {value}/{total}`
}, _cliProgress.Presets.shades_classic)

const unzipBar = new _cliProgress.Bar({
  clearOnComplete: true,
  format: `Unzipping template files [${_colors.blue('{bar}')}] {percentage}% | file:{filename} | {value}/{total}`
}, _cliProgress.Presets.shades_classic)

function getUrl (xname) {
  https.get(url, (res) => {
    'use strict'
    let dataArray = []
    let size = 0
    let total = res.headers['content-length'] * 1
    downloadBar.start(total, 0)
    let filename = res.headers['content-disposition'].match(/".*?"/i)[0].match(/[^"]+/i)[0]

    res.on('data', (data) => {
      dataArray.push(data)
      downloadBar.update(size)
      size += data.length
    })

    res.on('end', (data) => {
      downloadBar.stop()
      let buffer = Buffer.concat(dataArray, size)
      let tempfile = path.resolve('./temp.zip')
      fs.writeFile(tempfile, buffer, (e) => {
        unZip(tempfile, filename, './' + xname)
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
          unzipBar.start(1,0,{filename:entry.path})
          entry.pipe(fs.createWriteStream(path.resolve(to + '/' + entry.path))).on('finish',()=>{
            unzipBar.update(1,{filename:entry.path})
            unzipBar.stop()
          })
        } else {
          fs.mkdirSync(path.resolve(to + '/' + entry.path))
        }
      }
    }).on('close', (e) => {
    'use strict'
  })
}

module.exports = (name) => {
  'use strict'
  getUrl(name[0])
}