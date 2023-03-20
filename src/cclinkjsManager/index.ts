import { chatMessageModule } from '../modules/chatMessage'
import { ticketModule } from '../modules/ticket'
import { paidModule } from '../modules/paid'
import { CCLinkJS, ICCLinkJSOptions, ICCRecvJsonData } from '@hhui64/cclinkjs'
import { ChatListener, GiftListener, RoomMethods, RoomInterface } from '@hhui64/cclinkjs-room-module'
import { v4 as uuidv4 } from 'uuid'
import consola from 'consola'

const log = consola.withTag('modules/cclinkjsManager')

export interface ICCLinkJSInstance {
  uuid: string
  cclinkjs: CCLinkJS
  status: ICCLinkJSInstanceStatus
}

export interface ICCLinkJSInstanceStatus {
  isJoinedRoom: boolean
  roomInfo: {
    liveId: string
    title: string
  }
}

export class CCLinkJSInstance implements ICCLinkJSInstance {
  uuid: string
  cclinkjs: CCLinkJS
  status: ICCLinkJSInstanceStatus

  constructor(uuid?: string, options?: ICCLinkJSOptions) {
    this.uuid = uuid || uuidv4()
    this.cclinkjs = new CCLinkJS(options)
    this.status = {
      isJoinedRoom: false,
      roomInfo: {
        liveId: '',
        title: '',
      },
    }

    // 添加 socket event
    this.cclinkjs
      .on('connect', () => {
        log.success(this.uuid, `连接CC服务端成功！`)
      })
      .on('close', (code, desc) => {
        this.resetStatus()
        log.warn(this.uuid, '连接关闭: ', code, desc)
      })
      .on('error', (error) => {
        this.resetStatus()
        log.error(this.uuid, '连接错误: ', error)
      })
      .on('ready', () => {
        log.success(this.uuid, '客户端与服务端握手成功！')
      })

    // 添加事件处理器
    this.cclinkjs
      .on(
        ChatListener.EventName(),
        ChatListener.EventListener((chatMsg) => {
          chatMessageModule(chatMsg, this)
        })
      )
      .on(
        GiftListener.EventName(),
        GiftListener.EventListener((giftMsg) => {
          ticketModule(giftMsg, this)
        })
      )
      .on(
        GiftListener.EventName(),
        GiftListener.EventListener((giftMsg) => {
          paidModule(giftMsg, this)
        })
      )
      .connect()
    // .on(
    //   RoomListener.EventName(),
    //   RoomListener.EventListener((userJoinRoomMsg) => {
    //     cclinkjsLog.info('[🏡] ', userJoinRoomMsg.name, ' 进入了直播间')

    //     if (!UserConfigManager.getConfig().chatMessage.show.join) return
    //     send(
    //       JSON.stringify(
    //         wrap({
    //           type: 'data',
    //           data: {
    //             avatarUrl: '',
    //             nickname: userJoinRoomMsg.name,
    //             message: '进入了直播间',
    //             uid: userJoinRoomMsg.uid,
    //           },
    //         })
    //       ),
    //       'chat-message'
    //     )
    //   })
    // )
    // .on(
    //   HotScoreListener.EventName(),
    //   HotScoreListener.EventListener((hotScoreData) => {
    //     // cclinkjsLog.log('[🔥] ', `热度：${hotScoreData.hot_score} 观众：${hotScoreData.usercount}`)
    //   })
    // )
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
        title: '',
      },
    })
  }

  public reset(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cclinkjs.close()

      setTimeout(() => this.cclinkjs.connect(), 500)
      const timeout = setTimeout(() => reject(new Error('reset timeout')), 10000)

      this.cclinkjs.once('ready', () => {
        if (timeout) {
          clearTimeout(timeout)
          resolve()
        }
      })
    })
  }

  public joinLiveRoom(
    uuid: string,
    liveId: string
  ): Promise<{ liveRoomInfo: RoomInterface.ILiveRoomInfoByCcIdResponse; recvJsonData: ICCRecvJsonData }> {
    return new Promise(async (resolve, reject) => {
      if (!this.cclinkjs.isReady()) {
        reject(new Error(`连接未就绪，请稍后再试！`))
        return
      }

      if (!uuid || !liveId) {
        reject(new ReferenceError('uuid 或 liveId 不可为空！'))
        return
      }

      try {
        const liveRoomInfo = await RoomMethods.getLiveRoomInfoByCcId(liveId)
        const roomId = liveRoomInfo.props.pageProps.roomInfoInitData.live?.room_id
        const channelId = liveRoomInfo.props.pageProps.roomInfoInitData.live?.channel_id
        const gameType = liveRoomInfo.props.pageProps.roomInfoInitData.live?.gametype
        const title = liveRoomInfo.props.pageProps.roomInfoInitData.live?.title

        if (!roomId || !channelId || !gameType) {
          reject(new Error(`获取房间信息失败！`))
          return
        }

        this.cclinkjs
          .send(RoomMethods.joinLiveRoomProtocol(roomId, channelId, gameType), 3000)
          .then((res) => {
            this.setStatus({
              isJoinedRoom: true,
              roomInfo: {
                liveId,
                title: title || ' 无标题',
              },
            })

            resolve({
              liveRoomInfo: liveRoomInfo,
              recvJsonData: res,
            })
          })
          .catch((reason: Error) => {
            this.resetStatus()
            reject(reason)
          })
      } catch (error: unknown) {
        this.resetStatus()
        reject(error)
      }
    })
  }
}

export default class CCLinkJSManager {
  public static cclinkjsInstances: Array<CCLinkJSInstance> = []

  public static createCCLinkJS(uuid: string, options?: ICCLinkJSOptions): CCLinkJSInstance {
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
      CCLinkJSManager.cclinkjsInstances[instanceIndex].cclinkjs.close()
      CCLinkJSManager.cclinkjsInstances.splice(instanceIndex, 1)
    }

    return instanceIndex > -1
  }

  private static _getCCLinkJSInstanceIndex(uuid: string): number {
    return CCLinkJSManager.cclinkjsInstances.findIndex((i) => i.uuid === uuid)
  }
}
