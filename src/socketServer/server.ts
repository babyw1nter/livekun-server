import { Server } from 'http'
import WebSocket from 'websocket'
import consola from 'consola'

const log = consola.withTag('socketServer')

let socketServer: WebSocket.server | null = null

const sendToProtocol = (
  data: WebSocket.IStringified,
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
      socketServer.broadcastUTF(data)
    } else {
      socketServer.connections.forEach((connection) => {
        if (connection.protocol === p) {
          connection.sendUTF(data)
        }
      })
    }
  }
}

const wrap = <T>(wrapData: {
  code?: number
  type: string
  data: T
}): { code: number; type: string; data: T; timestamp: number } => {
  return {
    code: wrapData.code || 0,
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
      connection.sendUTF(
        JSON.stringify({
          code: 200,
          message: 'ok',
          data: {
            serverVersion: '1.0.0',
          },
          timestamp: Date.now(),
        })
      )
    }
  })

  socketServer = wsServer

  return wsServer
}

export { socketServer, wrap, sendToProtocol }
