import { send } from '../socketServer/server'
import consola from 'consola'
import express from 'express'
import CCLinkJSManager from '../cclinkjsManager'
import { resWrap } from './server'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { getRandomTicket, getRandomChatMessage, getRandomPaid, mockData } from '../mock'
import { PluginNames, PluginActions } from '../api/plugins'

const log = consola.withTag('httpserver/api')

const apiRouter = express.Router()

apiRouter.get('/getBroadcasts', (req, res) => {
  interface Broadcasts {
    banner: string
    broadcastsToptips: string
    broadcasts: Array<string>
  }

  try {
    const broadcasts = JSON.parse(
      readFileSync(path.join(__dirname, '../../', 'data', 'broadcasts.json')).toString()
    ) as Broadcasts

    res.json(
      resWrap(200, 'ok', {
        banner: broadcasts.banner,
        broadcastsToptips: broadcasts.broadcastsToptips,
        broadcasts: broadcasts.broadcasts
      })
    )
  } catch (error: unknown) {
    res.json(resWrap(20001, '获取公告失败！'))
  }
})

apiRouter.get('/getMockdata', (req, res) => {
  res.json(
    resWrap(200, 'ok', {
      ticketMockData: mockData.ticketList,
      chatMessageMockData: mockData.chatMessageList,
      paidMockData: mockData.paidList
    })
  )
})

apiRouter.get('/getStatus', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string)
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  // 这里因为是公开接口，UUID 并不确定存在 session 中
  // 所以当实例不存在时直接返回错误消息就可以了
  if (uuid !== '' && instance) {
    res.json(resWrap(200, 'ok', instance.getStatus()))
  } else {
    res.json(resWrap(10008, 'Instance not found.'))
  }
})

apiRouter.post('/join', async (req, res) => {
  const uuid = req.session.user?.uuid as string
  const liveId = (req.body.liveId as string).toString()

  if (!liveId) {
    res.json(resWrap(10003, '未指定直播间ID'))
    return
  }

  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid) || CCLinkJSManager.createCCLinkJS(uuid)

  log.info(uuid, '正在进入房间...', liveId)

  const join = () => {
    instance
      .joinLiveRoom(uuid, liveId)
      .then(() => {
        res.json(
          resWrap(200, 'ok', {
            status: instance.getStatus()
          })
        )
        log.success(uuid, '进入房间成功！', instance.getStatus().roomInfo.title)
      })
      .catch((reason: Error) => {
        res.json(
          resWrap(10001, '进入房间失败！' + reason.message, {
            status: instance.getStatus()
          })
        )
        log.error(uuid, '进入房间失败！', reason)
      })
  }

  // 实例未就绪时，直接执行 reset 方法重置实例，待重置完成后再执行后续操作
  if (!instance.cclinkjs.isReady()) {
    instance
      .reset()
      .then(() => join())
      .catch((reason: Error) => {
        res.json(
          resWrap(10004, '进入房间失败，等待实例就绪错误！' + reason.message, {
            status: instance.getStatus()
          })
        )
      })
  } else {
    join()
  }
})

apiRouter.post('/reset', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const instance = CCLinkJSManager.getCCLinkJSInstance(uuid) || CCLinkJSManager.createCCLinkJS(uuid)

  instance
    .reset()
    .then(() => {
      res.json(
        resWrap(200, 'ok', {
          instatus: instance.getStatus()
        })
      )
    })
    .catch((reason: Error) => {
      res.json(
        resWrap(30001, '重置失败！' + reason.message, {
          status: instance.getStatus()
        })
      )
    })
})

apiRouter.post('/control', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const method = req.body.method as string

  switch (method) {
    case 'sendMockDataToChatMessage':
      send(
        {
          type: 'PLUGIN_MESSAGE',
          data: getRandomChatMessage()
        },
        PluginNames.PLUGIN_CHAT_MESSAGE,
        uuid
      )
      break
    case 'sendMockDataToTicket':
      send(
        {
          type: 'PLUGIN_MESSAGE',
          data: getRandomTicket()
        },
        PluginNames.PLUGIN_TICKET,
        uuid
      )
      break
    case 'sendMockDataToPaid':
      send(
        {
          type: 'PLUGIN_MESSAGE',
          data: getRandomPaid()
        },
        PluginNames.PLUGIN_PAID,
        uuid
      )
      break
    case 'clearChatMessage':
      send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.CLEAR } }, PluginNames.PLUGIN_CHAT_MESSAGE, uuid)
      break
    case 'clearTicket':
      send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.CLEAR } }, PluginNames.PLUGIN_TICKET, uuid)
      break
    case 'clearPaid':
      send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.CLEAR } }, PluginNames.PLUGIN_PAID, uuid)
      break
    case 'refreshChatMessage':
      send(
        { type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_PAGE } },
        PluginNames.PLUGIN_CHAT_MESSAGE,
        uuid
      )
      break
    case 'refreshTicket':
      send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_PAGE } }, PluginNames.PLUGIN_TICKET, uuid)
      break
    case 'refreshPaid':
      send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_PAGE } }, PluginNames.PLUGIN_PAID, uuid)
      break
  }

  res.json(
    resWrap(200, 'ok', {
      uuid,
      method
    })
  )
})

export default apiRouter
