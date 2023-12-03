import { chatMessageModule } from '../plugins/chatMessage'
import { ticketModule } from '../plugins/ticket'
import { paidModule } from '../plugins/paid'
import { CCLink, CCLinkOptions } from '@hhui64/cclinkjs'
import { RoomPlugin, createRoomPlugin } from '@hhui64/cclinkjs/plugin'
import { v4 as uuidv4 } from 'uuid'
import consola from 'consola'

const log = consola.withTag('modules/cclinkjsManager')

export interface ICCLinkJSInstanceStatus {
  isJoinedRoom: boolean
  roomInfo: {
    liveId: string
    title: string
  }
}

export class CCLinkJSInstance extends CCLink {
  uuid: string
  status: ICCLinkJSInstanceStatus
  roomPlugin: RoomPlugin

  constructor(uuid: string, options?: CCLinkOptions) {
    super(options)

    this.uuid = uuid
    this.status = {
      isJoinedRoom: false,
      roomInfo: {
        liveId: '',
        title: ''
      }
    }

    this.roomPlugin = createRoomPlugin()

    this.roomPlugin
      .on('chat', (msg) => chatMessageModule(msg, this))
      .on('gift', (msg) => {
        ticketModule(msg, this)
        paidModule(msg, this)
      })

    this.register(this.roomPlugin)

    // 添加 socket event
    this.on('close', (code, desc) => {
      this.resetStatus()
      log.warn(this.uuid, '连接关闭:', code, desc)
    })
      .on('error', (error) => {
        this.resetStatus()
        log.error(this.uuid, '实例错误:', error)
      })
      .on('ready', () => {
        log.success(this.uuid, '实例初始化成功！')
      })
      .connect()
  }

  public getStatus(): ICCLinkJSInstanceStatus {
    return this.status
  }

  public setStatus(status: ICCLinkJSInstanceStatus): void {
    this.status = status
  }

  public resetStatus(): void {
    this.setStatus({
      isJoinedRoom: false,
      roomInfo: {
        liveId: '',
        title: ''
      }
    })
  }

  public reset(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.close()

      setTimeout(() => this.connect(), 500)
      const timeout = setTimeout(() => reject(new Error('reset timeout')), 10000)

      this.once('ready', () => {
        if (timeout) {
          clearTimeout(timeout)
          resolve()
        }
      })
    })
  }
}

export default class CCLinkJSManager {
  public static cclinkjsInstances: Array<CCLinkJSInstance> = []

  public static createCCLinkJS(uuid: string, options?: CCLinkOptions): CCLinkJSInstance {
    let instance = this.getCCLinkJSInstance(uuid)

    if (instance) {
      return instance
    } else {
      instance = new CCLinkJSInstance(uuid, options)
      CCLinkJSManager.cclinkjsInstances.push(instance)
    }

    return instance
  }

  public static getCCLinkJSInstance(uuid: string): CCLinkJSInstance | undefined {
    return CCLinkJSManager.cclinkjsInstances.find((i) => i.uuid === uuid)
  }

  public static destroyCCLinkJSInstance(uuid: string): boolean {
    const instanceIndex = CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)

    if (instanceIndex > -1) {
      CCLinkJSManager.cclinkjsInstances[instanceIndex].close()
      CCLinkJSManager.cclinkjsInstances.splice(instanceIndex, 1)
    }

    return instanceIndex > -1
  }

  private static _getCCLinkJSInstanceIndex(uuid: string): number {
    return CCLinkJSManager.cclinkjsInstances.findIndex((i) => i.uuid === uuid)
  }
}
