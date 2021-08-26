import { user } from '../mock'
import express from 'express'
import session from 'express-session'
import CCLinkJSManager from '../cclinkjsManager'

const userRouter = express.Router()

userRouter.post('/login', (req, res) => {
  const username = req.body.username as string
  const password = req.body.password as string
  const autologin = req.body.autologin as boolean

  if (!username || !password) {
    res.send({
      code: 10002,
      message: '参数不正确',
    })
    return
  }

  const u = user.find((_) => _.username === username)

  if (u && u.username === username && u.password === password) {
    // 设置 session
    if (autologin) {
      req.session.cookie.maxAge = 1296000000
    }
    req.session.user = {
      username: u.username,
      uuid: u.uuid,
    }

    // 登陆成功时，为其创建 cclinkjs 实例
    CCLinkJSManager.createCCLinkJS(u.uuid)

    res.send({
      code: 200,
      message: '登录成功！',
      data: {
        ...req.session.user,
        timestamp: Date.now(),
      },
    })
  } else {
    res.send({
      code: 10001,
      message: '用户名或密码不正确',
    })
    return
  }
})

userRouter.post('/autologin', (req, res) => {
  if (req.session.user) {
    CCLinkJSManager.createCCLinkJS(req.session.user.uuid)

    res.send({
      code: 200,
      message: 'session 登录成功！',
      data: {
        ...req.session.user,
        timestamp: Date.now(),
      },
    })
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
    res.send({
      code: 200,
      message: 'Logout success.',
    })
  } else {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
  }
})

userRouter.get('/test', (req, res) => {
  if (!req.session.user) {
    res.send({
      code: 530,
      message: 'Not logged in.',
    })
  } else {
    console.log(req.session.user)

    res.send({
      code: 200,
      message: 'ok',
    })
  }
})

export default userRouter
