import { ChatInterface } from '@hhui64/cclinkjs-room-module'
import ConfigManager from '../configManager'
import { sendToProtocol } from '../socketServer/server'
import consola from 'consola'
import EmtsLoader from '../emtsLoader'
import { CCLinkJSInstance } from '../cclinkjsManager'
import { readFileSync } from 'fs'
import path from 'path'

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
  const config = ConfigManager.get(instance.uuid)

  const ccid = chatMsg[7][130].toString() as string
  const msg = EmtsLoader.replace(chatMsg[4]).replace(/(\[img\]).*?(\[\/img\])/g, '[图片]')

  log.info('[💬] ', chatMsg[197] + '：' + msg)
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

  if (blacklist.users.includes(ccid)) return
  // 若存在全站黑名单和用户插件配置黑名单中，则过滤
  if (globalBlacklist.users.includes(ccid) || config.chatMessage.blacklist.includes(ccid)) return

  const data = {
    type: 'data',
    data: {
      avatarUrl: chatMsg[10],
      nickname: chatMsg[197],
      message: msg,
      uid: ccid,
      messageType: 'chat',
      userInfo: chatMsg[7],
      type: (() => {
        try {
          const exInfo = JSON.parse(chatMsg[99])
          if (ccid === instance.getStatus().roomInfo.liveId) return 'anchor'
          if (exInfo.guard_level === 1) return 'guard-monthly'
          if (exInfo.guard_level === 2) return 'guard-annual'
          if (chatMsg[39] === '1') return 'admin'
          return 'normal'
        } catch (err) {
          return 'normal'
        }
      })(),
    },
  }

  sendToProtocol(data, 'chat-message', instance.uuid)
}

const clearChatMessageCache = (): void => {
  commentChatMsgCache.splice(0, commentChatMsgCache.length - 1)
}

export { ICommentChatMsgCache, chatMessageModule, commentChatMsgCache, clearChatMessageCache }
