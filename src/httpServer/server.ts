import express from 'express'
import { wrap, socketServer, sendToProtocol } from '../socketServer/server'
import path from 'path'
import consola from 'consola'
import ConfigManager, { IConfig } from '../configManager'
import { getRandomChatMessage, getRandomGiftCapsule, getRandomGiftCard, user } from '../mock'
import { Server } from 'http'
import CCLinkJSManager from '../cclinkjsManager'
import session from 'express-session'
import userRouter from './user'

const httpServerLog = consola.withTag('httpServer')

const port = 39074

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'hhui64',
    name: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: true,
      httpOnly: true,
    },
  })
)
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.sendStatus(200)
  else next()
})
app.use('/user', userRouter)
app.use('/', express.static(path.join(__dirname, '../../', 'web')))

app.get('/api/get-status', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string)
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (uuid !== '' && instance) {
    res.send({
      code: 200,
      data: instance.getStatus(),
    })
  } else {
    res.send({
      code: 404,
      message: 'UUID not found.',
    })
  }
})

app.get('/user/get-config', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string)

  if (uuid !== '') {
    res.send({
      code: 200,
      data: {
        uuid,
        ...ConfigManager.getConfig(uuid),
      },
    })
  } else {
    res.send({
      code: 404,
      message: 'UUID not found.',
    })
  }
})

app.post('/user/update-config', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string

  ConfigManager.setConfig(req.body as IConfig)
  ConfigManager.saveConfig(uuid)
  ConfigManager.readConfig(uuid)

  if (socketServer) {
    sendToProtocol(JSON.stringify(wrap({ type: 'update-config', data: {} })))
    res.send({
      code: 200,
      data: ConfigManager.getConfig(uuid),
    })
  } else {
    res.send({
      code: 20001,
      message: 'Socket 服务端未初始化！',
    })
  }
})

app.post('/api/join', async (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    res.send({
      code: 10008,
      message: 'Instance not found.',
    })
    return
  }

  const liveId = (req.body.liveId as string).toString()

  if (!req.body.liveId) {
    res.send({
      code: 10003,
      message: '直播间ID不能为空',
    })
  }

  httpServerLog.info(uuid, '正在进入房间...', liveId)

  instance
    .joinLiveRoom(uuid, liveId)
    .then(() => {
      res.send({
        code: 200,
        message: 'ok',
      })

      httpServerLog.success(uuid, '进入房间成功！', instance.getStatus().roomInfo.title)
    })
    .catch((reason: Error) => {
      res.send({
        code: 10001,
        message: '进入房间失败！' + reason.message,
      })

      httpServerLog.error(uuid, '进入房间失败！', reason)
    })
})

app.post('/api/reset', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    res.send({
      code: 10008,
      message: 'Instance not found.',
    })
    return
  }

  instance
    .reset()
    .then(() => {
      res.send({
        code: 200,
        message: 'ok',
      })
    })
    .catch((reason: Error) => {
      res.send({
        code: 10001,
        message: reason.message,
      })
    })
})

app.post('/api/control', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string
  const method = req.body.method as string

  switch (method) {
    case 'sendMockDataToGiftCapsule':
      sendToProtocol(
        JSON.stringify(
          wrap({
            type: 'data',
            data: getRandomGiftCapsule(),
          })
        ),
        `gift-capsule`,
        uuid
      )
      break
    case 'sendMockDataToChatMessage':
      sendToProtocol(
        JSON.stringify(
          wrap({
            type: 'data',
            data: getRandomChatMessage(),
          })
        ),
        `chat-message`,
        uuid
      )
      break
    case 'sendMockDataToGiftCard':
      sendToProtocol(
        JSON.stringify(
          wrap({
            type: 'data',
            data: getRandomGiftCard(),
          })
        ),
        `gift-card`,
        uuid
      )
      break
    case 'clearGiftCapsule':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), `gift-capsule`, uuid)
      break
    case 'clearChatMessage':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), `chat-message`, uuid)
      break
    case 'clearGiftCard':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), `gift-card`, uuid)
      break
  }

  res.send({
    code: 200,
    message: 'ok',
  })
})

export default function initHttpServer(): Server {
  httpServerLog.info(`livekun 服务端正在启动中...`)

  return app.listen(port, () => {
    httpServerLog.success(`livekun 服务端启动完成！正在监听端口：${port}...`)
  })
}
