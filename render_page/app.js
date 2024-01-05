import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import {getDetailContent, saveInfor} from './repositories/getWPContent.repo.js'

/* Creating Server */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const templateFolder = path.join(__dirname, 'view')

app.set('views', templateFolder)
app.set('view engine', 'ejs')

/* Adding Routes */

const staticFolder = path.join(__dirname, 'static')

app.get('/:slug', async function (req, res) {
  const dataDefault = {
    title: 'Thông tin nóng',
    content:
      'Tin tức 24h,cập nhật tin nóng online Việt Nam và thế giới mới nhất trong ngày, tin nhanh thời sự, chính trị, xã hội hôm nay, tin tức, top news ...',
    image: 'https://pbs.twimg.com/profile_images/781035332615729152/6CC3tvrZ_400x400.jpg',
    targetUrl: 'https://google.com',
  }
  const data = (await getDetailContent(req.params.slug)) || dataDefault
  // // const url = new URL(req.headers['referer']) || {}
  // console.log('body', req.headers['x-forwarded-for'] || req.socket.remoteAddress)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  let saveData = {ip: '', webrtc: ''}
  saveData['user-agent'] = req.headers['user-agent']
  saveData['device'] = req.headers['sec-ch-ua-platform']
  saveData['ip'] = ip
  await saveInfor(req.params.slug, saveData)
  res.render('index', data)
})

// app.post('/content', async function (req, res) {
//   const url = new URL(req.headers['referer']) || {}
//   console.log('body', req.headers['x-forwarded-for'])
//   const slug = url?.pathname.replace('/', '') || ''
//   let saveData = {ip: '', webrtc: ''}
//   saveData['user-agent'] = req.headers['user-agent']
//   saveData['device'] = req.headers['sec-ch-ua-platform']
//   await saveInfor(slug, saveData)
//   res.json({code: 200})
// })

/* Start Running Server */

const port = 3005
app.listen(port, function () {
  console.log('Server is running at...')
  console.log(`http://127.0.0.1:${port}`)
})
