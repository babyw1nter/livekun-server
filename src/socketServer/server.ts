import { Server } from 'http'
import WebSocket from 'websocket'
import { v4 as uuidv4 } from 'uuid'
import consola from 'consola'

const log = consola.withTag('socketServer')

let socketServer: WebSocket.server | null = null

interface IWrapData<T> {
  code?: number
  type: string
  data: T
  timestamp?: number
}

interface IBaseSocketData {
  type: 'LOGIN' | 'PLUGIN' | 'UNKNOWN'
  data: unknown
}

interface LoginResponse extends IBaseSocketData {
  type: 'LOGIN'
  data: {
    pluginName: string
    uuid: string
  }
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

const encode = (data: string): Buffer => {
  return Buffer.from(data)
}

const decode = (data: Buffer): IBaseSocketData => {
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

const send = <T>(
  data: IWrapData<T>,
  pluginName?: 'gift-capsule' | 'chat-message' | 'gift-card' | string,
  uuid?: string
): void => {
  if (!pc.length) return

  if (pluginName === '' && uuid === '') {
    pc.forEach((c) => c.connection.sendBytes(encode(JSON.stringify(wrap(data)))))
  } else if (pluginName !== '' && uuid === '') {
    pc.forEach((c) => {
      if (c.pluginName === pluginName) {
        c.connection.sendBytes(encode(JSON.stringify(wrap(data))))
      }
    })
  } else if (pluginName === '' && uuid !== '') {
    pc.forEach((c) => {
      if (c.uuid === uuid) {
        c.connection.sendBytes(encode(JSON.stringify(wrap(data))))
      }
    })
  } else {
    pc.forEach((c) => {
      if ((c.pluginName === pluginName && c.uuid) === uuid) {
        c.connection.sendBytes(encode(JSON.stringify(wrap(data))))
      }
    })
  }
}

const wrap = <T>(wrapData: IWrapData<T>): Required<IWrapData<T>> => {
  return {
    code: wrapData.code || 200,
    type: wrapData.type,
    data: wrapData.data,
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
    if (connection.protocol === '' || connection.protocol.length > 128) {
      connection.drop(1002)
      return
    }

    connection.sendBytes(
      encode(
        JSON.stringify(
          wrap({
            type: 'connect-response',
            data: {
              serverVersion: '1.0.0',
              protocol: connection.protocol,
            },
          })
        )
      )
    )

    connection.on('message', (data) => {
      if (data.type === 'binary') {
        const msg = decode(data.binaryData)
        switch (msg.type) {
          case 'LOGIN': {
            const lr = msg as LoginResponse
            addPluginConnection(lr.data.pluginName, lr.data.uuid, connection)
            break
          }
          case 'PLUGIN': {
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

export { socketServer, wrap, send }
