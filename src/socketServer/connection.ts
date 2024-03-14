import { SocketStream } from '@fastify/websocket'
import { RawData, WebSocket } from 'ws'

export class IConnection {
  connection: SocketStream
  socket: WebSocket
  userId: string
  pluginName: string
  subscribedNoticeList: string[]

  constructor(connection: SocketStream) {
    this.connection = connection
    this.socket = connection.socket

    this.socket.on('message', (data) => this.onmessage(data))

    this.userId = ''
    this.pluginName = ''
    this.subscribedNoticeList = []
  }

  onmessage(data: RawData) {}

  onclose() {}

  subscribeNotice(eventName: string | string[]) {}

  unsubscribeNotice(eventName: string | string[]) {}
}
