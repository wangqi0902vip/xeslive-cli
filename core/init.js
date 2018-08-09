const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const git = require('simple-git/promise')
const cmd = require('node-cmd')

async function init (name) {
  let localPath = path.resolve('./')
  if (!fs.existsSync(localPath + '/' + name)) {
    console.log('无此文件夹，可以创建文件夹')
    fs.mkdirSync(localPath + '/' + name)
    console.log('创建文件夹完成')
    console.log('文件夹：' + localPath + '/' + name)
    await getTemplate('https://git.coding.net/wangqi0902vip/xTemplate.git', name)
    console.log('success')
  } else {
    process.stdout.write(name + '文件夹已经存在，是否删除并替换：y/n ：')
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', (chunk) => {
      // chunk = chunk.replace(/\s+/,'')
      chunk = chunk.substring(0,1)
      if (chunk === 'y') {
        removeFiles(localPath + '/' + name + '/').then(() => {
          'use strict'
          console.log('删除成功！')
          console.log('继续下载模板！')
          init(name)
        })
        console.log('删除文件夹！')
      } else if (chunk === 'n') {
        console.log('不删除文件夹，退出操作!')
        process.exit()
      } else {
        console.warn('请输入正确指令!')
        process.exit()
      }

    })

  }
}

function removeFiles (dir) {
  return fse.remove(dir)
}

async function getTemplate (url, name) {
  await git().clone(url, path.resolve('./' + name)).then(() => {
    console.log('文件夹：' + name + ' 创建完毕')
    console.log('运行：cd ' + name)
    console.log('运行：npm install')
    console.log('运行：npm run init 启动资源服务')
    console.log('运行：npm run dev 打开另一个命令窗口，启动调试服务')
    process.exit()
  }).catch((err) => {
    'use strict'
    console.log('git下载失败：', err)
  })
}

function check (command) {
  return new Promise((resolve, reject) => {
    'use strict'
    cmd.get(command, (e, a) => {
      'use strict'
      if (e === null) {
        resolve(a)
      } else {
        reject(e)
      }
    })
  })
}

module.exports = async (arg) => {
  check('git --version').then((e) => {
    'use strict'
    console.log('git版本：' + e)
    console.log('git符合条件！开始下载！')
    init(arg[0])
    return true
  }, (e) => {
    'use strict'
    console.log('git发生错误！\n 代码：' + e)
    console.log('请安装git或者修改git环境变量！')
    return false
  })

}

