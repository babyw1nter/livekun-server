import express from 'express'
import CCLinkJSManager from '../cclinkjsManager'
import ConfigManager, { IConfig } from '../configManager'
import { socketServer, sendToProtocol, wrap } from '../socketServer/server'
import { resWrap } from './server'
import { readFileSync } from 'fs'
import path from 'path'

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
      UserManager.userData = JSON.parse(readFileSync(path.join(__dirname, '../../', 'data', 'users.json')).toString())
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
    CCLinkJSManager.createCCLinkJS(user.uuid)

    res.json(resWrap(200, '登录成功', req.session.user))
  } else {
    res.json(resWrap(10001, '用户名或密码不正确'))
    return
  }
})

userRouter.post('/autologin', (req, res) => {
  CCLinkJSManager.createCCLinkJS(req.session.user?.uuid as string)

  res.json(resWrap(200, 'session 登录成功', req.session.user))
})

userRouter.get('/logout', (req, res) => {
  CCLinkJSManager.destroyCCLinkJSInstance(req.session.user?.uuid as string)

  req.session.destroy(() => null)
  res.json(resWrap(200, '注销成功'))
})

userRouter.get('/get-config', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string) || ''

  if (uuid !== '' && uuid.length < 64) {
    res.json(resWrap(200, 'ok', ConfigManager.get(uuid)))
  } else {
    res.json(resWrap(404, 'UUID not found.'))
  }
})

userRouter.post('/update-config', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const newConfig = req.body as IConfig

  const config = ConfigManager.get(uuid)

  config.update(newConfig).save().read()

  if (socketServer) {
    sendToProtocol(JSON.stringify(wrap({ type: 'method', data: { method: 'get-config' } })))
    res.json(resWrap(200, 'ok', ConfigManager.get(uuid)))
  } else {
    res.json(resWrap(20001, 'socket 未初始化'))
  }
})

export default userRouter
