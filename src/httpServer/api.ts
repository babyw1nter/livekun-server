import { send } from '../socketServer/server'
import consola from 'consola'
import CCLinkJSManager from '../cclinkjsManager'
import { resWrap } from './server'
import { readFileSync } from 'node:fs'
import path, { resolve } from 'node:path'
import { getRandomTicket, getRandomChatMessage, getRandomPaid, mockData } from '../mock'
import { PluginNames, PluginActions } from '../api/plugins'
import { FastifyInstance } from 'fastify/types/instance'

const log = consola.withTag('httpserver/api')

export default async function (fastify: FastifyInstance) {
  fastify.get('/getBroadcasts', (request, reply) => {
    interface Broadcasts {
      banner: string
      broadcastsToptips: string
      broadcasts: Array<string>
    }

    try {
      const broadcasts = JSON.parse(
        readFileSync(path.join(resolve(), '/data/broadcasts.json')).toString()
      ) as Broadcasts

      reply.send(
        resWrap(200, 'ok', {
          banner: broadcasts.banner,
          broadcastsToptips: broadcasts.broadcastsToptips,
          broadcasts: broadcasts.broadcasts
        })
      )
    } catch (error: unknown) {
      reply.send(resWrap(20001, '获取公告失败！'))
    }
  })

  fastify.get('/getMockdata', (request, reply) => {
    reply.send(
      resWrap(200, 'ok', {
        ticketMockData: mockData.ticketList,
        chatMessageMockData: mockData.chatMessageList,
        paidMockData: mockData.paidList
      })
    )
  })

  fastify.get<{
    Querystring: {
      uuid: string
    }
  }>('/getStatus', (request, reply) => {
    const uuid = request.session.user?.uuid || request.query.uuid
    const instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

    // 这里因为是公开接口，UUID 并不确定存在 session 中
    // 所以当实例不存在时直接返回错误消息就可以了
    if (uuid !== '' && instance) {
      reply.send(resWrap(200, 'ok', instance.getStatus()))
    } else {
      reply.send(resWrap(10008, 'Instance not found.'))
    }
  })

  fastify.post<{
    Body: {
      liveId: string
    }
  }>('/join', async (request, reply) => {
    const uuid = request.session.user?.uuid
    const liveId = request.body.liveId.toString()

    if (!liveId) {
      reply.send(resWrap(10003, '未指定直播间ID'))
      return
    }

    const instance = CCLinkJSManager.getCCLinkJSInstance(uuid) || CCLinkJSManager.createCCLinkJS(uuid)

    log.info(uuid, '正在进入房间...', liveId)

    const join = () => {
      instance
        .joinLiveRoom(uuid, liveId)
        .then(() => {
          reply.send(
            resWrap(200, 'ok', {
              status: instance.getStatus()
            })
          )
          log.success(uuid, '进入房间成功！', instance.getStatus().roomInfo.title)
        })
        .catch((reason: Error) => {
          reply.send(
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
          reply.send(
            resWrap(10004, '进入房间失败，等待实例就绪错误！' + reason.message, {
              status: instance.getStatus()
            })
          )
        })
    } else {
      join()
    }
  })

  fastify.post('/reset', (request, reply) => {
    const uuid = request.session.user?.uuid
    const instance = CCLinkJSManager.getCCLinkJSInstance(uuid) || CCLinkJSManager.createCCLinkJS(uuid)

    instance
      .reset()
      .then(() => {
        reply.send(
          resWrap(200, 'ok', {
            instatus: instance.getStatus()
          })
        )
      })
      .catch((reason: Error) => {
        reply.send(
          resWrap(30001, '重置失败！' + reason.message, {
            status: instance.getStatus()
          })
        )
      })
  })

  fastify.post<{
    Body: {
      method: string
    }
  }>('/control', (request, reply) => {
    const uuid = request.session.user?.uuid
    const method = request.body.method

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

    reply.send(
      resWrap(200, 'ok', {
        uuid,
        method
      })
    )
  })
}
