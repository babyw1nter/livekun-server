/**
 * 插件注册名称
 */
enum PluginNames {
  PLUGIN_CHAT_MESSAGE = 'chat-message',
  PLUGIN_TICKET = 'ticket',
  PLUGIN_PAID = 'paid',
}

/**
 * 插件动作 actions
 *
 * 用户在插件配置页面向 obs 插件操作的 action 常量值
 */
enum PluginActions {
  /** 刷新页面 */
  REFRESH_PAGE = 'refresh',
  /** 刷新插件配置 */
  REFRESH_CONFIG = 'get-config',
  /** 清除插件内容 */
  CLEAR = 'clear',
}

interface IPluginConfig<K extends keyof IPluginConfigMap> {
  /** 插件名称 */
  pluginName: PluginNames | string
  /** 插件配置 */
  pluginConfig: IPluginConfigMap[K]
  /** 当前是否为默认配置 */
  isDefault?: boolean
}

type PluginsConfig = Array<IPluginConfig<'ticket'> | IPluginConfig<'chat-message'> | IPluginConfig<'paid'>>
interface IPluginConfigMap {
  ticket: {
    level: Array<number>
    duration: Array<number>
    maximum: number
    minMoney: number
  }
  'chat-message': {
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

const defaultPluginsConfig: PluginsConfig = [
  {
    pluginName: PluginNames.PLUGIN_TICKET,
    pluginConfig: {
      level: [0, 9, 49, 99, 199, 249, 499],
      duration: [1, 5, 10, 15, 30, 45, 60],
      maximum: 100,
      minMoney: 5,
    },
    isDefault: true,
  },
  {
    pluginName: PluginNames.PLUGIN_CHAT_MESSAGE,
    pluginConfig: {
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
    isDefault: true,
  },
  {
    pluginName: PluginNames.PLUGIN_PAID,
    pluginConfig: {
      level: [0, 9, 49, 99, 199, 249, 499],
      minMoney: 5,
      comment: {
        use: false,
        prefix: '留言：',
        giftMinMoney: 10,
        giftWhitelist: '',
      },
    },
    isDefault: true,
  },
]

export { PluginNames, PluginActions, IPluginConfigMap, IPluginConfig, PluginsConfig, defaultPluginsConfig }
