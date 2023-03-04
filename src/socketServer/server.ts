import { Server } from 'http'
import WebSocket from 'websocket'
import { v4 as uuidv4 } from 'uuid'
import { PluginNames, PluginActions } from '../api/plugins'
import consola from 'consola'

const log = consola.withTag('socketServer')

let socketServer: WebSocket.server | null = null

interface IPluginCommonMessage {
  key: string
  uid: number | string
  avatarUrl: string
  nickname: string
  userInfo?: unknown
  [key: string]: unknown
}

interface IBaseSocketMessageMap {
  /** socket 握手协议 */
  CONNECT_RESPONSE: {
    serverVersion: string
  }
  /** @tudo 登录 */
  LOGIN: {
    [key: string]: unknown
  }
  /** 插件握手协议 */
  PLUGIN_CONNECT: {
    uuid: string
    pluginName: PluginNames
  }
  /** @see PluginActions */
  PLUGIN_ACTION: {
    action: PluginActions
  }
  /** 插件消息 */
  PLUGIN_MESSAGE: IPluginCommonMessage
  UNKNOWN: {
    [key: string]: unknown
  }
}

interface IBaseSocketMessage<K extends keyof IBaseSocketMessageMap> {
  type: K | string
  data: IBaseSocketMessageMap[K]
}

interface IPluginConnection {
  uniqueId: string
  pluginName: string
  uuid: string
  connection: WebSocket.connection
  onError?: (err: Error) => void
  onClose?: (code: number, desc: string) => void
}

const pc: Array<IPluginConnection> = []

const encode = <T>(data: T): Buffer => {
  return Buffer.from(JSON.stringify(data))
}

const decode = (data: Buffer): IBaseSocketMessage<'UNKNOWN'> => {
  try {
    return JSON.parse(data.toString('utf-8'))
  } catch (error) {
    return {
      type: 'UNKNOWN',
      data: {},
    }
  }
}

const addPluginConnection = (pluginName: string, uuid: string, connection: WebSocket.connection) => {
  const uniqueId = uuidv4()
  const autoRemove = () => removePluginConnection(uniqueId)
  connection.on('error', () => autoRemove())
  connection.on('close', () => autoRemove())

  pc.push({
    uniqueId,
    pluginName,
    uuid,
    connection,
  })
}

const removePluginConnection = (uniqueId: string) => {
  const index = pc.findIndex((c) => c.uniqueId === uniqueId)
  if (index) pc.splice(index, 1)
}

const send = <K extends keyof IBaseSocketMessageMap>(
  data: IBaseSocketMessage<K>,
  pluginName?: PluginNames,
  uuid?: string
): void => {
  if (!pc.length) return

  if (!pluginName && !uuid) {
    pc.forEach((c) => c.connection.sendBytes(encode(wrap(data))))
  } else if (pluginName && !uuid) {
    pc.forEach((c) => {
      if (c.pluginName === pluginName) {
        c.connection.sendBytes(encode(wrap(data)))
      }
    })
  } else if (!pluginName && uuid) {
    pc.forEach((c) => {
      if (c.uuid === uuid) {
        c.connection.sendBytes(encode(wrap(data)))
      }
    })
  } else {
    pc.forEach((c) => {
      if (c.pluginName === pluginName && c.uuid === uuid) {
        c.connection.sendBytes(encode(wrap(data)))
      }
    })
  }
}


interface IWrapData<T> {
  type: string
  data: T
  code?: number
  timestamp?: number
}

const wrap = <T>(wrapData: IWrapData<T>): Required<IWrapData<T>> => {
  return {
    ...wrapData,
    code: wrapData.code || 200,
    timestamp: Date.now(),
  }
}

export default function initSocketServer(httpServer: Server): WebSocket.server {
  const wsServer = new WebSocket.server({
    httpServer,
    autoAcceptConnections: true,
  })

  // wsServer.on('request', (request) => {
  //   log.info(request.httpRequest.headers)
  // })

  wsServer.on('connect', (connection) => {
    if (typeof connection.protocol === 'undefined' || connection.protocol === '' || connection.protocol.length > 128) {
      connection.drop(1002)
      return
    }

    connection.sendBytes(
      encode(
        wrap(<IBaseSocketMessage<'CONNECT_RESPONSE'>>{
          type: 'CONNECT_RESPONSE',
          data: {
            serverVersion: '1.0.0',
          },
        })
      )
    )

    connection.on('message', (data) => {
      if (data.type === 'binary') {
        const msg = decode(data.binaryData)
        switch (msg.type) {
          case 'PLUGIN_CONNECT': {
            const pluginConnect = msg as unknown as IBaseSocketMessage<'PLUGIN_CONNECT'>
            addPluginConnection(pluginConnect.data.pluginName, pluginConnect.data.uuid, connection)
            break
          }
          case 'PLUGIN_MESSAGE': {
            break
          }
          default:
          //
        }
      }
    })
  })

  socketServer = wsServer

  return wsServer
}

export { socketServer, encode, decode, wrap, send }
export type { IBaseSocketMessage, IBaseSocketMessageMap, IPluginCommonMessage }
