import { ChatInterface } from '@hhui64/cclinkjs-room-module'
import UserConfigManager from '../UserConfigManager'
import { sendToProtocol } from '../socketServer/server'
import consola from 'consola'
import EmtsLoader from '../emtsLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'
import { readFileSync } from 'node:fs'
import path from 'node:path'

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
  const config = UserConfigManager.get(instance.uuid)

  const ccid = chatMsg[7][130].toString() as string
  const msg = EmtsLoader.replace(chatMsg[4]).replace(/(\[img\]).*?(\[\/img\])/g, '[图片]')

  // log.info('[💬] ', chatMsg[197] + '：' + msg)

  if (config.giftCard.comment.use) {
    let _msg = msg

    if (msg.slice(0, config.giftCard.comment.prefix.length) === config.giftCard.comment.prefix) {
      _msg = _msg.slice(config.giftCard.comment.prefix.length)

      const cacheIndex = commentChatMsgCache.findIndex((i) => i.uid === ccid)
      const data = {
        uid: ccid,
        message: _msg,
        timestamp: Date.now(),
      }
      if (cacheIndex > -1) {
        commentChatMsgCache[cacheIndex] = data
      } else {
        commentChatMsgCache.push(data)
      }
    }
  }

  // 若存在全站黑名单和用户插件配置黑名单中，则过滤
  if (globalBlacklist.users.includes(ccid) || config.chatMessage.blacklist.findIndex(i => i.ccid === ccid) > -1) return

  let type = 'normal'
  let exInfo = null

  const ext = {
    admin: false,
    guard: 0,
    badgeInfo: {
      badgename: '',
      level: 0,
    },
  }

  try {
    exInfo = JSON.parse(chatMsg[99])
  } catch (err) {
    type = 'normal'
  }

  if (exInfo) {
    if (ccid === instance.getStatus().roomInfo.liveId) type = 'anchor'
    if (exInfo.guard_level === 1) type = 'guard-monthly'
    if (exInfo.guard_level === 2) type = 'guard-annual'
    if (chatMsg[39] === '1') type = 'admin'

    try {
      ext.admin = chatMsg[39] === '1'
      ext.guard = Number(exInfo?.guard_level || 0)
      ext.badgeInfo.badgename = exInfo?.badgeInfo.badgename || ''
      ext.badgeInfo.level = Number(exInfo?.badgeInfo.level || 0)
    } catch (err) {
      //
    }
  }

  const data = {
    type: 'data',
    data: {
      uid: ccid,
      avatarUrl: chatMsg[10],
      nickname: chatMsg[197],
      messageType: 'chat',
      userInfo: chatMsg[7],
      message: msg,
      type,
      ...ext,
    },
  }

  sendToProtocol(data, 'chat-message', instance.uuid)
}

const clearChatMessageCache = (): void => {
  commentChatMsgCache.splice(0, commentChatMsgCache.length - 1)
}

export { ICommentChatMsgCache, chatMessageModule, commentChatMsgCache, clearChatMessageCache }
