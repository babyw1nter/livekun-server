import UserConfigManager from '../UserConfigManager'
import { IBaseSocketMessage, send } from '../socketServer/server'
import { GiftInterface } from '@hhui64/cclinkjs-room-module'
import consola from 'consola'
import GiftLoader from '../giftLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'
import { v4 as uuidv4 } from 'uuid'
import { IPluginConfig, PluginNames } from '../api/plugins'

const log = consola.withTag('modules/ticket')

const ticketModule = (giftMsg: GiftInterface.IGiftMsg, instance: CCLinkJSInstance): void => {
  const ticketPluginConfig = UserConfigManager.get(instance.uuid).getPluginConfig(
    PluginNames.PLUGIN_TICKET
  ) as IPluginConfig<'ticket'>

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

  if (ticketPluginConfig.pluginConfig.minMoney > giftMoney) return

  const data: IBaseSocketMessage<'PLUGIN_MESSAGE'> = {
    type: 'PLUGIN_MESSAGE',
    data: {
      key: uuidv4(),
      uid: ccid,
      avatarUrl: giftMsg.frompurl,
      nickname: giftMsg.fromnick,
      messageType: 'ticket',
      money: giftMoney,
      giftName: giftName,
      giftCount: giftMsg.num,
      giftImage: gift?.gif4web || gift?.gif || gift?.mgif,
    },
  }

  send(data, PluginNames.PLUGIN_TICKET, instance.uuid)
}

export { ticketModule }
