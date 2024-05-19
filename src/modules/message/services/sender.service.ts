import { SocketMessageEvent } from '@/modules/socket/socket.dto'
import commonUtil from '@/utils/common.util'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { RedisStore } from 'cache-manager-redis-yet'
import { RedisClientType } from 'redis'
@Injectable()
export class SenderService {
  private readonly redisStore: RedisStore
  private static readonly ChunkSize = 1024
  constructor (@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    this.redisStore = this.cacheManager.store as RedisStore
  }

  /**
   * 发布广播
   */
  async publishMessageTopic (message: SocketMessageEvent): Promise<void> {
    const client = await this.getClient()
    const topic = this.generateTopicKey(message.chatId)
    await client.publish(topic, JSON.stringify(message))
  }

  /**
   * 传入的 user sequence 数组，正向排序
   *  然后根据
   * @param userIdxs
   * @returns
   */
  async onlineCheck (userIdxs: number[]): Promise<number[]> {
    if (userIdxs === undefined || userIdxs === null || userIdxs.length <= 0) {
      return []
    }
    const client = await this.getClient()
    // 优先排序，分段截取
    userIdxs.sort((a, b) => a - b)
    const chunkResult = commonUtil.sliceIntoChunks(userIdxs, SenderService.ChunkSize)
    console.log('chunk result', chunkResult)
    const offlineIdxs: number[] = []
    for (let index = 0; index < chunkResult.length; index++) {
      const chunk = chunkResult[index]
      const key = this.generateChunkKey(chunk.min, chunk.max)
      const chunkData = await client.get(key)
      if (chunkData !== null) {
        // const bitsArray = [...chunkData].map((char) => char.charCodeAt(0))
        //   .map((byte) => byte.toString(2).padStart(8, '0'))
        // console.log(bitsArray)

        const buffer = Buffer.from(chunkData) // 转换为 Buffer
        // 计算字节偏移量
        // 计算特定位的偏移量
        chunk.valArr.forEach(seq => {
          const bitIndex = seq
          const byteOffset = Math.floor(bitIndex / 8)
          const bitOffset = bitIndex % 8

          if (byteOffset < buffer.length) {
            const byte = buffer[byteOffset] // 读取目标字节
            const status = (byte >> (7 - bitOffset)) & 1 // 获取目标位
            if (status === 0) {
              offlineIdxs.push(seq)
            }
            console.log('seq ', seq, '状态为', status)
          }
        })
      } else {
        console.log('[不存在]', key)
      }
    }
    return offlineIdxs
  }

  generateChunkKey (min: number, max: number): string {
    return 'USER_SEQUENCE_CHUNK_' + min.toString() + '_' + max.toString()
  }

  /**
   * redis publish topic key
   * @param chatId
   */
  generateTopicKey (chatId: string): string {
    return 'SOCKET_MESSAGE_QUEUE_TOPIC'
  }

  async getClient (): Promise<RedisClientType> {
    const client = this.redisStore.client
    if (!client.isOpen) {
      return await client.connect()
    }
    return client
  }
}
