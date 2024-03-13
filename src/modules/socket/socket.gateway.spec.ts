import { AppModule } from '@/app.module'
import testUtil from '@/utils/test-util'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { SystemService } from '../common/services/system.service'
describe('websocket test', () => {
  let app: NestExpressApplication
  let customPk: string
  let systemPublicKey: string
  beforeEach(async () => {
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
    systemPublicKey = sysPubKeyResponse
    customPk = systemService.getTestUserId()
  })

  it('生成请求header', async () => {
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, {
    })
    console.log('====================================')
    console.log(params.headers)
    console.log('====================================')
  })
})
