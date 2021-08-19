interface IEmts {
  id: string
  tag: string
  text: string
  real: string
  pic: string
  seeStr: string
  hide: number
}
interface IEmtsData {
  [propName: string]: IEmts
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emtsData = require('../../data/emts.json') as IEmtsData

export default class EmtsLoader {
  getEmts(real: string): IEmts {
    return emtsData[real]
  }
}
