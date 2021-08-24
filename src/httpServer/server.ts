import express from 'express'
import { wrap, socketServer, sendToProtocol } from '../socketServer/server'
import path from 'path'
import consola from 'consola'
import ConfigManager, { IConfig } from '../configManager'
import StatusManager from '../statusManager'
import { getRandomChatMessage, getRandomGiftCapsule, getRandomGiftCard, randomNum } from '../mock'
import { Server } from 'http'
import CCLinkJSManager, { ICCLinkJSInstance } from '../cclinkjsManager'

const httpServerLog = consola.withTag('httpServer')

const port = 39074

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.sendStatus(200)
  else next()
})

app.use('/', express.static(path.join(__dirname, '../../', 'web')))

const uuid = CCLinkJSManager.createCCLinkJS().uuid
const cclinkjsInstance = CCLinkJSManager.getCCLinkJSInstance(uuid) as ICCLinkJSInstance

app.get('/get-config', (req, res) => {
  ConfigManager.readConfig()
  res.send({
    code: 200,
    data: ConfigManager.getConfig(),
  })
})

app.get('/get-status', (req, res) => {
  res.send({
    code: 200,
    data: StatusManager.getStatus(),
  })
})

app.post('/update-config', (req, res) => {
  ConfigManager.setConfig(req.body as IConfig)
  ConfigManager.saveConfig()
  ConfigManager.readConfig()

  if (socketServer) {
    sendToProtocol(JSON.stringify(wrap({ type: 'update-config', data: {} })))
    res.send({
      code: 200,
      data: ConfigManager.getConfig(),
    })
  } else {
    res.send({
      code: 20001,
      msg: 'Socket 服务端未初始化！',
    })
  }
})

app.post('/join', async (req, res) => {
  const liveId = (req.body.liveId as string).toString()

  if (!req.body.liveId) {
    res.send({
      code: 10003,
      msg: '直播间ID不能为空',
    })
  }

  httpServerLog.info(uuid, '正在进入房间...')

  CCLinkJSManager.joinLiveRoom(uuid, liveId)
    .then((value) => {
      StatusManager.status.isJoinRoom = true
      StatusManager.status.roomInfo.liveId = liveId
      StatusManager.status.roomInfo.title = value.liveRoomInfo.props.pageProps.roomInfoInitData.live?.title || ''

      res.send({
        code: 10000,
        msg: 'ok',
      })

      httpServerLog.success(uuid, '进入房间成功！', StatusManager.status.roomInfo.title)
    })
    .catch((reason: Error) => {
      res.send({
        code: 10001,
        msg: '进入房间失败！' + reason.message,
      })

      StatusManager.resetStatus()
      httpServerLog.error(uuid, '进入房间失败！', reason)
    })
})

app.post('/leave', (req, res) => {
  cclinkjsInstance.cclinkjs.close()

  setTimeout(() => cclinkjsInstance.cclinkjs.connect(), 1000)

  cclinkjsInstance.cclinkjs.once('ready', () => {
    res.send({
      code: 10000,
      msg: 'ok',
    })
  })
})

app.post('/control', (req, res) => {
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
        'gift-capsule'
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
        'chat-message'
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
        'gift-card'
      )
      break
    case 'clearGiftCapsule':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), 'gift-capsule')
      break
    case 'clearChatMessage':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), 'chat-message')
      break
    case 'clearGiftCard':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), 'gift-card')
      break
  }

  res.send({
    code: 200,
    msg: 'ok',
  })
})

export default function initHttpServer(): Server {
  httpServerLog.info(`livekun 服务端正在启动中...`)

  return app.listen(port, () => {
    httpServerLog.success(`livekun 服务端启动完成！正在监听端口：${port}...`)
  })
}
