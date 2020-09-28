/**
 * User: CHT
 * Date: 2020/8/25
 * Time: 10:42
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const config = {
  url: 'https://www.xbiquge.cc/book/179/2865531.html',
  name: '雪鹰领主',
  launchConfig: {
    // devtools: true,
    // headless: true
  }
}

let brow = null

puppeteer.launch(config.launchConfig)
  .then(browser => {
    brow = browser
    return browser.newPage()
  })
  .then(async page => {
    await intercept(page, ['.jpg', '.png', '.js', 'css', 'gif'])
    return getContent(page, config.url)
  })
  .then(() => {
    brow.close()
  })
  .catch(err => {
    console.log(config.url)
    console.log(err)
  })

// 拦截无用请求
async function intercept(page, types = []) {
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    const resUrl = interceptedRequest.url()
    if (types.some(item => resUrl.endsWith(item))) {
      interceptedRequest.abort()
    } else {
      interceptedRequest.continue()
    }
  })
}

// 获取小说正文
async function getContent(page, url) {
  config.url = url
  await page.goto(url)
  let title = await page.title()
  let content = await page.$eval('#content', el => el.innerText)
  const link = await page.$eval('#box_con>.bottem>a+a+a+a', el => el.innerText.trim() === '下一章' ? el.href : '')
  title = replaceTitle(title)
  appendText( title, replaceContent(content))
  console.log(title, '\n')
  if (link) {
    return getContent(page, link)
  } else {
    return ''
  }
}

// 去除 title 无用内容
function replaceTitle(title) {
  title = title.replace(/_笔趣阁/ig, '')
  title = title.replace(/笔趣阁/ig, '')
  title = title.replace(/_雪鹰领主/ig, '')
  title = title.replace(/笔趣阁/ig, '')
  return title
}

// 去除 content 无用内容
function replaceContent(content) {
  content = content.replace(/笔趣阁 www.xbiquge.cc，最快更新雪鹰领主最新章节！/ig, '')
  content = content.replace(/&nbsp;/ig, '')
  content = content.replace(/<br>/ig, '')
  content = content.replace(/笔趣阁/ig, '')
  content = content.replace(/www.xbiquge.cc/ig, '')
  return content
}

// 追加至文件
function appendText( title, content) {
  fs.appendFileSync(`${config.name}.txt`, `${title}\n${content}\n\n`)
}
