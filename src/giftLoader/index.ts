import { readFileSync } from 'node:fs'
import path, { resolve } from 'node:path'

interface IGiftData {
  gametype_category_gifts: {
    [propName: string]: Array<{
      allow_add_anchor_gift: number
      saleids: Array<number>
      category_id: string
      category_name: string
    }>
  }
  version: number
  gametype_gifts: {
    [propName: string]: Array<number>
  }
  conf: Array<IGift>
}

interface IGift {
  facenum: Array<number>
  mweight: number
  price_unit: number
  prop_list: Array<unknown>
  isVideo: number
  pc_tag: number
  tag: number
  actionid: number
  mdesc: string
  gif: string
  gift_category: number
  subcid_disallow: Array<number>
  subcid_allow: Array<unknown>
  platform: Array<number>
  playback: number
  template: number
  topcid_disallow: Array<unknown>
  desc: string
  type: number
  hypertext: string
  meffect_mp4: string
  find_treasure_black: number
  meffect: Array<unknown>
  pic: string
  big_effect_show: number
  max: number
  price: number
  isshow: number
  xpic_mob_tag: string
  moment: Array<unknown>
  saleid: number
  moptions: Array<{
    [propName: string]: string
  }>
  apng4web: string
  svga: string
  treat_type: number
  icon: string
  paidonly: number
  goldingot_bag: number
  remark: string
  videoNum: number
  name: string
  gametypes: Array<number>
  godtreasure_black: number
  love_journey_black: number
  topcid_allow: Array<number>
  options: Array<number>
  timelimit: number
  goldingot: number
  web_url: string
  xpic1: string
  gift_enable_gametype: Array<number>
  exp: number
  xpic2: string
  fish_black: number
  onlyone: number
  order: number
  game_facenum: Array<unknown>
  mgif?: string
  photoFrame?: string
  gif4web?: string
}

export const giftData: IGiftData = readFileSync(path.join(resolve(), 'data', 'gamegift.json')) as unknown as IGiftData

export default class GiftLoader {
  public static getGiftBySaleId(saleId: number): IGift | undefined {
    return giftData.conf.find((item) => item.saleid === saleId)
  }
}
