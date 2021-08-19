import http from 'http'
import WebSocket from 'websocket'

const port = 39073

const httpServer = http.createServer((request, response) => {
  response.writeHead(404)
  response.end()
})
httpServer.listen(port, () => {
  console.info(`[socketServer] WebSocket 服务端启动完成！正在监听端口：${port}...`)
})

const wsServer = new WebSocket.server({
  httpServer,
  autoAcceptConnections: true,
})

interface IConnections {
  giftCapsuleConnection: WebSocket.connection | null
  chatMessageConnection: WebSocket.connection | null
  giftCardConnection: WebSocket.connection | null
}

const connections: IConnections = {
  giftCapsuleConnection: null,
  chatMessageConnection: null,
  giftCardConnection: null,
}

wsServer.on('connect', (connection) => {
  switch (connection.protocol) {
    case 'gift-capsule':
      connections.giftCapsuleConnection = connection
      connection.on('close', () => (connections.giftCapsuleConnection = null))
      connection.on('error', () => (connections.giftCapsuleConnection = null))
      break
    case 'chat-message':
      connections.chatMessageConnection = connection
      connection.on('close', () => (connections.giftCapsuleConnection = null))
      connection.on('error', () => (connections.giftCapsuleConnection = null))
      break
    case 'gift-card':
      connections.giftCardConnection = connection
      connection.on('close', () => (connections.giftCapsuleConnection = null))
      connection.on('error', () => (connections.giftCapsuleConnection = null))
      break
  }
})

const wrap = <T>(wrapData: { code?: number; type: string; data: T }): { code: number; type: string; data: T } => {
  return {
    code: wrapData.code || 0,
    type: wrapData.type,
    data: wrapData.data,
  }
}

export default async function initSocketServer(): Promise<void> {
  //
}

export { connections, wrap }
