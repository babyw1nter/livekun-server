import CCLinkJSManager from '../cclinkjsManager'
import UserConfigManager from '../UserConfigManager'
import { send } from '../socketServer/server'
import { resWrap } from './server'
import { PluginNames, PluginActions, IPluginConfigMap } from '../api/plugins'
import { FastifyInstance } from 'fastify/types/instance'
import { UserManager } from '../UserManager'

export default async function (fastify: FastifyInstance) {
  fastify.post<{
    Body: {
      username: string
      password: string
      autologin: boolean
    }
  }>('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const autologin = req.body.autologin

    if (!username || !password) {
      res.send(resWrap(10002, '参数不正确'))
      return
    }

    const user = UserManager.login(username, password)

    if (user) {
      // 设置 session
      if (autologin) {
        req.session.cookie.maxAge = 1296000000
      }

      req.session.user = {
        username: user.username,
        uuid: user.uuid
      }

      // 登陆成功时，为其创建 cclinkjs 实例
      const instance = CCLinkJSManager.createCCLinkJS(user.uuid)

      res.send(resWrap(200, '登录成功', req.session.user))
    } else {
      res.send(resWrap(10001, '用户名或密码不正确'))
      return
    }
  })

  fastify.post('/autologin', (req, res) => {
    const uuid = req.session.user?.uuid

    let instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

    if (!instance) {
      instance = CCLinkJSManager.createCCLinkJS(uuid)
    }

    res.send(resWrap(200, 'session 登录成功', req.session.user))
  })

  fastify.get('/logout', (req, res) => {
    // const uuid = req.session.user?.uuid
    // CCLinkJSManager.destroyCCLinkJSInstance(uuid)

    req.session.destroy(() => null)
    res.send(resWrap(200, '注销成功'))
  })

  fastify.get<{
    Querystring: {
      uuid: string
      pluginName: string
    }
  }>('/getPluginConfig', (req, res) => {
    const uuid = req.session.user?.uuid || req.query.uuid || ''
    const pluginName = req.query.pluginName
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i !== '')

    if (uuid !== '' && uuid.length < 64) {
      const userConfig = UserConfigManager.get(uuid)
      const pluginConfig = userConfig.getPluginConfig(pluginName)

      res.send(resWrap(200, 'ok', pluginConfig))
    } else {
      res.send(resWrap(404, 'UUID not found.'))
    }
  })

  fastify.post<{
    Body: {
      pluginName: PluginNames
      pluginConfig: IPluginConfigMap[PluginNames]
    }
  }>('/setPluginConfig', (req, res) => {
    const uuid = req.session.user?.uuid

    const pluginName = req.body.pluginName
    const pluginConfig = req.body.pluginConfig

    const userConfig = UserConfigManager.get(uuid)

    userConfig.setPluginConfig(pluginName, pluginConfig)

    userConfig.save().read()

    // 向正在连接的插件下发更新配置请求
    send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_CONFIG } }, pluginName, uuid)

    res.send(resWrap(200, 'ok'))
  })

  fastify.post<{
    Body: {
      pluginName: PluginNames
    }
  }>('/resetPluginConfig', (req, res) => {
    const uuid = req.session.user?.uuid
    const pluginName = req.body.pluginName

    const userConfig = UserConfigManager.get(uuid)

    userConfig.resetPluginConfig(pluginName)

    userConfig.save().read()

    // 向正在连接的插件下发更新配置请求

    send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_CONFIG } }, pluginName, uuid)

    res.send(resWrap(200, 'ok'))
  })
}
