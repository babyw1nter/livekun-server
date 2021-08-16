import { CCLinkJS, ICCRecvJsonData } from '@hhui64/cclinkjs/src/index'
import readline from 'readline'
import axios from 'axios'
import { connections } from './socketServer/server'
import init from './httpServer/server'
import {
  Chat,
  ChatListener,
  ChatMethods,
  ChatInterface,
  Client,
  ClientMethods,
  ClientInterface,
  Gift,
  GiftListener,
  GiftMethods,
  GiftInterface,
  Room,
  RoomListener,
  RoomMethods,
  RoomInterface,
  User,
  UserMethods,
  UserInterface,
  HotScoreListener,
} from '@hhui64/cclinkjs-room-module/src/index'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const giftData: GiftInterface.IGiftListData = require('../data/gamegift-7347.json')

// enum ROOM_EVENTS {
//   LOGIN = '2-2',
//   JOIN_LIVE = '512-1',
//   ON_GIFT = '41016-4',
//   ON_CHAT = '515-32785',
//   ON_JOIN_ROOM = '512-32784',
//   ON_GET_MIC = '517-17',
//   ON_GET_VIPLIST = '41493-1',
//   ON_GET_ANNOUNCEMENT = '513-3',
//   ON_SCORE = '6144-10',
//   ON_FOLLOW = '40962-28',
//   ON_GET_FOLLOWER = '40962-3',
// }

interface IFollowerData extends ICCRecvJsonData {
  follower_num: number
}

interface IFollowData extends IFollowerData {
  follow_user: Array<{
    nickname: string
    stealth: number
    uid: number
  }>
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('line', (input) => {
  if (input === 'close') {
    rl.close()
  }

  const args = input.split(' ')

  if (args.length > 0) {
    switch (args[0]) {
      case 'join':
        if (args.length === 2) {
          const liveId = Number(args[1])
          console.log('* 进房', liveId)
          joinRoomMethod(liveId)
        } else {
          console.log('请填写直播间号，如：join 384932060')
        }
        break
      case 'leave':
        cclinkjs.close()
        cclinkjs.connect()
        break
      default:
        console.log('未知参数')
    }
  }
})

const cclinkjs = new CCLinkJS()

// cclinkjs.connect()

const joinRoomMethod = (liveId: number): void => {
  console.log('* 正在获取房间信息...')

  if (!cclinkjs.socket.connection) {
    console.log('* 尚未连接，正在连接中...')
    cclinkjs.connect()
  }

  RoomMethods.getLiveRoomInfoByCcId(liveId)
    .then((liveInfoJsonData) => {
      const roomId = liveInfoJsonData.props.pageProps.roomInfoInitData.live?.room_id
      const channelId = liveInfoJsonData.props.pageProps.roomInfoInitData.live?.channel_id
      const gameType = liveInfoJsonData.props.pageProps.roomInfoInitData.live?.gametype

      if (!roomId || !channelId || !gameType) {
        return
      }

      console.info('√ 获取房间信息成功！', roomId, channelId, gameType)

      console.info('* 正在进入房间...')
      cclinkjs
        .send(RoomMethods.joinLiveRoomProtocol(roomId, channelId, gameType), 3000)
        .then((recvJsonData) => {
          console.info('√ 进入房间成功！')
          console.info('=======================')
          console.info('频道名称', recvJsonData.chname)
          console.info('热度值', recvJsonData.hot_score)
          console.info('观众数', recvJsonData.usercount)
          console.info('=======================')
        })
        .catch((reason) => {
          console.error('× 进入房间失败！:', reason)
        })
    })
    .catch((reason) => {
      console.error('× 获取房间信息失败！:', reason)
    })
}

cclinkjs
  .on('connect', (connection) => {
    console.info('√ 连接CC服务端成功！')
    setTimeout(async () => {
      console.info('* 发送客户端握手信息...')
      try {
        const response = await cclinkjs.send(ClientMethods.clientInfoProtocol(), 3000)
        if (response) {
          console.info('√ 服务端与客户端握手成功！')
        }
      } catch (error) {
        console.error(new Error(error))
      }
    }, 1000)
    // login
    // setTimeout(() => {
    //   cclinkjs.send({
    //     ccsid: 2,
    //     cccid: 2,
    //     token: 'tk_7ff456a68844a79d9047d16defc1f48c',
    //     urs: 'hui700733@163.com',
    //   })
    // }, 1500)
  })
  .on('close', (code, desc) => {
    console.log('连接关闭:', code, desc)
  })
  .on('error', (error) => {
    console.error('连接错误:', error)
  })

/**
 * 订阅事件
 */
cclinkjs
  .on(
    RoomListener.EventName(),
    RoomListener.EventListener((userJoinRoomMsg) => {
      console.info('[🏡] ', userJoinRoomMsg.name, ' 进入了直播间')
    })
  )
  .on(
    ChatListener.EventName(),
    ChatListener.EventListener((chatMsg) => {
      console.info('[💬] ', chatMsg[197] + '：' + chatMsg[4])

      if (connections.chatMessageConnection != null) {
        connections.chatMessageConnection.sendUTF(
          JSON.stringify({
            avatarUrl: chatMsg[10],
            nickname: chatMsg[197],
            message: chatMsg[4],
            uid: chatMsg[1]?.toString(),
          })
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
        connections.giftCapsuleConnection.sendUTF(
          JSON.stringify({
            avatarUrl: giftMsg.frompurl,
            nickname: giftMsg.fromnick,
            uid: giftMsg.fromid.toString(),
            money: giftMoney,
            giftName: giftName,
            giftCount: giftMsg.num,
          })
        )
      }
    })
  )
  .on(
    HotScoreListener.EventName(),
    HotScoreListener.EventListener((hotScoreData) => {
      // console.log('[🔥] ', `热度：${hotScoreData.hot_score} 观众：${hotScoreData.usercount}`)
    })
  )

init()
