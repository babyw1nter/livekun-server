import ConfigManager from '../configManager'
import { sendToProtocol } from '../socketServer/server'
import { IGiftMsg } from '@hhui64/cclinkjs-room-module/src/lib/Gift/GiftInterface'
import { GiftInterface } from '@hhui64/cclinkjs-room-module/src'
import { commentChatMsgCache } from './chatMessage'
import { wrap } from '../socketServer/server'
import consola from 'consola'

const log = consola.withTag('modules/giftCapsule')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const giftData: GiftInterface.IGiftListData = require('../../data/gamegift-7347.json')

const giftCapsuleModule = (giftMsg: IGiftMsg): void => {
  // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
  const gift = giftData.conf.find((item) => item.saleid === giftMsg.saleid)
  const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid.toString()
  const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

  log.info(
    '[🎁] ',
    `${giftMsg.fromnick}(${giftMsg.fromid}) 送出 ${giftMsg.num} 个 ${giftName}`,
    giftMsg.combo > 1 ? giftMsg.combo + ' 连击' : '',
    giftMsg.combo > 1 ? giftMsg.comboid : ''
  )

  if (ConfigManager.getConfig().giftCapsule.minMoney > giftMoney) return
  sendToProtocol(
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
    ),
    'gift-capsule'
  )

  if (ConfigManager.getConfig().giftCard.minMoney > giftMoney) return

  let msg = `赠送了${giftName} × ${giftMsg.num}`

  // 判断是否留言礼物
  if (
    ConfigManager.getConfig().giftCard.comment.use &&
    (ConfigManager.getConfig().giftCard.comment.giftWhitelist.split('\n').includes(giftName) ||
      ConfigManager.getConfig().giftCard.comment.giftWhitelist === '') &&
    giftMoney >= ConfigManager.getConfig().giftCard.comment.giftMinMoney
  ) {
    const commentIndex = commentChatMsgCache.findIndex(
      (i) => i.uid === giftMsg.fromid.toString() || i.uid === (giftMsg.fromccid as number).toString()
    )

    if (commentIndex > -1) {
      msg = commentChatMsgCache[commentIndex].message
      commentChatMsgCache.splice(commentIndex, 1)
    }
  }

  sendToProtocol(
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
          message: msg,
        },
      })
    ),
    'gift-card'
  )
}

export { giftCapsuleModule, giftData }
