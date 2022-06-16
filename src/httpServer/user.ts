import express from 'express'
import CCLinkJSManager from '../cclinkjsManager'
import UserConfigManager, { IUserConfig } from '../configManager'
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
    const instance = CCLinkJSManager.createCCLinkJS(user.uuid)
    const config = UserConfigManager.get(user.uuid)

    res.json(
      resWrap(200, '登录成功', {
        user: req.session.user,
        status: instance.getStatus(),
        config,
      })
    )
  } else {
    res.json(resWrap(10001, '用户名或密码不正确'))
    return
  }
})

userRouter.post('/autologin', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const config = UserConfigManager.get(uuid)
  let instance = CCLinkJSManager.getCCLinkJSInstance(uuid)

  if (!instance) {
    instance = CCLinkJSManager.createCCLinkJS(uuid)
  }

  res.json(
    resWrap(200, 'session 登录成功', {
      user: req.session.user,
      status: instance.getStatus(),
      config,
    })
  )
})

userRouter.get('/logout', (req, res) => {
  // const uuid = req.session.user?.uuid as string
  // CCLinkJSManager.destroyCCLinkJSInstance(uuid)

  req.session.destroy(() => null)
  res.json(resWrap(200, '注销成功'))
})

userRouter.get('/get-config', (req, res) => {
  const uuid = req.session.user?.uuid || (req.query.uuid as string) || ''

  if (uuid !== '' && uuid.length < 64) {
    res.json(resWrap(200, 'ok', UserConfigManager.get(uuid)))
  } else {
    res.json(resWrap(404, 'UUID not found.'))
  }
})

userRouter.post('/update-config', (req, res) => {
  const uuid = req.session.user?.uuid as string
  const newConfig = req.body as IUserConfig

  const config = UserConfigManager.get(uuid)

  config.update(newConfig).save().read()

  if (socketServer) {
    sendToProtocol({ type: 'method', data: { method: 'get-config' } })
    res.json(resWrap(200, 'ok', UserConfigManager.get(uuid)))
  } else {
    res.json(resWrap(20001, 'socket 未初始化'))
  }
})

export default userRouter
