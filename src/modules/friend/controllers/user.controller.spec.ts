import { PrismaService } from '@/modules/common/services/prisma.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { UserService } from '../../user/services/user.service'
import { Wallet } from 'ethers'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { SystemService } from '@/modules/common/services/system.service'
import { buildWallet } from '@/utils/web3'
import testUtil from '@/utils/test-util'
import * as request from 'supertest'
describe('UserController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prismaService: PrismaService

  let customPk: string
  let customWallet: Wallet

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
    prismaService = app.get<PrismaService>(PrismaService)
    customWallet = buildWallet(customPk)
  })

  it('获取用户列表', async () => {
    const uIds = await prismaService.user.findMany({
      select: {
        id: true
      }
    })
    const req = {
      uIds
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/user/get-batch-info')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })
})
