import initSocketServer from './socketServer/server'
import initHttpServer from './httpServer/server'
import ConfigManager from './configManager'

ConfigManager.readConfig()

initSocketServer()
initHttpServer()
