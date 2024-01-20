import config from 'config'
import Fastify from 'fastify'
import FastifyMiddie from '@fastify/middie'
import FastifyCors from '@fastify/cors'
import FastifyCookie from '@fastify/cookie'
import FastifySession from '@fastify/session'
import FastifyWebsocket from '@fastify/websocket'
import RedisStore from 'connect-redis'
import Redis from 'ioredis'
import consola from 'consola'
import userRouter from './routers/user'
import apiRouter from './routers/api'
import addConnection from '../socketServer'

const log = consola.withTag('httpServer')

const redisStore = new RedisStore({
  client: new Redis(
    `redis://${config.get('redis.username')}:${config.get(
      'redis.password'
    )}@${config.get('redis.host')}:${config.get('redis.port')}`
  )
})

const app = Fastify({ logger: false })
app.register(FastifyMiddie)
app.register(FastifyCors, {
  origin: true,
  credentials: true
})
app.register(FastifyCookie)
app.register(FastifySession, {
  store: redisStore,
  cookieName: 'LK_USER_TOKEN',
  secret: 'z1MUVltq9tcC5B#kcaYy=n7yhcxIiYg_',
  cookie: {
    ...config.get('session.cookie')
  }
})
app.register(FastifyWebsocket)
app.register(async (fastify) => {
  fastify.get('/', { websocket: true }, addConnection)
})
app.addHook('onRequest', (request, reply, done) => {
  // 需要鉴权的接口列表
  const requiresAuth = [
    '/user/autologin',
    '/user/logout',
    '/user/getStatus',
    '/user/setPluginConfig',
    '/api/join',
    '/api/reset',
    '/api/control',
    '/api/getStatus'
  ]

  if (requiresAuth.includes(request.routeConfig.url)) {
    if (!request.session.user) {
      return reply.send(resWrap(530, 'Not logged in.'))
    }
  }

  done()
})
app.register(userRouter, { prefix: '/user' })
app.register(apiRouter, { prefix: '/api' })

export const resWrap = <T>(
  code?: number,
  message?: string,
  data?: T
): { code: number; message: string; data?: T; _t: number } => {
  return {
    code: code || 200,
    message: message || 'ok',
    data,
    _t: Date.now()
  }
}

export default function initHttpServer() {
  log.info(`livekun 服务端正在启动中...`)

  const port = <number>config.get('server.port')

  return app.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      log.error(err)
      process.exit(1)
    }

    log.success(`livekun 服务端启动完成！正在监听端口：${port}...`)
  })
}
