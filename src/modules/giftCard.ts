import ConfigManager from '../configManager'
import { sendToProtocol } from '../socketServer/server'
import { GiftInterface } from '@hhui64/cclinkjs-room-module'
import { commentChatMsgCache } from './chatMessage'
import consola from 'consola'
import GiftLoader from '../giftLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'

const log = consola.withTag('modules/giftCard')

const giftCardModule = (giftMsg: GiftInterface.IGiftMsg, instance: CCLinkJSInstance): void => {
  const config = ConfigManager.get(instance.uuid)

  // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
  const gift = GiftLoader.getGiftBySaleId(giftMsg.saleid)
  const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid.toString()
  const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

  if (config.giftCard.minMoney > giftMoney) return

  const msg = `赠送了${giftName} × ${giftMsg.num}`
  let comment = ''

  // 判断是否留言礼物
  if (
    config.giftCard.comment.use &&
    (config.giftCard.comment.giftWhitelist.split('\n').includes(giftName) ||
      config.giftCard.comment.giftWhitelist === '') &&
    giftMoney >= config.giftCard.comment.giftMinMoney
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
    {
      type: 'data',
      data: {
        avatarUrl: giftMsg.frompurl,
        nickname: giftMsg.fromnick,
        uid: giftMsg.fromid.toString(),
        money: giftMoney,
        giftName: giftName,
        giftCount: giftMsg.num,
        giftImage: gift?.gif4web || gift?.gif || gift?.mgif,
        giftIcon: gift?.icon,
        message: msg,
        comment: comment,
      },
    },
    'gift-card',
    instance.uuid
  )
}

export { giftCardModule }
