import * as request from 'supertest'
import { AppModule } from '@/app.module'
import { SystemController } from '@/modules/common/controllers/system.controller'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { builWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Wallet } from 'ethers'
import testUtil from '@/utils/test-util'

import {
  MessageSendReq,
  MessageListItem,
  MessageDetailItem,
  MessageDeleteByIdReq,
  MessageDeleteByMsgIdReq,
  MessageListReq,
  MessageDetailListReq
} from '../controllers/message.dto'
import { randomUUID } from 'crypto'
import { SystemService } from '@/modules/common/services/system.service'
import { ChatService } from '../services/chat.service'
import { CommonEnum } from '@/modules/common/dto/common.dto'

describe('MessageController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prismaService: PrismaService
  let chatService: ChatService

  let customPk: string
  let customWallet: Wallet
  let customId: string
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
    systemPublicKey = sysPubKeyResponse
    customPk = systemService.getTestUserId()
    prismaService = app.get<PrismaService>(PrismaService)
    chatService = app.get<ChatService>(ChatService)
    customWallet = builWallet(customPk)
    customId = customWallet.address
  })

  it('验证userRef', () => {
    const ref = chatService.userRefGenerate([customId, '0x624b76f03915666e07bA0e4Aa47Aa6f72C2c4bF6'])
    console.log('====================================')
    console.log(ref)
    console.log('====================================')
  })

  describe('发起消息', () => {
    it('发起单个消息', async () => {
      const friend = await prismaService.friend.findFirst({
        where: {
          uid: customId
        }
      })
      if (friend === null) {
        throw new Error()
      }
      const ref = chatService.userRefGenerate([customId, friend.objUid])
      console.log('====================================')
      console.log(ref)
      console.log('====================================')
      const chatUser = await prismaService.chatUser.findFirst({
        where: {
          userRef: ref,
          uid: customId
        }
      })
      if (chatUser === null) {
        throw new Error()
      }

      const req: MessageSendReq = {
        chatId: chatUser.chatId,
        content: '测试消息' + randomUUID(),
        type: 1,
        isEnc: CommonEnum.ON,
        receiveIds: [friend.objUid],
        extra: {}
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/messages/send')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })
    it('发起群消息', async () => {

    })

    it('发起多个好友消息', async () => {

    })
  })

  describe('消息列表', () => {
    it('我的消息列表', async () => {
      const chat = await prismaService.chatUser.findFirst({
        where: {
          uid: customId
        }
      })
      if (chat === null) { throw new Error() }
      const req: MessageListReq = {
        chatId: chat.chatId,
        sequence: chat.maxReadSeq,
        direction: 'down'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/messages/list')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('我的消息详情列表', async () => {
      const chat = await prismaService.chatUser.findFirst({
        where: {
          uid: customId
        }
      })
      if (chat === null) { throw new Error() }
      const userMessages = await prismaService.userMessage.findMany({
        where: {
          uid: customId,
          chatId: chat.chatId
        },
        select: {
          msgId: true,
          sequence: true
        },
        orderBy: { sequence: 'asc' }
      })
      if (userMessages.length <= 0) { throw new Error() }

      const req: MessageDetailListReq = {
        chatId: chat.chatId,
        ids: userMessages.map(u => u.msgId),
        start: userMessages[0].sequence,
        end: userMessages[userMessages.length - 1].sequence
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/messages/detail')
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

  describe('消息管理', () => {
    it('撤回消息', async () => {

    })
    it('（单向）删除单条消息', async () => {

    })
    it('（双向）删除所有消息', async () => {

    })
    it('（单向）根据会话IDs 解除自己与会话消息的关系', async () => {

    })
    it('根据chatId撤回消息', async () => {

    })
    it('清空群消息', async () => {

    })
  })
})
