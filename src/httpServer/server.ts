import express from 'express'
import path from 'path'
import consola from 'consola'
import { Server } from 'http'
import redis from 'redis'
import RedisStore from 'connect-redis'
import session from 'express-session'
import userRouter from './user'
import apiRouter from './api'

const log = consola.withTag('httpServer')

const port = 39074

const app = express()
const Store = RedisStore(session)
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    store: new Store({
      client: redisClient,
    }),
    secret: 'hhui64',
    name: 'session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
      httpOnly: true,
    },
  })
)
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept, X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  // res.header('Content-Type', 'application/json; charset=utf-8')
  res.header('X-Powered-By', 'Livekun Server')
  if (req.method === 'OPTIONS') res.sendStatus(200)
  else next()
})
app.use((req, res, next) => {
  // 需要鉴权的接口列表
  const requiresAuth = [
    '/user/autologin',
    '/user/logout',
    '/user/get-status',
    '/user/update-config',
    '/api/join',
    '/api/reset',
    '/api/control',
    '/api/get-status',
  ]

  if (requiresAuth.includes(req.path)) {
    if (!req.session.user) {
      res.json(resWrap(530, 'Not logged in.'))
      return
    }
  }

  next()
})
app.use('/user', userRouter)
app.use('/api', apiRouter)
app.use('/', express.static(path.join(__dirname, '../../', 'web')))

export const resWrap = <T>(
  code?: number,
  message?: string,
  data?: T
): { code: number; message: string; data?: T; timestamp: number } => {
  return {
    code: code || 200,
    message: message || 'ok',
    data,
    timestamp: Date.now(),
  }
}

export default function initHttpServer(): Server {
  log.info(`livekun 服务端正在启动中...`)

  return app.listen(port, () => {
    log.success(`livekun 服务端启动完成！正在监听端口：${port}...`)
  })
}
