import { Server } from 'http'
import WebSocket from 'websocket'
import consola from 'consola'

const log = consola.withTag('socketServer')

let socketServer: WebSocket.server | null = null

interface IWrapData<T> {
  code?: number
  type: string
  data: T
  timestamp?: number
}

const sendToProtocol = <T>(
  data: IWrapData<T>,
  protocol?: 'gift-capsule' | 'chat-message' | 'gift-card' | string,
  uuid?: string
): void => {
  if (socketServer) {
    let p = ''
    if (uuid) {
      p = (protocol || '') + '-' + (uuid || '')
    } else {
      p = protocol || ''
    }

    if (p === '') {
      socketServer.broadcastBytes(encode(JSON.stringify(wrap(data))))
    } else {
      socketServer.connections.forEach((connection) => {
        if (connection.protocol === p) {
          connection.sendBytes(encode(JSON.stringify(wrap(data))))
        }
      })
    }
  }
}

const encode = (data: string): Buffer => {
  return Buffer.from(data)
}

const decode = (data: Buffer): string => {
  return data.toString('utf-8')
}

const wrap = <T>(wrapData: IWrapData<T>): IWrapData<T> => {
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

  wsServer.on('connect', (connection) => {
    if (connection.protocol === '' || connection.protocol.length > 128) {
      connection.drop(1002)
    } else {
      connection.sendBytes(
        Buffer.from(
          JSON.stringify({
            code: 200,
            type: 'connect-response',
            data: {
              serverVersion: '1.0.0',
              protocol: connection.protocol,
            },
            timestamp: Date.now(),
          })
        )
      )
    }
  })

  socketServer = wsServer

  return wsServer
}

export { socketServer, wrap, sendToProtocol }
