import { AppModule } from '@/app.module'
import { SystemController } from '@/modules/common/controllers/system.controller'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'

describe('MessageController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prismaService: PrismaService
  let userService: UserService

  // const customPk: string = '0x7aa1920049e5be949bfd82465eb08923d36ec6897f69cd3420929769a05e4c58'
  // let customWallet: Wallet

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    const systemController = app.get<SystemController>(SystemController)
    const sysPubKeyResponse = await systemController.getPubKey()
    if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
      throw new Error('pubKey is empty')
    }
    prismaService = app.get<PrismaService>(PrismaService)
  })

  it('发起消息', async () => {
    // return await request(app.getHttpServer())
    //   .post('/messages/create')
    //   .send({
    //     data: params.encData
    //   })
    //   .set(params.headers)
    //   .expect(200)
    //   .then(res => {
    //     console.log(res.body)
    //   })
  })
})
