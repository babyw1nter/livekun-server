import { giftData } from './giftLoader'
import { readFileSync } from 'fs'
import path from 'path'

const randomNum = (minNum: number, maxNum: number): number => {
  return parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString(), 10)
}

interface Mock {
  giftCapsuleList: Array<{
    money: number
    nickname: string
    avatarUrl: string
    uid: number
  }>
  chatMessageList: Array<{
    nickname: string
    avatarUrl: string
    message: string
    uid: number
    messageType: string
    type?: string
    admin?: boolean
    guard?: number
    badgeInfo?: {
      badgename: string
      level: number
    }
  }>
  giftCardList: Array<{
    giftImage?: string
    giftIcon: string
    nickname: string
    avatarUrl: string
    money: number
    giftName: string
    giftCount: number
    message: string
    comment: string
    uid: number
    messageType: string
    type?: string
  }>
}

const mockData = JSON.parse(readFileSync(path.join(__dirname, '../', 'data', 'mock.json')).toString()) as Mock

const getRandomGiftCapsule = () => {
  return {
    ...mockData.giftCapsuleList[randomNum(0, mockData.giftCapsuleList.length - 1)],
    money: randomNum(1, 100),
  }
}

const getRandomChatMessage = () => {
  return randomNum(0, 5)
    ? mockData.chatMessageList[randomNum(0, mockData.chatMessageList.length - 1)]
    : getRandomGiftCard()
}

const getRandomGiftCard = () => {
  const gift = giftData.conf[randomNum(0, giftData.conf.length - 1)]

  return {
    ...mockData.giftCardList[randomNum(0, mockData.giftCardList.length - 1)],
    giftImage: gift?.gif || gift?.gif4web || gift?.mgif,
    giftIcon: gift?.icon,
  }
}

export { randomNum, getRandomGiftCapsule, getRandomChatMessage, getRandomGiftCard, mockData }
