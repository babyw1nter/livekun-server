import { user } from '../mock'
import express from 'express'
import session from 'express-session'
import CCLinkJSManager from '../cclinkjsManager'
import ConfigManager, { IConfig } from '../configManager'
import { socketServer, sendToProtocol, wrap } from '../socketServer/server'

const userRouter = express.Router()

userRouter.post('/login', (req, res) => {
  const username = req.body.username as string
  const password = req.body.password as string
  const autologin = req.body.autologin as boolean

  if (!username || !password) {
    res.json(resWrap(10002, '参数不正确'))
    return
  }

  const u = user.find((_) => _.username === username)

  if (u && u.username === username && u.password === password) {
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
  if (req.session.user) {
    CCLinkJSManager.createCCLinkJS(req.session.user.uuid)

    return
  } else {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
  }
})

userRouter.get('/logout', (req, res) => {
  if (req.session.user) {
    CCLinkJSManager.destroyCCLinkJSInstance(req.session.user.uuid)

    req.session.destroy(() => null)
  } else {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
  }
  res.json(resWrap(200, 'session 登录成功', req.session.user))
})

userRouter.get('/test', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
  } else {
    console.log(req.session.user)

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
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
    return
  }

  const uuid = req.session.user.uuid as string

  ConfigManager.setConfig(req.body as IConfig)
  ConfigManager.saveConfig(uuid)
  ConfigManager.readConfig(uuid)

  if (socketServer) {
    res.json(resWrap(200, 'ok', ConfigManager.get(uuid)))
  } else {
    res.send({
      code: 20001,
      message: 'Socket 服务端未初始化！',
    })
    res.json(resWrap(20001, 'socket 未初始化'))
  }
})

export default userRouter
