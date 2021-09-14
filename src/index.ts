import initSocketServer from './socketServer/server'
import initHttpServer from './httpServer/server'

initSocketServer(initHttpServer())
