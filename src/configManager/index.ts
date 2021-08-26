import fs from 'fs'
import path from 'path'

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
    level: [0, 200, 500],
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

export default class ConfigManager {
  private static _config: IConfig = defaultConfig
  public static readConfig(uuid: string): void {
    if (!uuid) return
    const configFilePath = path.join(__dirname, '../../', 'config', `${uuid}.json`)
    try {
      ConfigManager._config = JSON.parse(fs.readFileSync(configFilePath).toString()) as IConfig
    } catch (error) {
      ConfigManager.resetConfig()
      ConfigManager.saveConfig(uuid)
    }
  }

  public static saveConfig(uuid: string): void {
    if (!uuid) return
    const configFilePath = path.join(__dirname, '../../', 'config', `${uuid}.json`)
    fs.writeFileSync(configFilePath, JSON.stringify(ConfigManager._config, null, 2))
  }

  public static getConfig(uuid: string): IConfig {
    ConfigManager.readConfig(uuid)
    return ConfigManager._config
  }

  public static resetConfig(): void {
    ConfigManager._config = defaultConfig
  }

  public static setConfig(config: IConfig): void {
    ConfigManager._config = config
  }
}
