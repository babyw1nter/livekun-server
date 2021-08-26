import { getRandomGiftCapsule, getRandomChatMessage, getRandomGiftCard } from '../mock'
import { sendToProtocol, wrap } from '../socketServer/server'
import consola from 'consola'
import express from 'express'
import session from 'express-session'
import CCLinkJSManager from '../cclinkjsManager'

const log = consola.withTag('httpserver/api')

const apiRouter = express.Router()

apiRouter.get('/get-status', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string)
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (uuid !== '' && instance) {
    res.send({
      code: 200,
      data: instance.getStatus(),
    })
  } else {
    res.send({
      code: 404,
      message: 'UUID not found.',
    })
  }
})

apiRouter.post('/join', async (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    res.send({
      code: 10008,
      message: 'Instance not found.',
    })
    return
  }

  const liveId = (req.body.liveId as string).toString()

  if (!req.body.liveId) {
    res.send({
      code: 10003,
      message: '直播间ID不能为空',
    })
  }

  log.info(uuid, '正在进入房间...', liveId)

  instance
    .joinLiveRoom(uuid, liveId)
    .then(() => {
      res.send({
        code: 200,
        message: 'ok',
      })

      log.success(uuid, '进入房间成功！', instance.getStatus().roomInfo.title)
    })
    .catch((reason: Error) => {
      res.send({
        code: 10001,
        message: '进入房间失败！' + reason.message,
      })

      log.error(uuid, '进入房间失败！', reason)
    })
})

apiRouter.post('/reset', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    res.send({
      code: 10008,
      message: 'Instance not found.',
    })
    return
  }

  instance
    .reset()
    .then(() => {
      res.send({
        code: 200,
        message: 'ok',
      })
    })
    .catch((reason: Error) => {
      res.send({
        code: 10001,
        message: reason.message,
      })
    })
})

apiRouter.post('/control', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string
  const method = req.body.method as string

  switch (method) {
    case 'sendMockDataToGiftCapsule':
      sendToProtocol(
        JSON.stringify(
          wrap({
            type: 'data',
            data: getRandomGiftCapsule(),
          })
        ),
        `gift-capsule`,
        uuid
      )
      break
    case 'sendMockDataToChatMessage':
      sendToProtocol(
        JSON.stringify(
          wrap({
            type: 'data',
            data: getRandomChatMessage(),
          })
        ),
        `chat-message`,
        uuid
      )
      break
    case 'sendMockDataToGiftCard':
      sendToProtocol(
        JSON.stringify(
          wrap({
            type: 'data',
            data: getRandomGiftCard(),
          })
        ),
        `gift-card`,
        uuid
      )
      break
    case 'clearGiftCapsule':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), `gift-capsule`, uuid)
      break
    case 'clearChatMessage':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), `chat-message`, uuid)
      break
    case 'clearGiftCard':
      sendToProtocol(JSON.stringify(wrap({ type: 'clear', data: {} })), `gift-card`, uuid)
      break
  }

  res.send({
    code: 200,
    message: 'ok',
  })
})

export default apiRouter
