import express from 'express'
import path from 'path'
import consola from 'consola'
import { Server } from 'http'
import session from 'express-session'
import userRouter from './user'
import apiRouter from './api'

const log = consola.withTag('httpServer')

const port = 39074

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'hhui64',
    name: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: true,
      httpOnly: true,
    },
  })
)
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.sendStatus(200)
  else next()
})
app.use('/user', userRouter)
app.use('/api', apiRouter)
app.use('/', express.static(path.join(__dirname, '../../', 'web')))

export default function initHttpServer(): Server {
  log.info(`livekun 服务端正在启动中...`)

  return app.listen(port, () => {
    log.success(`livekun 服务端启动完成！正在监听端口：${port}...`)
  })
}
