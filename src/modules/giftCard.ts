import ConfigManager from '../configManager'
import { sendToProtocol } from '../socketServer/server'
import { IGiftMsg } from '@hhui64/cclinkjs-room-module/src/lib/Gift/GiftInterface'
import { commentChatMsgCache } from './chatMessage'
import { wrap } from '../socketServer/server'
import consola from 'consola'
import GiftLoader from '../giftLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'

const log = consola.withTag('modules/giftCard')

const giftCardModule = (giftMsg: IGiftMsg, instance: CCLinkJSInstance): void => {
  // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
  const gift = GiftLoader.getGiftBySaleId(giftMsg.saleid)
  const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid.toString()
  const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

  if (ConfigManager.getConfig().giftCard.minMoney > giftMoney) return

  const msg = `赠送了${giftName} × ${giftMsg.num}`
  let comment = ''

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
      comment = commentChatMsgCache[commentIndex].message
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
          giftImage: gift?.gif || gift?.gif4web || gift?.mgif,
          message: msg,
          comment: comment,
        },
      })
    ),
    'gift-card'
  )
}

export { giftCardModule }
