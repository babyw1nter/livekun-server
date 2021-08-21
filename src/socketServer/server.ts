import http from 'http'
import WebSocket from 'websocket'
import consola from 'consola'

const socketServerLog = consola.withTag('socketServer')

const port = 39073

const httpServer = http.createServer((request, response) => {
  response.writeHead(404)
  response.end()
})
httpServer.listen(port, () => {
  socketServerLog.success(`WebSocket 服务端启动完成！正在监听端口：${port}...`)
})

const wsServer = new WebSocket.server({
  httpServer,
  autoAcceptConnections: true,
})

interface IConnections {
  giftCapsuleConnection: WebSocket.connection[]
  chatMessageConnection: WebSocket.connection[]
  giftCardConnection: WebSocket.connection[]
}

const connections: IConnections = {
  giftCapsuleConnection: [],
  chatMessageConnection: [],
  giftCardConnection: [],
}

const sendToGiftCapsuleConnections = (data: WebSocket.IStringified): void => {
  connections.giftCapsuleConnection.map((value: WebSocket.connection) => value.connected && value.sendUTF(data))
}
const sendToChatMessageConnections = (data: WebSocket.IStringified): void => {
  connections.chatMessageConnection.map((value: WebSocket.connection) => value.connected && value.sendUTF(data))
}
const sendToGiftCardConnections = (data: WebSocket.IStringified): void => {
  connections.giftCardConnection.map((value: WebSocket.connection) => value.connected && value.sendUTF(data))
}

const cleariIvalidConnections = (): void => {
  const _cb = (value: WebSocket.connection, index: number, array: Array<WebSocket.connection>) => {
    !value.connected && array.splice(index, 1)
  }
  connections.giftCapsuleConnection.map(_cb)
  connections.chatMessageConnection.map(_cb)
  connections.giftCardConnection.map(_cb)
}

wsServer.on('connect', (connection) => {
  switch (connection.protocol) {
    case 'gift-capsule':
      connections.giftCapsuleConnection.push(connection)
      break
    case 'chat-message':
      connections.chatMessageConnection.push(connection)
      break
    case 'gift-card':
      connections.giftCardConnection.push(connection)
      break
  }
  connection.on('close', () => {
    cleariIvalidConnections()
  })
  connection.on('error', () => {
    cleariIvalidConnections()
  })
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

export {
  connections,
  wrap,
  cleariIvalidConnections,
  sendToGiftCapsuleConnections,
  sendToChatMessageConnections,
  sendToGiftCardConnections,
}
