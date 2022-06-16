import UserConfigManager from '../configManager'
import { sendToProtocol } from '../socketServer/server'
import { GiftInterface } from '@hhui64/cclinkjs-room-module'
import consola from 'consola'
import GiftLoader from '../giftLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'

const log = consola.withTag('modules/giftCapsule')

const giftCapsuleModule = (giftMsg: GiftInterface.IGiftMsg, instance: CCLinkJSInstance): void => {
  const config = UserConfigManager.get(instance.uuid)

  const ccid = giftMsg.fromid.toString()
  // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
  const gift = GiftLoader.getGiftBySaleId(giftMsg.saleid)
  const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid.toString()
  const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

  // log.info(
  //   '[🎁] ',
  //   `${giftMsg.fromnick}(${giftMsg.fromid}) 送出 ${giftMsg.num} 个 ${giftName}`,
  //   giftMsg.combo > 1 ? giftMsg.combo + ' 连击' : '',
  //   giftMsg.combo > 1 ? giftMsg.comboid : ''
  // )

  if (config.giftCapsule.minMoney > giftMoney) return

  const data = {
    type: 'data',
    data: {
      uid: ccid,
      avatarUrl: giftMsg.frompurl,
      nickname: giftMsg.fromnick,
      messageType: 'gift-capsule',
      money: giftMoney,
      giftName: giftName,
      giftCount: giftMsg.num,
      giftImage: gift?.gif4web || gift?.gif || gift?.mgif,
    },
  }

  sendToProtocol(data, 'gift-capsule', instance.uuid)
}

export { giftCapsuleModule }
