import UserConfigManager from '../UserConfigManager'
import { IBaseSocketMessage, send } from '../socketServer/server'
import { GiftInterface } from '@hhui64/cclinkjs/modules'
import { commentChatMsgCache } from './chatMessage'
import consola from 'consola'
import GiftLoader from '../giftLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'
import { v4 as uuidv4 } from 'uuid'
import { IPluginConfig, PluginNames } from '../api/plugins'

const log = consola.withTag('modules/paid')

const paidModule = (giftMsg: GiftInterface.IGiftMsg, instance: CCLinkJSInstance): void => {
  const paidPluginConfig = UserConfigManager.get(instance.uuid).getPluginConfig(
    PluginNames.PLUGIN_PAID
  ) as IPluginConfig<PluginNames.PLUGIN_PAID>

  // ccid, combo, fromid/fromnick, num, saleid, toid/tonick
  const gift = GiftLoader.getGiftBySaleId(giftMsg.saleid)
  const giftName = gift ? decodeURI(gift.name) : giftMsg.saleid.toString()
  const giftMoney = gift?.price ? (gift.price / 1000) * giftMsg.num : 0

  if (paidPluginConfig.pluginConfig.minMoney > giftMoney) return

  const msg = `投喂 ${giftName}x${giftMsg.num}`
  let comment = ''

  // 判断是否留言礼物
  if (
    paidPluginConfig.pluginConfig.comment.use &&
    (paidPluginConfig.pluginConfig.comment.giftWhitelist.split('\n').includes(giftName) ||
      paidPluginConfig.pluginConfig.comment.giftWhitelist === '') &&
    giftMoney >= paidPluginConfig.pluginConfig.comment.giftMinMoney
  ) {
    const commentIndex = commentChatMsgCache.findIndex(
      (i) => i.uid === giftMsg.fromid.toString() || i.uid === (giftMsg.fromccid as number).toString()
    )

    if (commentIndex > -1) {
      comment = commentChatMsgCache[commentIndex].message
      commentChatMsgCache.splice(commentIndex, 1)
    }
  }

  const data: IBaseSocketMessage<'PLUGIN_MESSAGE'> = {
    type: 'PLUGIN_MESSAGE',
    data: {
      key: uuidv4(),
      uid: giftMsg.fromid.toString(),
      avatarUrl: giftMsg.frompurl,
      nickname: giftMsg.fromnick,
      message: msg,
      messageType: 'gift',
      money: giftMoney,
      giftName: giftName,
      giftCount: giftMsg.num,
      giftImage: gift?.gif4web || gift?.gif || gift?.mgif,
      giftIcon: gift?.icon,
      comment: comment
    }
  }

  send(data, PluginNames.PLUGIN_CHAT_MESSAGE, instance.uuid)
  send(data, PluginNames.PLUGIN_PAID, instance.uuid)
}

export { paidModule }
