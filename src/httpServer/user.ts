import express from 'express'
import CCLinkJSManager from '../cclinkjsManager'
import UserConfigManager, { IUserPluginsConfig } from '../UserConfigManager'
import { socketServer, send } from '../socketServer/server'
import { resWrap } from './server'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PluginNames, PluginActions } from '../api/plugins'

interface IUser {
  uuid: string
  username: string
  password: string
  isBan: boolean
}

interface UserData {
  users: Array<IUser>
}

class UserManager {
  static userData: UserData

  static read(): void {
    try {
      UserManager.userData = JSON.parse(
        readFileSync(path.join(__dirname, '../../', 'data', 'user', 'users.json')).toString()
      )
    } catch (error) {
      UserManager.userData = {
        users: [],
      }
    }
  }

  static login(username: string, password: string): IUser | null {
    UserManager.read()

    const user = UserManager.userData.users.find((u) => u.username === username)

    if (user) {
      if (user.username === username && user.password === password) {
        return user
      }
    }

    return null
  }
}

const userRouter = express.Router()

userRouter.post('/login', (req, res) => {
  const username = req.body.username as string
  const password = req.body.password as string
  const autologin = req.body.autologin as boolean

  if (!username || !password) {
    res.json(resWrap(10002, '参数不正确'))
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
      uuid: user.uuid,
    }

    // 登陆成功时，为其创建 cclinkjs 实例
    const instance = CCLinkJSManager.createCCLinkJS(user.uuid)

    res.json(resWrap(200, '登录成功', req.session.user))
  } else {
    res.json(resWrap(10001, '用户名或密码不正确'))
    return
  }
})

userRouter.post('/autologin', (req, res) => {
  const uuid = req.session.user?.uuid as string

  let instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    instance = CCLinkJSManager.createCCLinkJS(uuid)
  }

  res.json(resWrap(200, 'session 登录成功', req.session.user))
})

userRouter.get('/logout', (req, res) => {
  // const uuid = req.session.user?.uuid as string
  // CCLinkJSManager.destroyCCLinkJSInstance(uuid)

  req.session.destroy(() => null)
  res.json(resWrap(200, '注销成功'))
})

userRouter.get('/getPluginConfig', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string) || ''
  const pluginName = (req.query.pluginName as string)
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i !== '')

  if (uuid !== '' && uuid.length < 64) {
    const userConfig = UserConfigManager.get(uuid)
    const pluginConfig = userConfig.getPluginConfig(pluginName)

    res.json(resWrap(200, 'ok', pluginConfig))
  } else {
    res.json(resWrap(404, 'UUID not found.'))
  }
})

userRouter.post('/setPluginConfig', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const pluginName = req.body.pluginName as PluginNames
  const pluginConfig = req.body.pluginConfig

  const userConfig = UserConfigManager.get(uuid)

  userConfig.setPluginConfig(pluginName, pluginConfig)

  userConfig.save().read()

  // 向正在连接的插件下发更新配置请求
  if (socketServer) {
    send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_CONFIG } }, pluginName, uuid)
  }

  res.json(resWrap(200, 'ok'))
})

userRouter.post('/resetPluginConfig', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const pluginName = req.body.pluginName as PluginNames

  const userConfig = UserConfigManager.get(uuid)

  userConfig.resetPluginConfig(pluginName)

  userConfig.save().read()

  // 向正在连接的插件下发更新配置请求
  if (socketServer) {
    send({ type: 'PLUGIN_ACTION', data: { action: PluginActions.REFRESH_CONFIG } }, pluginName, uuid)
  }

  res.json(resWrap(200, 'ok'))
})

export default userRouter
