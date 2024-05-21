import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AuthEnumIsRegister, ChatTypeEnum, UserGenderEnum } from '@/enums'
import * as request from 'supertest'
import { SystemController } from '@/modules/common/controllers/system.controller'
import testUtil from '@/utils/test-util'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Prisma } from '@prisma/client'
import commonUtil from '@/utils/common.util'
describe('auth module AuthController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let privateKey: string
  let prisma: PrismaService
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    await app.init()
    const systemController = app.get<SystemController>(SystemController)
    const sysPubKeyResponse = await systemController.getPubKey()
    if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
      throw new Error('pubKey is empty')
    }
    const configService = app.get<ConfigService>(ConfigService)
    prisma = app.get<PrismaService>(PrismaService)
    systemPublicKey = sysPubKeyResponse.pubKey
    privateKey = configService.get<string>('TEST_USER_ID') ?? ''
  })
  describe('register', () => {
    it('/POST register', async () => {
      // 获取用户是否注册
      const isRegisterParams = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
      const isRegisterResponse = await request(app.getHttpServer())
        .post('/auth/is-register')
        .send({
          data: isRegisterParams.encData
        })
        .set(isRegisterParams.headers)
        .expect(200)
      // 如果没有注册，则注册
      if (isRegisterResponse.body.isRegister === AuthEnumIsRegister.NO) {
        const registerParams = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
        return await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            data: registerParams.encData
          })
          .set(registerParams.headers)
          .expect(200)
      }
    })
  })
  describe('login', () => {
    it('/POST login', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })

  describe('update username', () => {
    it('/POST update username', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {
        username: 'test'
      })
      return await request(app.getHttpServer())
        .post('/auth/update-name')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })
  describe('update gender', () => {
    it('/POST update gender', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {
        gender: UserGenderEnum.MAN
      })
      return await request(app.getHttpServer())
        .post('/auth/update-gender')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })
  describe('update avatar', () => {
    it('/POST update avatar', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {
        avatar: 'https://api.multiavatar.com/1.webp'
      })
      return await request(app.getHttpServer())
        .post('/auth/update-avatar')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })

  describe('增加系统用户', () => {
    it('系统消息', async () => {
      const officialCreate: Prisma.OfficialUserCreateInput = {
        name: '系统消息',
        nameIdx: 'A',
        avatar: '',
        desc: '',
        status: 1,
        type: 1
      }
      const officialUser = await prisma.officialUser.create({ data: officialCreate })

      const users = await prisma.user.findMany()

      for (let index = 0; index < users.length; index++) {
        const u = users[index]
        const chat: Prisma.ChatCreateInput = {
          userIds: [u.id, officialUser.id],
          type: ChatTypeEnum.OFFICIAL,
          creatorUId: u.id,
          status: 1,
          lastReadSequence: 0,
          lastSequence: 0
        }
        const chatData = await prisma.chat.create({ data: chat })
        const userRef = commonUtil.generateRef([u.id, officialUser.id])
        const chatUser: Prisma.ChatUserCreateInput = {
          uid: u.id,
          chatId: chatData.id,
          isTop: 1,
          isMute: 0,
          isShow: 1,
          isHide: 0,
          maxReadSeq: 0,
          lastOnlineTime: new Date(),
          userRef
        }
        const chatUserOffical: Prisma.ChatUserCreateInput = {
          uid: officialUser.id,
          chatId: chatData.id,
          isTop: 1,
          isMute: 0,
          isShow: 1,
          isHide: 0,
          maxReadSeq: 0,
          lastOnlineTime: new Date(),
          userRef
        }

        await prisma.chatUser.createMany({
          data: [chatUser, chatUserOffical]
        })
      }
    })
  })
})
