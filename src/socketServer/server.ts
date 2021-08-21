import { Server } from 'http'
import WebSocket from 'websocket'
import consola from 'consola'

const socketServerLog = consola.withTag('socketServer')

let socketServer: WebSocket.server | null = null

const sendToProtocol = (
  data: WebSocket.IStringified,
  protocol?: 'gift-capsule' | 'chat-message' | 'gift-card' | string
): void => {
  if (socketServer) {
    if (!protocol) {
      socketServer.broadcastUTF(data)
    } else {
      socketServer.connections.forEach((connection) => {
        if (connection.protocol === protocol) {
          connection.sendUTF(data)
        }
      })
    }
  }
}

const wrap = <T>(wrapData: { code?: number; type: string; data: T }): { code: number; type: string; data: T } => {
  return {
    code: wrapData.code || 0,
    type: wrapData.type,
    data: wrapData.data,
  }
}

export default function initSocketServer(httpServer: Server): WebSocket.server {
  const wsServer = new WebSocket.server({
    httpServer,
    autoAcceptConnections: true,
  })

  socketServer = wsServer

  return wsServer
}

export { socketServer, wrap, sendToProtocol }
