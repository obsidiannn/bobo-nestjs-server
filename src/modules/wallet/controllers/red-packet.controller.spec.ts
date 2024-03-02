import { AppModule } from '@/app.module'
import { RedPacketSourceEnum, RedPacketTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { SystemService } from '@/modules/common/services/system.service'
import testUtil from '@/utils/test-util'
import { buildWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { GroupMembers } from '@prisma/client'
import { Wallet } from 'ethers'
import * as request from 'supertest'
import { RedPacketCreateReq } from './red-packet.dto'
import { BaseIdReq } from '@/modules/common/dto/common.dto'

describe('RedPacketController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prisma: PrismaService

  let customPk: string
  let customWallet: Wallet
  let customId: string
  const BASE_PATH: string = '/red-packet'
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
    prisma = app.get<PrismaService>(PrismaService)
    customWallet = buildWallet(customPk)
    customId = customWallet.address
  })
  /**
   * 获取我的群聊id
   * @returns group.id []
   */
  const myGroupId = async (): Promise<string[]> => {
    const groups = await prisma.groupMembers.findMany({
      where: { uid: customId }
    })
    return groups.map(g => g.groupId)
  }

  /**
   * 查找我的群组内好友
   */
  const myGroupMate = async (groupIds: string[]): Promise<GroupMembers> => {
    const result = await prisma.groupMembers.findFirst({
      where: {
        groupId: { in: groupIds },
        uid: { not: customId }
      }
    })
    if (result === null) { throw new Error() }
    return result
  }

  describe('创建红包', () => {
    it('创建群红包-普通', async () => {
      const groupIds = await myGroupId()
      if (groupIds.length <= 0) {
        throw new Error('无群组数据')
      }
      const req: RedPacketCreateReq = {
        type: RedPacketTypeEnum.NORMAL,
        sourceType: RedPacketSourceEnum.GROUP,
        packetCount: 10,
        singleAmount: 1000,
        groupId: groupIds[0],
        remark: '恭喜发财，普通红包'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/create')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })
    it('创建群红包-拼手气', async () => {
      const groupIds = await myGroupId()
      if (groupIds.length <= 0) {
        throw new Error('无群组数据')
      }
      const req: RedPacketCreateReq = {
        type: RedPacketTypeEnum.RANDOM,
        sourceType: RedPacketSourceEnum.GROUP,
        packetCount: 10,
        totalAmount: 1000,
        groupId: groupIds[0],
        remark: '恭喜发财，群聊红包'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/create')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })
    it('创建群红包-专属', async () => {
      const groupIds = await myGroupId()
      if (groupIds.length <= 0) {
        throw new Error('无群组数据')
      }
      const groupMate = await myGroupMate(groupIds)
      const req: RedPacketCreateReq = {
        type: RedPacketTypeEnum.TARGETED,
        sourceType: RedPacketSourceEnum.GROUP,
        packetCount: 1,
        singleAmount: 1000,
        groupId: groupMate.groupId,
        objUIds: [groupMate.uid],
        remark: '恭喜发财，专属红包'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/create')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })
    it('创建个人红包-普通', async () => {
      const friend = await prisma.friend.findFirst({
        where: {
          uid: customId
        }
      })
      if (friend === null) {
        throw new Error()
      }
      const req: RedPacketCreateReq = {
        type: RedPacketTypeEnum.TARGETED,
        sourceType: RedPacketSourceEnum.USER,
        packetCount: 1,
        singleAmount: 1000,
        objUIds: [friend.objUid],
        remark: '恭喜发财，专属红包'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/create')
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

  it('获取红包摘要', async () => {
    const onePacket = await prisma.redPacket.findFirst()
    if (onePacket === null) {
      throw new Error()
    }
    const req: BaseIdReq = {
      id: onePacket.id
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post(BASE_PATH + '/info')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('获取红包详情', async () => {
    const onePacket = await prisma.redPacket.findFirst()
    if (onePacket === null) {
      throw new Error()
    }
    const req: BaseIdReq = {
      id: onePacket.id
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post(BASE_PATH + '/detail')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('抢红包', async () => {
    const onePacket = await prisma.redPacket.findFirst()
    if (onePacket === null) {
      throw new Error()
    }
    const req: BaseIdReq = {
      id: onePacket.id
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post(BASE_PATH + '/apply')
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
