import { readFileSync } from 'node:fs'
import path, { resolve } from 'node:path'

export interface IEmts {
  id: string
  tag: string
  text: string
  real: string
  pic: string
  seeStr: string
  hide: number
}

export interface IEmtsData {
  [propName: string]: IEmts
}
const fileData = readFileSync(
  path.join(resolve(), '/data/emts.json')
).toString()
export const emtsData = JSON.parse(fileData) as IEmtsData

const emtsDataArray = Object.values(emtsData)

export default class EmtsLoader {
  public static getEmts(code: string): IEmts | undefined {
    return emtsDataArray.find(
      (e) =>
        e.real === code ||
        e.id + e.text + e.tag === code ||
        e.real === `[emts]${code}[/emts]`
    )
  }

  public static replace(
    str: string,
    replaceValue?: string,
    showEmts?: boolean
  ): string {
    if (typeof showEmts === 'undefined') showEmts = true
    const emtsArray = str.match(/(?<=\[emts\])(.*?)(?=\[\/emts\])/g)

    let s = str
    emtsArray?.forEach((e) => {
      const emts = EmtsLoader.getEmts(e)

      if (emts && showEmts) {
        const regexp = new RegExp(
          `(\\[emts\\])(${emts.id}).*?(\\[\\/emts\\])`,
          'g'
        )
        s = s.replace(regexp, replaceValue || emts.seeStr)
      } else {
        s = s.replace(/(\[emts\]).*?(\[\/emts\])/g, replaceValue || '[表情]')
      }
    })
    return s
  }
}
