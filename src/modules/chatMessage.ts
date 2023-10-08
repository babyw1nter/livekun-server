import { ChatInterface } from '@hhui64/cclinkjs/modules'
import UserConfigManager from '../UserConfigManager'
import { IBaseSocketMessage, send } from '../socketServer/server'
import consola from 'consola'
import EmtsLoader from '../emtsLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { IPluginConfig, PluginNames } from '../api/plugins'

const log = consola.withTag('modules/chatMessage')

interface GlobalBlacklist {
  users: Array<string>
}

const globalBlacklist = JSON.parse(
  readFileSync(path.join(__dirname, '../../', 'data', 'blacklist.json')).toString()
) as GlobalBlacklist

interface ICommentChatMsgCache {
  uid: string
  message: string
  timestamp: number
}
const commentChatMsgCache: Array<ICommentChatMsgCache> = []

const chatMessageModule = (chatMsg: ChatInterface.IChatMsg, instance: CCLinkJSInstance): void => {
  const chatMessagePluginConfig = UserConfigManager.get(instance.uuid).getPluginConfig(
    PluginNames.PLUGIN_CHAT_MESSAGE
  ) as IPluginConfig<PluginNames.PLUGIN_CHAT_MESSAGE>
  const paidPluginConfig = UserConfigManager.get(instance.uuid).getPluginConfig(
    PluginNames.PLUGIN_PAID
  ) as IPluginConfig<PluginNames.PLUGIN_PAID>

  const ccid = chatMsg[7][130].toString() as string
  const msg = EmtsLoader.replace(chatMsg[4]).replace(/(\[img\]).*?(\[\/img\])/g, '[图片]')

  // log.info('[💬] ', chatMsg[197] + '：' + msg)

  if (paidPluginConfig.pluginConfig.comment.use) {
    let _msg = msg

    if (
      msg.slice(0, paidPluginConfig.pluginConfig.comment.prefix.length) === paidPluginConfig.pluginConfig.comment.prefix
    ) {
      _msg = _msg.slice(paidPluginConfig.pluginConfig.comment.prefix.length)

      const cacheIndex = commentChatMsgCache.findIndex((i) => i.uid === ccid)
      const data = {
        uid: ccid,
        message: _msg,
        timestamp: Date.now()
      }
      if (cacheIndex > -1) {
        commentChatMsgCache[cacheIndex] = data
      } else {
        commentChatMsgCache.push(data)
      }
    }
  }

  // 若存在全站黑名单和用户插件配置黑名单中，则过滤
  if (
    globalBlacklist.users.includes(ccid) ||
    chatMessagePluginConfig.pluginConfig.blacklist.findIndex((i) => i.ccid === ccid) > -1
  )
    return

  /** @deprecated */
  let type = 'normal'
  let exInfo = null

  const ext = {
    rule: {
      admin: false,
      anchor: false
    },
    guard: 0,
    badgeInfo: {
      badgename: '',
      level: 0
    }
  }

  try {
    exInfo = JSON.parse(chatMsg[99])
  } catch (err) {
    type = 'normal'
  }

  if (exInfo) {
    // if (ccid === instance.getStatus().roomInfo.liveId) type = 'anchor'
    // if (exInfo.guard_level === 1) type = 'guard-monthly'
    // if (exInfo.guard_level === 2) type = 'guard-annual'
    // if (chatMsg[39] === '1') type = 'admin'

    try {
      ext.rule.admin = chatMsg[39] === '1'
      ext.rule.anchor = ccid === instance.getStatus().roomInfo.liveId
      ext.guard = Number(exInfo?.guard_level || 0)
      ext.badgeInfo.badgename = exInfo?.badgeInfo.badgename || ''
      ext.badgeInfo.level = Number(exInfo?.badgeInfo.level || 0)
    } catch (err) {
      //
    }
  }

  const data = {
    key: uuidv4(),
    uid: ccid,
    avatarUrl: chatMsg[10] || '',
    nickname: chatMsg[197],
    messageType: 'chat',
    userInfo: chatMsg[7],
    message: msg,
    type,
    ...ext
  }

  const socketMessage: IBaseSocketMessage<'PLUGIN_MESSAGE'> = {
    type: 'PLUGIN_MESSAGE',
    data
  }

  send(socketMessage, PluginNames.PLUGIN_CHAT_MESSAGE, instance.uuid)
}

const clearChatMessageCache = (): void => {
  commentChatMsgCache.splice(0, commentChatMsgCache.length - 1)
}

export { ICommentChatMsgCache, chatMessageModule, commentChatMsgCache, clearChatMessageCache }
