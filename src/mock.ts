import { giftData } from './giftLoader'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'

const randomNum = (minNum: number, maxNum: number): number => {
  return parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString(), 10)
}

interface Mock {
  ticketList: Array<{
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

const getRandomTicket = () => {
  return {
    key: uuidv4(),
    ...mockData.ticketList[randomNum(0, mockData.ticketList.length - 1)],
    money: randomNum(1, 100),
  }
}

const getRandomChatMessage = () => {
  return randomNum(0, 5)
    ? { key: uuidv4(), ...mockData.chatMessageList[randomNum(0, mockData.chatMessageList.length - 1)] }
    : getRandomGiftCard()
}

const getRandomGiftCard = () => {
  const gift = giftData.conf[randomNum(0, giftData.conf.length - 1)]

  return {
    key: uuidv4(),
    ...mockData.giftCardList[randomNum(0, mockData.giftCardList.length - 1)],
    giftImage: gift?.gif || gift?.gif4web || gift?.mgif,
    giftIcon: gift?.icon,
  }
}

export { randomNum, getRandomTicket, getRandomChatMessage, getRandomGiftCard, mockData }
