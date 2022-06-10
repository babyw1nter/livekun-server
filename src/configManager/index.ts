import consola from 'consola'
import fs from 'fs'
import path from 'path'

const log = consola.withTag('configmanager')

export interface IConfig {
  giftCapsule: {
    level: Array<number>
    duration: Array<number>
    maximum: number
    minMoney: number
  }
  chatMessage: {
    style: {
      fontSize: number
    }
    show: {
      join: boolean
      follow: boolean
      gift: boolean
    }
  }
  giftCard: {
    level: Array<number>
    minMoney: number
    comment: {
      use: boolean
      prefix: string
      giftMinMoney: number
      giftWhitelist: string
    }
  }
}

const defaultConfig: IConfig = {
  giftCapsule: {
    level: [9, 49, 99],
    duration: [5, 15, 30],
    maximum: 10,
    minMoney: 0.01,
  },
  chatMessage: {
    style: {
      fontSize: 16,
    },
    show: {
      join: false,
      follow: false,
      gift: false,
    },
  },
  giftCard: {
    level: [1, 200, 500],
    minMoney: 0.01,
    comment: {
      use: false,
      prefix: '留言：',
      giftMinMoney: 0.01,
      giftWhitelist: '',
    },
  },
}

class Config implements IConfig {
  uuid: string
  giftCapsule: {
    level: number[]
    duration: number[]
    maximum: number
    minMoney: number
  }
  chatMessage: {
    style: {
      fontSize: number
    }
    show: {
      join: boolean
      follow: boolean
      gift: boolean
    }
  }
  giftCard: {
    level: number[]
    minMoney: number
    comment: {
      use: boolean
      prefix: string
      giftMinMoney: number
      giftWhitelist: string
    }
  }

  constructor(uuid: string) {
    this.uuid = uuid
    this.giftCapsule = defaultConfig.giftCapsule
    this.chatMessage = defaultConfig.chatMessage
    this.giftCard = defaultConfig.giftCard

    try {
      this.read()
    } catch (error) {
      this.reset()
    }
  }

  getFilePath(): string {
    return path.join(__dirname, '../../', 'config', `${this.uuid}.json`)
  }

  read(): this {
    const configData = JSON.parse(fs.readFileSync(this.getFilePath()).toString()) as IConfig
    this.giftCapsule = configData.giftCapsule
    this.chatMessage = configData.chatMessage
    this.giftCard = configData.giftCard
    return this
  }

  save(): this {
    try {
      fs.writeFileSync(this.getFilePath(), JSON.stringify(this, null, 2))
    } catch (error) {
      log.error(error)
    }
    return this
  }

  reset(): this {
    this.giftCapsule = defaultConfig.giftCapsule
    this.chatMessage = defaultConfig.chatMessage
    this.giftCard = defaultConfig.giftCard
    return this
  }

  setGiftCapsule(config: IConfig['giftCapsule']) {
    this.giftCapsule = config
  }

  setChatMessage(config: IConfig['chatMessage']) {
    this.chatMessage = config
  }

  setGiftCard(config: IConfig['giftCard']) {
    this.giftCard = config
  }

  update(config: IConfig): this {
    this.giftCapsule = config.giftCapsule
    this.chatMessage = config.chatMessage
    this.giftCard = config.giftCard
    return this
  }
}

export default class ConfigManager {
  public static get(uuid: string): Config {
    return new Config(uuid)
  }
}
