import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()
const express = require('express')
const cors = require('cors')
import { loggingMiddleware } from './logger.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { initWs } from './websocket/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.rootDir = path.resolve(__dirname)

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb' }))

const http = require('http')
const server = http.createServer(app)

initWs(server)

// Configure logging
app.use(loggingMiddleware)

const whitelist = process.env.WHITE_LISTS.split(',') || ''
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (origin === undefined || whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  exposedHeaders: ['content-disposition'],
}
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// TODO: setup serve static screenShot

import topicRoutes from './routes/Topic.routes.js'
import sourceRoutes from './routes/Source.routes.js'
import contentRoutes from './routes/Content.routes.js'
import commentRoutes from './routes/Comment.routes.js'
import campaignRoutes from './routes/Campaign.routes.js'
import authorRoutes from './routes/Author.routes.js'
import userRoutes from './routes/User.routes.js'
import tagRoutes from './routes/Tag.routes.js'
import profileRoutes from './routes/Profile.routes.js'
import fbAccountRoutes from './routes/FbAccount.routes.js'
import historyRoutes from './routes/History.routes.js'
import notificationRoutes from './routes/Notification.routes.js'
import notificationSettingRoutes from './routes/NotificationSetting.routes.js'
import wordpressContentRoutes from './routes/WordpressContent.routes.js'
import categoryRoutes from './routes/Category.routes.js'

app.use('/api/topic', topicRoutes)
app.use('/api/source', sourceRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/campaign', campaignRoutes)
app.use('/api/author', authorRoutes)
app.use('/api/user', userRoutes)
app.use('/api/tag', tagRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/fbaccount', fbAccountRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/notificationSetting', notificationSettingRoutes)
app.use('/api/wordpressContent', wordpressContentRoutes)
app.use('/api/category', categoryRoutes)

app.use((err, req, res, _) => {
  return res.json(err)
})

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

const port = normalizePort(process.env.PORT || '8000')
// const prisma = new PrismaClient()

server.listen(port, () => {
  console.log(`listening on *:${port}`)
})

export default app
