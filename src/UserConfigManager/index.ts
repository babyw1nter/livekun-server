import consola from 'consola'
import fs from 'node:fs'
import path from 'node:path'

const log = consola.withTag('configmanager')

export interface IUserConfig {
  uuid: string
  ticket: {
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
    blacklist: Array<{
      ccid: number | string
      note: string
    }>
  }
  paid: {
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

const defaultUserConfig: Omit<IUserConfig, 'uuid'> = {
  ticket: {
    level: [0, 99, 199],
    duration: [5, 15, 30],
    maximum: 100,
    minMoney: 0.01,
  },
  chatMessage: {
    style: {
      fontSize: 18,
    },
    show: {
      join: false,
      follow: false,
      gift: true,
    },
    blacklist: [],
  },
  paid: {
    level: [0, 9, 49, 99, 199, 249, 499],
    minMoney: 5,
    comment: {
      use: false,
      prefix: '留言：',
      giftMinMoney: 10,
      giftWhitelist: '',
    },
  },
}

class UserConfig implements IUserConfig {
  uuid: string
  ticket: {
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
    blacklist: Array<{
      ccid: number | string
      note: string
    }>
  }
  paid: {
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
    this.ticket = defaultUserConfig.ticket
    this.chatMessage = defaultUserConfig.chatMessage
    this.paid = defaultUserConfig.paid

    try {
      this.read()
    } catch (error) {
      this.reset()
    }
  }

  getFilePath(): string {
    return path.join(__dirname, '../../', 'data', 'user', 'configs', `${this.uuid}.json`)
  }

  read(): this {
    const configData = JSON.parse(fs.readFileSync(this.getFilePath()).toString()) as IUserConfig
    this.ticket = configData.ticket
    this.chatMessage = configData.chatMessage
    this.paid = configData.paid
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
    this.ticket = defaultUserConfig.ticket
    this.chatMessage = defaultUserConfig.chatMessage
    this.paid = defaultUserConfig.paid
    return this
  }

  setTicket(config: IUserConfig['ticket']) {
    this.ticket = config
  }

  setChatMessage(config: IUserConfig['chatMessage']) {
    this.chatMessage = config
  }

  setPaid(config: IUserConfig['paid']) {
    this.paid = config
  }

  update(config: IUserConfig): this {
    this.ticket = config.ticket
    this.chatMessage = config.chatMessage
    this.paid = config.paid
    return this
  }
}

export default class UserConfigManager {
  public static get(uuid: string): UserConfig {
    return new UserConfig(uuid)
  }
}
