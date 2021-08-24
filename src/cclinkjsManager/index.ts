import { chatMessageModule } from '../modules/chatMessage'
import { giftCapsuleModule } from '../modules/giftCapsule'
import { giftCardModule } from '../modules/giftCard'
import { CCLinkJS, ICCJsonData, ICCRecvJsonData } from '@hhui64/cclinkjs/src'
import { ChatListener, GiftListener, RoomMethods } from '@hhui64/cclinkjs-room-module/src'
import consola from 'consola'
import { ILiveRoomInfoByCcIdResponse } from '@hhui64/cclinkjs-room-module/src/lib/Room/RoomInterface'
import { v4 as uuidv4 } from 'uuid'

const log = consola.withTag('modules/cclinkjsManager')

export interface ICCLinkJSInstance {
  uuid: string
  cclinkjs: CCLinkJS
  status: ICCLinkJSInstanceStatus
}

export interface ICCLinkJSInstanceStatus {
  isJoinRoom: boolean
  roomInfo: {
    liveId: string
    title: string
  }
}

export class CCLinkJSInstance implements ICCLinkJSInstance {
  uuid: string
  cclinkjs: CCLinkJS
  status: ICCLinkJSInstanceStatus

  constructor(uuid?: string) {
    this.uuid = uuid || uuidv4()
    this.cclinkjs = new CCLinkJS()
    this.status = {
      isJoinRoom: false,
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
          giftCapsuleModule(giftMsg, this)
        })
      )
      .on(
        GiftListener.EventName(),
        GiftListener.EventListener((giftMsg) => {
          giftCardModule(giftMsg, this)
        })
      )
      .connect()
    // .on(
    //   RoomListener.EventName(),
    //   RoomListener.EventListener((userJoinRoomMsg) => {
    //     cclinkjsLog.info('[🏡] ', userJoinRoomMsg.name, ' 进入了直播间')

    //     if (!ConfigManager.getConfig().chatMessage.show.join) return
    //     sendToProtocol(
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
      isJoinRoom: false,
      roomInfo: {
        liveId: '',
        title: '',
      },
    })
  }
}

export default class CCLinkJSManager {
  public static cclinkjsInstances: Array<CCLinkJSInstance> = []

  public static createCCLinkJS(uuid?: string): CCLinkJSInstance {
    const cclinkjsInstances = new CCLinkJSInstance(uuid)
    CCLinkJSManager.cclinkjsInstances.push(cclinkjsInstances)

    return cclinkjsInstances
  }

  public static getCCLinkJSInstance(uuid: string): CCLinkJSInstance | undefined {
    return CCLinkJSManager.cclinkjsInstances.find((i) => i.uuid === uuid)
  }

  public static destroyInstance(uuid: string): boolean {
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

  public static send(uuid: string, data: ICCJsonData, timeout?: number): Promise<ICCRecvJsonData> {
    const instance = CCLinkJSManager.getCCLinkJSInstance(uuid) as CCLinkJSInstance

    if (!instance.cclinkjs.socket.connection || !instance.cclinkjs.socket.connection.connected) {
      instance.cclinkjs.connect()
    }

    return instance.cclinkjs.send(data, timeout)
  }

  public static joinLiveRoom(
    uuid: string,
    liveId: string
  ): Promise<{ liveRoomInfo: ILiveRoomInfoByCcIdResponse; recvJsonData: ICCRecvJsonData }> {
    return new Promise(async (resolve, reject) => {
      const instance = CCLinkJSManager.getCCLinkJSInstance(uuid) as CCLinkJSInstance

      if (!instance.cclinkjs.ready) {
        reject(new Error(`${uuid} 连接未就绪，请稍后再试！`))
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
          reject(new Error(`${uuid} 获取房间信息失败！`))
          return
        }

        instance.cclinkjs
          .send(RoomMethods.joinLiveRoomProtocol(roomId, channelId, gameType), 3000)
          .then((res) => {
            instance.setStatus({
              isJoinRoom: true,
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
            instance.resetStatus()
            reject(reason)
          })
      } catch (error: unknown) {
        instance.resetStatus()
        reject(error)
      }
    })
  }
}
