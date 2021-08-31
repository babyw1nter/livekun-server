import { getRandomGiftCapsule, getRandomChatMessage, getRandomGiftCard } from '../mock'
import { sendToProtocol, wrap } from '../socketServer/server'
import consola from 'consola'
import express from 'express'
import CCLinkJSManager from '../cclinkjsManager'
import { resWrap } from './server'
import { readFileSync } from 'fs'
import path from 'path'

const log = consola.withTag('httpserver/api')

const apiRouter = express.Router()

apiRouter.get('/get-broadcasts', (req, res) => {
  interface Broadcasts {
    broadcasts: Array<string>
  }

  try {
    const broadcasts = JSON.parse(
      readFileSync(path.join(__dirname, '../../', 'data', 'broadcasts.json')).toString()
    ) as Broadcasts

    res.json(
      resWrap(200, 'ok', {
        broadcasts: broadcasts.broadcasts,
      })
    )
  } catch (error: unknown) {
    res.json(resWrap(20001, '获取公告失败！'))
  }
})

apiRouter.get('/get-status', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string)
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (uuid !== '' && instance) {
    res.json(resWrap(200, 'ok', instance.getStatus()))
  } else {
    res.json(resWrap(10008, 'Instance not found.'))
  }
})

apiRouter.post('/join', async (req, res) => {
  const uuid = req.session.user?.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (uuid === '' || !instance) {
    res.json(resWrap(10008, 'Instance not found.'))
    return
  }

  const liveId = (req.body.liveId as string).toString()

  if (!liveId) {
    res.json(resWrap(10003, '未指定直播间ID'))
  }

  log.info(uuid, '正在进入房间...', liveId)

  instance
    .joinLiveRoom(uuid, liveId)
    .then(() => {
      res.json(
        resWrap(200, 'ok', {
          status: instance.getStatus(),
        })
      )
      log.success(uuid, '进入房间成功！', instance.getStatus().roomInfo.title)
    })
    .catch((reason: Error) => {
      res.json(
        resWrap(10001, '进入房间失败！' + reason.message, {
          status: instance.getStatus(),
        })
      )
      log.error(uuid, '进入房间失败！', reason)
    })
})

apiRouter.post('/reset', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    res.json(resWrap(10008, 'Instance not found.'))
    return
  }

  instance
    .reset()
    .then(() => {
      res.json(
        resWrap(200, 'ok', {
          instatus: instance.getStatus(),
        })
      )
    })
    .catch((reason: Error) => {
      res.json(
        resWrap(30001, '重置失败！' + reason.message, {
          status: instance.getStatus(),
        })
      )
    })
})

apiRouter.post('/control', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const method = req.body.method as string

  switch (method) {
    case 'sendMockDataToGiftCapsule':
      sendToProtocol(
        {
          type: 'data',
          data: getRandomGiftCapsule(),
        },
        'gift-capsule',
        uuid
      )
      break
    case 'sendMockDataToChatMessage':
      sendToProtocol(
        {
          type: 'data',
          data: getRandomChatMessage(),
        },
        'chat-message',
        uuid
      )
      break
    case 'sendMockDataToGiftCard':
      sendToProtocol(
        {
          type: 'data',
          data: getRandomGiftCard(),
        },
        'gift-card',
        uuid
      )
      break
    case 'clearGiftCapsule':
      sendToProtocol({ type: 'method', data: { method: 'clear' } }, 'gift-capsule', uuid)
      break
    case 'clearChatMessage':
      sendToProtocol({ type: 'method', data: { method: 'clear' } }, 'chat-message', uuid)
      break
    case 'clearGiftCard':
      sendToProtocol({ type: 'method', data: { method: 'clear' } }, 'gift-card', uuid)
      break
    case 'refreshGiftCapsule':
      sendToProtocol({ type: 'method', data: { method: 'refresh' } }, 'gift-capsule', uuid)
      break
    case 'refreshChatMessage':
      sendToProtocol({ type: 'method', data: { method: 'refresh' } }, 'chat-message', uuid)
      break
    case 'refreshGiftCard':
      sendToProtocol({ type: 'method', data: { method: 'refresh' } }, 'gift-card', uuid)
      break
  }

  res.json(
    resWrap(200, 'ok', {
      uuid,
      method,
    })
  )
})

export default apiRouter
