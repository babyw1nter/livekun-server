import {
  Chat,
  ChatListener,
  ChatMethods,
  ChatInterface,
  Client,
  ClientMethods,
  ClientInterface,
  Gift,
  GiftListener,
  GiftMethods,
  GiftInterface,
  Room,
  RoomListener,
  RoomMethods,
  RoomInterface,
  User,
  UserMethods,
  UserInterface,
  HotScoreListener,
} from '@hhui64/cclinkjs-room-module/src/index'

const init = async () => {
  const liveInfoJsonData = await RoomMethods.getLiveRoomInfoByCcId(348449290)

  const roomId = liveInfoJsonData.props.pageProps.roomInfoInitData.live?.room_id
  const channelId = liveInfoJsonData.props.pageProps.roomInfoInitData.live?.channel_id
  const gameType = liveInfoJsonData.props.pageProps.roomInfoInitData.live?.gametype
  
  console.log(roomId, channelId, gameType)
}

init()