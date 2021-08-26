import ConfigManager from '../configManager'
import { sendToProtocol } from '../socketServer/server'
import { IGiftMsg } from '@hhui64/cclinkjs-room-module/src/lib/Gift/GiftInterface'
import { wrap } from '../socketServer/server'
import consola from 'consola'
import GiftLoader from '../giftLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'

const log = consola.withTag('modules/giftCapsule')

const giftCapsuleModule = (giftMsg: IGiftMsg, instance: CCLinkJSInstance): void => {
  // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
  const gift = GiftLoader.getGiftBySaleId(giftMsg.saleid)
  const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid.toString()
  const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

  log.info(
    '[🎁] ',
    `${giftMsg.fromnick}(${giftMsg.fromid}) 送出 ${giftMsg.num} 个 ${giftName}`,
    giftMsg.combo > 1 ? giftMsg.combo + ' 连击' : '',
    giftMsg.combo > 1 ? giftMsg.comboid : ''
  )

  if (ConfigManager.getConfig(instance.uuid).giftCapsule.minMoney > giftMoney) return
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
          giftImage: gift?.gif4web || gift?.gif || gift?.mgif,
        },
      })
    ),
    'gift-capsule',
    instance.uuid
  )
}

export { giftCapsuleModule }
