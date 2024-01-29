import { FastifyInstance } from 'fastify/types/instance'
import { resWrap } from '..'
import axios from 'axios'
import consola from 'consola'
import config from 'config'

const log = consola.withTag('httpserver/voice')

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: {
      id: number | string
      name: number | string
      vcn: string
      spd: number | string
      text: number | string
    }
  }>('/', async (req, res) => {
    const query = {
      id: req.query.id || '1',
      name: req.query.name || Date.now(),
      vcn: req.query.vcn || 'qianranf',
      spd: req.query.spd || 0.83,
      text: req.query.text
    }

    try {
      const fileUrl = (
        await axios.get(<string>config.get('voice.apiUrl'), {
          params: query
        })
      ).data.data.url as string

      const file = Buffer.from(
        (await axios.get(fileUrl, { responseType: 'arraybuffer' })).data,
        'binary'
      )

      res.header('Content-Type', 'audio/mpeg')

      return res.send(file)
    } catch (error) {
      return res.send(resWrap(114514, '获取音频文件失败！'))
    }
  })
}
