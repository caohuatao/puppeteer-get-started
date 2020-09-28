# Nodejs 爬虫 爬取文章测试 仅供学习！！

* 本文章仅供学习
* 更多内容请参考 [puppeteer 中文文档](https://www.bookstack.cn/read/puppeteer-api-zh_CN/README.md) 

```js
// 谷歌无头浏览器
const puppeteer = require('puppeteer')
const fs = require('fs')
const config = {
  // 网址
  url: 'https://www.xxxx.xxx/xxx/xxx/xxx.html',
  // 小说名
  name: '**',
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
    // 这里的小说地址是静态的 html 这里就屏蔽掉其他乱七八糟请求
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

  // 获取章节 title
  let title = await page.title()
  
  // 通过选择器 获取正文内容
  let content = await page.$eval('#content', el => el.innerText)
  
  // 通过选择器 获取下一章链接，必要时需要自行拼接
  const link = await page.$eval('#box_con>.bottem>a+a+a+a', el => el.innerText.trim() === '下一章' ? el.href : '')
  title = replaceTitle(title)
  
  // 使用 fs 追加文本
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
  return title
}

// 去除 content 无用内容
function replaceContent(content) {
  content = content.replace(/笔趣阁 www.xbiquge.cc/ig, '')
  return content
}

// 追加至文件
function appendText( title, content) {
  fs.appendFileSync(`${config.name}.txt`, `${title}\n${content}\n\n`)
}

```
