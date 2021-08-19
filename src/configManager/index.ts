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
  }
}

const configFilePath = path.join(__dirname, '../../', 'config', 'config.json')

const defaultConfig: IConfig = {
  giftCapsule: {
    level: [1, 200, 500],
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
  },
}

export default class ConfigManager {
  private static _config: IConfig = defaultConfig
  public static readConfig(): void {
    ConfigManager._config = JSON.parse(fs.readFileSync(configFilePath).toString()) as IConfig
  }

  public static saveConfig(): void {
    fs.writeFileSync(configFilePath, JSON.stringify(ConfigManager._config, null, 2))
  }

  public static getConfig(): IConfig {
    return ConfigManager._config
  }

  public static resetConfig(): void {
    ConfigManager._config = defaultConfig
  }

  public static setConfig(config: IConfig): void {
    ConfigManager._config = config
  }
}
