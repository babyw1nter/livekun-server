import { CCLinkJS } from '@hhui64/cclinkjs/src'
import express from 'express'
import {
  ChatListener,
  ClientMethods,
  GiftInterface,
  GiftListener,
  HotScoreListener,
  RoomListener,
  RoomMethods,
} from '@hhui64/cclinkjs-room-module/src/index'
import { wrap, socketServer, sendToProtocol } from '../socketServer/server'
import path from 'path'
import consola from 'consola'
import ConfigManager, { IConfig } from '../configManager'
import StatusManager from '../statusManager'
import { getRandomChatMessage, getRandomGiftCapsule, getRandomGiftCard, randomNum } from '../mock'
import { Server } from 'http'

const cclinkjsLog = consola.withTag('cclinkjs')
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

const uuid = Date.now().toString()
CCLinkJSManager.createCCLinkJS(uuid)
const cclinkjsInstance = CCLinkJSManager.getCCLinkJSInstance(uuid) as ICCLinkJSInstance

const cclinkjsStatus = {
  isReady: false,
}

// cclinkjs
//   .on(ChatListener.EventName(), ChatListener.EventListener(chatMessageModule))
//   .on(GiftListener.EventName(), GiftListener.EventListener(giftCapsuleModule))
//   .on(GiftListener.EventName(), GiftListener.EventListener(giftCardModule))
// .on(
//   RoomListener.EventName(),
//   RoomListener.EventListener((userJoinRoomMsg) => {
//     cclinkjsLog.info('[🏡] ', userJoinRoomMsg.name, ' 进入了直播间')

//     if (!ConfigManager.getConfig().chatMessage.show.join) return
//     sendToProtocol(
//       JSON.stringify(
//         wrap({
//           type: 'data',
//           data: {
//             avatarUrl: '',
//             nickname: userJoinRoomMsg.name,
//             message: '进入了直播间',
//             uid: userJoinRoomMsg.uid,
//           },
//         })
//       ),
//       'chat-message'
//     )
//   })
// )
// .on(
//   HotScoreListener.EventName(),
//   HotScoreListener.EventListener((hotScoreData) => {
//     // cclinkjsLog.log('[🔥] ', `热度：${hotScoreData.hot_score} 观众：${hotScoreData.usercount}`)
//   })
// )

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

  if (!cclinkjs.socket.connection) {
    cclinkjsLog.info('CC服务端尚未连接，正在连接中...')
    cclinkjs.connect()
  }

  RoomMethods.getLiveRoomInfoByCcId(liveId)
    .then((ILiveRoomInfoByCcIdResponse) => {
      const roomId = ILiveRoomInfoByCcIdResponse.props.pageProps.roomInfoInitData.live?.room_id
      const channelId = ILiveRoomInfoByCcIdResponse.props.pageProps.roomInfoInitData.live?.channel_id
      const gameType = ILiveRoomInfoByCcIdResponse.props.pageProps.roomInfoInitData.live?.gametype
      const title = ILiveRoomInfoByCcIdResponse.props.pageProps.roomInfoInitData.live?.title

      if (!roomId || !channelId || !gameType) {
        res.send({
          code: 10001,
          msg: '获取房间信息失败！',
        })
        return
      }
      StatusManager.status.isJoinRoom = true
      StatusManager.status.roomInfo.liveId = liveId
      StatusManager.status.roomInfo.title = value.liveRoomInfo.props.pageProps.roomInfoInitData.live?.title || ''

      cclinkjsLog.success('获取房间信息成功！', roomId, channelId, gameType)
      cclinkjsLog.info('正在进入房间...')

      cclinkjs
        .send(RoomMethods.joinLiveRoomProtocol(roomId, channelId, gameType), 3000)
        .then((recvJsonData) => {
          res.send({
            code: 10000,
            msg: 'ok',
          })
          cclinkjsLog.success('进入房间成功！', title)
        })
        .catch((reason) => {
          res.send({
            code: 10002,
            msg: '进入房间失败！',
          })
          cclinkjsLog.error('进入房间失败！', reason)
        })
      httpServerLog.success(uuid, '进入房间成功！', StatusManager.status.roomInfo.title)
    })
    .catch((reason) => {
      res.send({
        code: 10001,
        msg: '获取房间信息失败！',
      })
      cclinkjsLog.error('获取房间信息失败！', reason)
      StatusManager.resetStatus()
    })
})

app.post('/leave', (req, res) => {
  cclinkjs.close()

  setTimeout(() => cclinkjs.connect(), 1000)

  const _t = setInterval(() => {
    if (cclinkjs.socket.connection && cclinkjs.socket.connection.connected && cclinkjsStatus.isReady) {
      res.send({
        code: 10000,
        msg: 'ok',
      })
      clearInterval(_t)
    }
  }, 500)
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
