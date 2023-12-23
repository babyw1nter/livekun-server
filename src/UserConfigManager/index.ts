import consola from 'consola'
import fs from 'node:fs'
import path, { resolve } from 'node:path'
import {
  defaultPluginsConfig,
  IPluginConfig,
  IPluginConfigMap,
  PluginNames,
  PluginsConfig
} from '../api/plugins'

const log = consola.withTag('configmanager')

export interface IUserPluginsConfig {
  uuid: string
  pluginsConfig: PluginsConfig
}

class UserPluginsConfig implements IUserPluginsConfig {
  uuid: string
  pluginsConfig: PluginsConfig
  readonly defaultPluginsConfig: PluginsConfig

  constructor(uuid: string) {
    this.uuid = uuid
    this.pluginsConfig = []
    this.defaultPluginsConfig = defaultPluginsConfig

    try {
      this.read()
    } catch (error) {
      this.reset()
    }
  }

  getFilePath(): string {
    return path.join(resolve(), 'data', 'user', 'configs', `${this.uuid}.json`)
  }

  read(): this {
    const configData = JSON.parse(
      fs.readFileSync(this.getFilePath()).toString()
    ) as IUserPluginsConfig
    this.pluginsConfig = configData.pluginsConfig
    return this
  }

  save(): this {
    const configData = {
      uuid: this.uuid,
      pluginsConfig: this.pluginsConfig
    }

    configData.pluginsConfig.forEach((i) => {
      if (typeof i.isDefault !== 'undefined') delete i.isDefault
    })

    try {
      fs.writeFileSync(this.getFilePath(), JSON.stringify(configData, null, 2))
    } catch (error) {
      log.error(error)
    }
    return this
  }

  reset(): this {
    this.pluginsConfig = []
    return this
  }

  // getPluginConfig<K extends keyof IPluginConfigMap>(pluginName: K): IPluginConfig<K> | null
  // getPluginConfig<K extends keyof IPluginConfigMap>(pluginName: K[]): PluginsConfig
  getPluginConfig<K extends keyof IPluginConfigMap>(
    pluginName: K | K[] | string | string[]
  ) {
    if (Array.isArray(pluginName)) {
      const _user = this.pluginsConfig.filter((item) =>
        pluginName.some((i) => item.pluginName === i)
      )

      // 如果在用户配置文件中没找到，则从默认配置中获取
      // 默认配置文件带有 `isDefault: true` 用以区分配置的来源
      const notFindPluginName = pluginName.filter(
        (i) => _user.findIndex((j) => j.pluginName === i) < 0
      )
      const _default = this.defaultPluginsConfig
        .filter((item) => notFindPluginName.some((i) => item.pluginName === i))
        .map((i) => ({ ...i, isDefault: true }))

      return _user.concat(_default)
    } else {
      return (
        this.pluginsConfig.find((i) => i.pluginName === pluginName) ||
        this.defaultPluginsConfig.find((i) => i.pluginName === pluginName) ||
        null
      )
    }
  }

  setPluginConfig<K extends keyof IPluginConfigMap>(
    pluginName: K | string,
    pluginConfig: IPluginConfigMap[K]
  ) {
    const getIndex = () =>
      this.pluginsConfig.findIndex((i) => i.pluginName === pluginName)
    const index = getIndex()

    if (index > -1) {
      this.pluginsConfig[index].pluginConfig = pluginConfig
    } else {
      const defaultPluginConfig = this.defaultPluginsConfig.find(
        (i) => i.pluginName === pluginName
      )
      if (defaultPluginConfig) {
        this.pluginsConfig.push(JSON.parse(JSON.stringify(defaultPluginConfig)))
        this.pluginsConfig[getIndex()].pluginConfig = pluginConfig
      }
    }
  }

  resetPluginConfig<K extends keyof IPluginConfigMap>(pluginName: K | string) {
    const index = this.pluginsConfig.findIndex(
      (i) => i.pluginName === pluginName
    )

    if (index > -1) {
      // 直接删除就好
      this.pluginsConfig.splice(index, 1)
    }
  }
}

export default class UserConfigManager {
  public static get(uuid: string): UserPluginsConfig {
    return new UserPluginsConfig(uuid)
  }
}
