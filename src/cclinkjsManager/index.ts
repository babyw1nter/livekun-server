import { chatMessageModule } from '../modules/chatMessage'
import { giftCapsuleModule } from '../modules/giftCapsule'
import { giftCardModule } from '../modules/giftCard'
import { CCLinkJS, ICCJsonData, ICCRecvJsonData } from '@hhui64/cclinkjs/src'
import { ClientMethods, ChatListener, GiftListener, RoomMethods } from '@hhui64/cclinkjs-room-module/src'
import StatusManager from '../statusManager'
import consola from 'consola'
import { ILiveRoomInfoByCcIdResponse } from '../../../cclinkjs-room-module/src/lib/Room/RoomInterface'

const log = consola.withTag('modules/cclinkjsManager')

export interface ICCLinkJSInstance {
  uuid: string
  cclinkjs: CCLinkJS
  status: {
    isReady: boolean
  }
}

export default class CCLinkJSManager {
  public static cclinkjsInstances: Array<ICCLinkJSInstance> = []

  public static createCCLinkJS(uuid: string): void {
    const cclinkjs = new CCLinkJS()

    cclinkjs
      .on('connect', () => {
        log.success(uuid, `连接CC服务端成功！`)

        if (CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)])
          CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)].status.isReady = false

        setTimeout(async () => {
          log.info(uuid, `发送客户端握手信息...`)
          cclinkjs
            .send(ClientMethods.clientInfoProtocol(), 3000)
            .then(() => {
              if (CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)])
                CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)].status.isReady = true

              log.success(uuid, `客户端服务端与握手成功！`)
            })
            .catch((reason: Error) => {
              if (CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)])
                CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)].status.isReady =
                  false

              log.error(uuid, `客户端与服务端握手失败，请重试！`, reason)
            })
        }, 1000)
      })
      .on('close', (code, desc) => {
        if (CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)])
          CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)].status.isReady = false
        log.warn(uuid, '连接关闭: ', code, desc)
      })
      .on('error', (error) => {
        if (CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)])
          CCLinkJSManager.cclinkjsInstances[CCLinkJSManager._getCCLinkJSInstanceIndex(uuid)].status.isReady = false
        log.error(uuid, '连接错误: ', error)
      })

    // 挂载事件处理器
    cclinkjs
      .on(ChatListener.EventName(), ChatListener.EventListener(chatMessageModule))
      .on(GiftListener.EventName(), GiftListener.EventListener(giftCapsuleModule))
      .on(GiftListener.EventName(), GiftListener.EventListener(giftCardModule))
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

    cclinkjs.connect()

    CCLinkJSManager.cclinkjsInstances.push({
      uuid,
      cclinkjs,
      status: {
        isReady: false,
      },
    })
  }

  public static getCCLinkJSInstance(uuid: string): ICCLinkJSInstance | undefined {
    return CCLinkJSManager.cclinkjsInstances.find((i) => i.uuid === uuid)
  }

  public static destroyInstance(uuid: string): boolean {
    const instanceIndex = CCLinkJSManager.cclinkjsInstances.findIndex((i) => i.uuid === uuid)

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
    const instance = CCLinkJSManager.cclinkjsInstances.find((i) => i.uuid === uuid) as ICCLinkJSInstance

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
      if (!uuid || !liveId) {
        reject(new ReferenceError('uuid 或 liveId 不可为空！'))
        return
      }

      const instance = CCLinkJSManager.cclinkjsInstances.find((i) => i.uuid === uuid) as ICCLinkJSInstance

      if (!instance.cclinkjs.socket.connection || !instance.cclinkjs.socket.connection.connected) {
        reject(new Error(`${uuid} 连接未就绪！`))
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
            resolve({
              liveRoomInfo: liveRoomInfo,
              recvJsonData: res,
            })
          })
          .catch((reason: Error) => {
            reject(reason)
          })
      } catch (error: unknown) {
        reject(error)
      }
    })
  }
}
