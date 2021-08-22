import { IChatMsg } from '@hhui64/cclinkjs-room-module/src/lib/Chat/ChatInterface'
import ConfigManager from '../configManager'
import StatusManager from '../statusManager'
import { sendToProtocol } from '../socketServer/server'
import { wrap } from '../socketServer/server'
import consola from 'consola'
import EmtsLoader from '../emtsLoader'

const log = consola.withTag('modules/chatMessage')

interface ICommentChatMsgCache {
  uid: string
  message: string
  timestamp: number
}
const commentChatMsgCache: Array<ICommentChatMsgCache> = []

const chatMessageModule = (chatMsg: IChatMsg): void => {
  const ccid = chatMsg[7][130].toString() as string
  const msg = EmtsLoader.replace(chatMsg[4]).replace(/(\[img\]).*?(\[\/img\])/g, '[图片]')

  log.info('[💬] ', chatMsg[197] + '：' + msg)

  if (ConfigManager.getConfig().giftCard.comment.use) {
    let _msg = msg

    if (
      msg.slice(0, ConfigManager.getConfig().giftCard.comment.prefix.length) ===
      ConfigManager.getConfig().giftCard.comment.prefix
    ) {
      _msg = _msg.slice(ConfigManager.getConfig().giftCard.comment.prefix.length)

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

  sendToProtocol(
    JSON.stringify(
      wrap({
        type: 'data',
        data: {
          avatarUrl: chatMsg[10],
          nickname: chatMsg[197],
          message: msg,
          uid: ccid,
          userInfo: chatMsg[7],
          type: (() => {
            if (chatMsg[7][130].toString() === StatusManager.status.roomInfo.liveId) return 'anchor'
            if (chatMsg[39] === '1') return 'admin'
            return 'normal'
          })(),
        },
      })
    ),
    'chat-message'
  )
}

const clearChatMessageCache = (): void => {
  commentChatMsgCache.splice(0, commentChatMsgCache.length - 1)
}

export { ICommentChatMsgCache, chatMessageModule, commentChatMsgCache, clearChatMessageCache }
