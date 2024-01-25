import * as request from 'supertest'
import { AppModule } from '@/app.module'
import { SystemController } from '@/modules/common/controllers/system.controller'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { builWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Wallet } from 'ethers'
import testUtil from '@/utils/test-util'
import { SystemService } from '@/modules/common/services/system.service'

describe('ChatController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prismaService: PrismaService

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
    customWallet = builWallet(customPk)
    customId = customWallet.address
  })

  it('我的会话列表', async () => {
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, {})
    return await request(app.getHttpServer())
      .post('/chat/mine-list')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('会话详情', async () => {
    const chats = await prismaService.chatUser.findMany({
      where: {
        uid: customId
      },
      select: {
        chatId: true
      }
    })
    const req = { ids: chats.map(c => c.chatId) }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/chat/detail')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('删除(隐藏)会话', async () => {
    const chatArray = await prismaService.chatUser.findMany({
      where: {
        uid: customId
      },
      take: 10,
      select: {
        chatId: true
      }
    })
    const req = { ids: chatArray.map(c => c.chatId) }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/chat/delete')
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
