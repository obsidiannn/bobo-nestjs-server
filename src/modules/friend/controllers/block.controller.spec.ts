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
describe('BlockController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prismaService: PrismaService
  let userService: UserService

  let customPk: string
  let customWallet: Wallet
  let customId: string

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
    customId = customWallet.address
    userService = app.get<UserService>(UserService)
  })

  it('拉黑', async () => {
    const randomOther = await prismaService.user.findFirst({
      where: {
        id: { not: customId }
      }
    })
    const req = {
      uid: randomOther?.id
    }

    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/auth/add-user-black')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('解除拉黑', async () => {
    const blockUser = await prismaService.blacklist.findFirst({
      where: {
        uid: customId
      }
    })
    if (blockUser === null) {
      throw new Error()
    }
    const req = {
      uid: blockUser.objUid
    }

    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/auth/remove-user-black')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('黑名单列表', async () => {
    const req = {
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/auth/user-black-list')
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
