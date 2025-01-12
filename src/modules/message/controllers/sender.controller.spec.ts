import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { SystemService } from '@/modules/common/services/system.service'
import { SenderService } from '../services/sender.service'

describe('sender service test', () => {
  let app: NestExpressApplication

  let senderService: SenderService

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    await app.init()
    const systemService = app.get<SystemService>(SystemService)
    const sysPubKeyResponse = systemService.getPubKey()
    if (sysPubKeyResponse === '' || sysPubKeyResponse === undefined) {
      throw new Error('pubKey is empty')
    }
    senderService = app.get<SenderService>(SenderService)
  })

  describe('sender test', () => {
    it('online check', async () => {
      const list = [2, 16, 27, 30, 45]
      expect(await senderService.onlineCheck(list))
    })
  })
})
