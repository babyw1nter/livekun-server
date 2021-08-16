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
      connections.giftCapsuleConnection?.on('close', (reasonCode, description) => {
        connections.giftCapsuleConnection = null
      })
      break
    case 'chat-message':
      connections.chatMessageConnection = connection
      connections.chatMessageConnection?.on('close', (reasonCode, description) => {
        connections.chatMessageConnection = null
      })
      break
    case 'gift-card':
      connections.giftCardConnection = connection
      connections.giftCardConnection?.on('close', (reasonCode, description) => {
        connections.giftCardConnection = null
      })
      break
  }
})

const wrap = <T>(type: string, data: T): { type: string; data: T } => {
  return {
    type,
    data,
  }
}

export { connections, wrap }
