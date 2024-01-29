import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { UserGenderEnum } from '@/enums'
import * as request from 'supertest'
import { buildWallet, generatePrivateKey } from '@/utils/web3'
import { SystemController } from '@/modules/common/controllers/system.controller'
import testUtil from '@/utils/test-util'
import { Prisma } from '@prisma/client'
import { BasePageReq, BaseIdsArrayReq, BaseUIdArrayReq, BaseArrayResp, BasePageResp } from '../../common/dto/common.dto'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem
  , FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq, FriendListPageReq
} from './friend.dto'
import { UserService } from '@/modules/user/services/user.service'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Wallet } from 'ethers'
import commonUtil from '@/utils/common.util'
import { randomInt } from 'crypto'
import { SystemService } from '@/modules/common/services/system.service'

describe('friend module FriendController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  // let randomPk: string
  let userService: UserService
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
    // 初始化要用的
    systemPublicKey = sysPubKeyResponse
    userService = app.get<UserService>(UserService)
    prismaService = app.get<PrismaService>(PrismaService)

    customPk = systemService.getTestUserId()
    customWallet = buildWallet(customPk)
    customId = customWallet.address
  })
  // describe('数据初始化', () => {
  //   it('初始化用户 100个', async () => {
  //     for (let index = 0; index < 100; index++) {
  //       const pk = generatePrivateKey()
  //       const wallet = buildWallet(pk)
  //       const input: Prisma.UserCreateInput = {
  //         id: wallet.address,
  //         unionId: pk,
  //         avatar: _avatar,
  //         name: '测试用户_' + index.toString(),
  //         nameIdx: 'idx_' + index.toString(),
  //         gender: 1,
  //         pubKey: wallet.signingKey.compressedPublicKey,
  //         status: 1,
  //         dbIdx: bufferUtil.changeStr2HexNumber(wallet.address) % 500,
  //         createdAt: new Date()
  //       }
  //       await userService.create(input)
  //     }
  //     expect(1).toBe(1)
  //   })
  // })

  describe('获取用户关系', () => {
    it('获取所有用户的关系', async () => {
      const users = await prismaService.user.findMany({
        where: { id: { not: customWallet.address } },
        skip: 0,
        take: 10,
        select: { id: true },
        orderBy: { nameIdx: 'asc' }
      })
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {
        uids: users.map(u => u.id)
      })
      return await request(app.getHttpServer())
        .post('/friends/relation-list')
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
  describe('申请好友', () => {
    it('申请 success', async () => {
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {
        uid: '0x624b76f03915666e07bA0e4Aa47Aa6f72C2c4bF6',
        remark: 'success remark'
      })
      return await request(app.getHttpServer())
        .post('/friends/invite-apply')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })

    it('申请 自己申请自己', async () => {
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {
        uid: customWallet.address,
        remark: '自己申请自己'
      })
      return await request(app.getHttpServer())
        .post('/friends/invite-apply')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })

  describe('申请列表', () => {
    it('我的申请列表', async () => {
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {
        page: 1, limit: 10
      })
      return await request(app.getHttpServer())
        .post('/friends/invite-list')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => console.log(res.body))
    })

    it('我的审批列表', async () => {
      const testUserPk = '0x861bc89483eaae7c90d90a47c4eb2e5cc2a7c29de2565b7296103e040d0c6ab1'
      const params = testUtil.buildAuthParams(testUserPk, systemPublicKey, {
        page: 1, limit: 10
      })
      return await request(app.getHttpServer())
        .post('/friends/invite-apply-list')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => console.log(res.body))
    })
  })

  describe('申请审核', () => {
    it('申请已读', async () => {
      const testUserPk = '0x861bc89483eaae7c90d90a47c4eb2e5cc2a7c29de2565b7296103e040d0c6ab1'
      const wallet = buildWallet(testUserPk)
      const param = { page: 1, limit: 10 }
      // 未读分页
      const data = await prismaService.friendApply.findMany({
        where: {
          objUid: wallet.address,
          isRead: 0
        },
        skip: commonUtil.pageSkip(param),
        take: param.limit
      })
      if (data.length > 0) {
        const ids = data.map(d => d.id)
        const params = testUtil.buildAuthParams(testUserPk, systemPublicKey, { ids })
        return await request(app.getHttpServer())
          .post('/friends/invite-read')
          .send({
            data: params.encData
          })
          .set(params.headers)
          .expect(200)
          .then(res => console.log(res.body))
      }
    })

    it('同意', async () => {
      const testUserPk = '0x861bc89483eaae7c90d90a47c4eb2e5cc2a7c29de2565b7296103e040d0c6ab1'
      const wallet = buildWallet(testUserPk)
      const data = await prismaService.friendApply.findFirst({
        where: {
          objUid: wallet.address,
          status: 0
        }
      })
      if (data !== null) {
        const params = testUtil.buildAuthParams(testUserPk, systemPublicKey, {
          id: data.id, alias: '同意的别名'
        })
        return await request(app.getHttpServer())
          .post('/friends/invite-agree')
          .send({
            data: params.encData
          })
          .set(params.headers)
          .expect(200)
          .then(res => console.log(res.body))
      }
    })

    it('拒绝', async () => {
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {
        id: '',
        reason: ''
      })
      return await request(app.getHttpServer())
        .post('/friends/invite-reject')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => console.log(res.body))
    })
  })

  describe('好友列表', () => {
    it('好友列表 无入参', async () => {
      const param = { page: 1, limit: 10 }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, param)
      return await request(app.getHttpServer())
        .post('/friends/list')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => console.log(res.body))
    })

    it('好友列表 指定id', async () => {
      const param = { page: 1, limit: 10, uids: ['0x624b76f03915666e07bA0e4Aa47Aa6f72C2c4bF6'] }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, param)
      return await request(app.getHttpServer())
        .post('/friends/list')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => console.log(res.body))
    })
  })

  describe('好友管理', () => {
    it('变更备注', async () => {
      const wallet = buildWallet(customPk)

      const friend = await prismaService.friend.findFirst({
        where: {
          uid: wallet.address
        }
      })
      if (friend !== null) {
        const param = { id: friend.id, alias: '随机备注_' + randomInt(100).toString() }
        const params = testUtil.buildAuthParams(customPk, systemPublicKey, param)
        return await request(app.getHttpServer())
          .post('/friends/update-alias')
          .send({
            data: params.encData
          })
          .set(params.headers)
          .expect(200)
          .then(res => console.log(res.body))
      }
    })
    it('删除好友（单向）', async () => {
      const wallet = buildWallet(customPk)
      const friend = await prismaService.friend.findFirst({
        where: {
          uid: wallet.address
        }
      })
      if (friend !== null) {
        console.log('删除好友:' + friend.objUid)
        const param = { uids: [friend.objUid] }
        const params = testUtil.buildAuthParams(customPk, systemPublicKey, param)
        return await request(app.getHttpServer())
          .post('/friends/delete-unilateral')
          .send({
            data: params.encData
          })
          .set(params.headers)
          .expect(200)
          .then(res => console.log(res.body))
      }
    })
    it('删除所有好友（双向）', async () => {
      const wallet = buildWallet(customPk)
      const friend = await prismaService.friend.findFirst({
        where: {
          uid: wallet.address
        }
      })
      if (friend !== null) {
        console.log('删除好友:' + friend.objUid)
        const param = { uids: [friend.objUid] }
        const params = testUtil.buildAuthParams(customPk, systemPublicKey, param)
        return await request(app.getHttpServer())
          .post('/friends/delete-bilateral')
          .send({
            data: params.encData
          })
          .set(params.headers)
          .expect(200)
          .then(res => console.log(res.body))
      }
    })
  })
})
