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
import { connections, wrap } from '../socketServer/server'
import path from 'path'
import ConfigManager, { IConfig } from '../configManager'

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

const status = {
  isJoinRoom: false,
  roomInfo: {
    liveId: '',
    title: '',
  },
}

const cclinkjsStatus = {
  isReady: false,
}

/**
 * 创建并连接 cclinkjs 对象
 */
const cclinkjs = new CCLinkJS()
cclinkjs.connect()
cclinkjs
  .on('connect', (connection) => {
    console.info('√ 连接CC服务端成功！')
    cclinkjsStatus.isReady = false
    setTimeout(async () => {
      console.info('* 发送客户端握手信息...')
      try {
        const response = await cclinkjs.send(ClientMethods.clientInfoProtocol(), 3000)
        if (response) {
          console.info('√ 服务端与客户端握手成功！')
          cclinkjsStatus.isReady = true
        }
      } catch (error: unknown) {
        console.error(error)
      }
    }, 1000)
  })
  .on('close', (code, desc) => {
    resetStatus()
    cclinkjsStatus.isReady = false
    console.log('连接关闭:', code, desc)
  })
  .on('error', (error) => {
    resetStatus()
    cclinkjsStatus.isReady = false
    console.error('连接错误:', error)
  })

const resetStatus = () => {
  status.isJoinRoom = false
  status.roomInfo.liveId = ''
  status.roomInfo.title = ''
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const giftData: GiftInterface.IGiftListData = require('../../data/gamegift-7347.json')
cclinkjs
  .on(
    RoomListener.EventName(),
    RoomListener.EventListener((userJoinRoomMsg) => {
      console.info('[🏡] ', userJoinRoomMsg.name, ' 进入了直播间')

      if (connections.chatMessageConnection != null) {
        if (!ConfigManager.getConfig().chatMessage.show.join) return
        connections.chatMessageConnection.sendUTF(
          JSON.stringify(
            wrap({
              type: 'data',
              data: {
                avatarUrl: '',
                nickname: userJoinRoomMsg.name,
                message: '进入了直播间',
                uid: userJoinRoomMsg.uid,
              },
            })
          )
        )
      }
    })
  )
  .on(
    ChatListener.EventName(),
    ChatListener.EventListener((chatMsg) => {
      console.info('[💬] ', chatMsg[197] + '：' + chatMsg[4])

      if (connections.chatMessageConnection != null) {
        connections.chatMessageConnection.sendUTF(
          JSON.stringify(
            wrap({
              type: 'data',
              data: {
                avatarUrl: chatMsg[10],
                nickname: chatMsg[197],
                message: chatMsg[4],
                uid: chatMsg[1]?.toString(),
              },
            })
          )
        )
      }
    })
  )
  .on(
    GiftListener.EventName(),
    GiftListener.EventListener((giftMsg) => {
      // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
      const gift = giftData.conf.find((item) => item.saleid === giftMsg.saleid)
      const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid
      const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

      console.info(
        '[🎁] ',
        `${giftMsg.fromnick} 送出 ${giftMsg.num} 个 ${giftName}`,
        giftMsg.combo > 1 ? giftMsg.combo + ' 连击' : '',
        giftMsg.combo > 1 ? giftMsg.comboid : ''
      )

      if (connections.giftCapsuleConnection != null) {
        if (ConfigManager.getConfig().giftCapsule.minMoney > giftMoney) return
        connections.giftCapsuleConnection.sendUTF(
          JSON.stringify(
            wrap({
              type: 'data',
              data: {
                avatarUrl: giftMsg.frompurl,
                nickname: giftMsg.fromnick,
                uid: giftMsg.fromid.toString(),
                money: giftMoney,
                giftName: giftName,
                giftCount: giftMsg.num,
              },
            })
          )
        )
      }

      if (connections.giftCardConnection != null) {
        if (ConfigManager.getConfig().giftCard.minMoney > giftMoney) return
        connections.giftCardConnection.sendUTF(
          JSON.stringify(
            wrap({
              type: 'data',
              data: {
                avatarUrl: giftMsg.frompurl,
                nickname: giftMsg.fromnick,
                uid: giftMsg.fromid.toString(),
                money: giftMoney,
                giftName: giftName,
                giftCount: giftMsg.num,
                message: `赠送了${giftName} × ${giftMsg.num}`,
              },
            })
          )
        )
      }
    })
  )
// .on(
//   HotScoreListener.EventName(),
//   HotScoreListener.EventListener((hotScoreData) => {
//     // console.log('[🔥] ', `热度：${hotScoreData.hot_score} 观众：${hotScoreData.usercount}`)
//   })
// )

export default async function initHttpServer(): Promise<void> {
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
      data: status,
    })
  })

  app.post('/update-config', (req, res) => {
    ConfigManager.setConfig(req.body as IConfig)
    ConfigManager.saveConfig()
    ConfigManager.readConfig()

    if (connections.chatMessageConnection && connections.chatMessageConnection.connected) {
      connections.chatMessageConnection.sendUTF(JSON.stringify(wrap({ type: 'update-config', data: {} })))
    }
    if (connections.giftCapsuleConnection && connections.giftCapsuleConnection.connected) {
      connections.giftCapsuleConnection.sendUTF(JSON.stringify(wrap({ type: 'update-config', data: {} })))
    }
    if (connections.giftCardConnection && connections.giftCardConnection.connected) {
      connections.giftCardConnection.sendUTF(JSON.stringify(wrap({ type: 'update-config', data: {} })))
    }

    res.send({
      code: 200,
      data: ConfigManager.getConfig(),
    })
  })

  app.post('/join', async (req, res) => {
    const liveId = req.body.liveId as string
    if (!req.body.liveId) {
      res.send({
        code: 10003,
        msg: '直播间ID不能为空',
      })
    }

    if (!cclinkjs.socket.connection) {
      console.log('* 尚未连接，正在连接中...')
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

        console.info('√ 获取房间信息成功！', roomId, channelId, gameType)
        console.info('* 正在进入房间...')

        cclinkjs
          .send(RoomMethods.joinLiveRoomProtocol(roomId, channelId, gameType), 3000)
          .then((recvJsonData) => {
            status.isJoinRoom = true
            status.roomInfo.liveId = liveId
            status.roomInfo.title = title || ''
            res.send({
              code: 10000,
              msg: 'ok',
            })
            console.info('√ 进入房间成功！', title)
          })
          .catch((reason) => {
            resetStatus()
            res.send({
              code: 10002,
              msg: '进入房间失败！',
            })
            console.error('× 进入房间失败！:', reason)
          })
      })
      .catch((reason) => {
        res.send({
          code: 10001,
          msg: '获取房间信息失败！',
        })
        console.error('× 获取房间信息失败！:', reason)
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

  app.listen(port, () => {
    console.info(`[httpServer] HTTP 服务端启动完成！正在监听端口：${port}...`)
  })
}
