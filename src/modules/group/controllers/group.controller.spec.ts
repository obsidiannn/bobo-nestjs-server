import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseIdReq, BaseIdsArrayReq } from '@/modules/common/dto/common.dto'
import {
  GroupCreateReq, GroupMemberReq,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq
} from '@/modules/group/controllers/group.dto'
import { randomBytes, randomInt } from 'crypto'
import { buildWallet, generatePrivateKey, computeSharedSecret } from '@/utils/web3'
import { strMd5 } from '@/utils/buffer.util'
import testUtil from '@/utils/test-util'
import { UserService } from '@/modules/user/services/user.service'
import { PrismaService } from '@/modules/common/services/prisma.service'
import * as request from 'supertest'
import { Wallet } from 'ethers'
import { SystemService } from '@/modules/common/services/system.service'
import { GroupMemberRoleEnum } from '@/enums'

describe('GroupController', () => {
  let app: NestExpressApplication
  const _groupId: string = '4bcfdb52-dd1e-4010-8c0f-2ca2c4f9b688'
  let systemPublicKey: string
  let prismaService: PrismaService
  let userService: UserService

  let customPk: string
  let customWallet: Wallet
  let customId: string
  const _inviteUser: string[] = ['0x882e04e22724DA6e2BfBf46E6bDDaB17824Ee977']

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

  describe('群组管理', () => {
    it('创建群聊', async () => {
      // 群ecc
      const groupPk = generatePrivateKey()
      const groupWallet = buildWallet(groupPk)
      const sharedPk = computeSharedSecret(groupWallet, customWallet.signingKey.publicKey)

      const req: GroupCreateReq = {
        id: randomBytes(12).toString('hex'),
        pubKey: groupWallet.signingKey.publicKey,
        avatar: 'https://pica.zhimg.com/v2-9dc70be4b533afc8bcd07e51dff72616_l.jpg',
        name: '测试群组_' + randomInt(10000).toString(),
        encKey: sharedPk,
        encPri: groupPk,
        isEnc: 0,
        type: 1,
        banType: 1,
        searchType: 1
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/create')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 邀请加入群聊
    it('邀请加入群聊', async () => {
      const groupMember = await prismaService.groupMembers.findFirst({
        where: {
          uid: customId,
          role: { in: [GroupMemberRoleEnum.OWNER, GroupMemberRoleEnum.MANAGER] }
        }
      })
      if (groupMember === null) { throw new Error() }
      const group = await prismaService.group.findFirst({
        where: {
          id: groupMember.groupId
        }
      })
      if (group === null) { throw new Error() }

      const inviteUser = await userService.findById(_inviteUser[0])
      if (inviteUser === null) { throw new Error() }

      // const sharedPk = computeSharedSecret(buildWallet(groupMember.encPri), inviteUser.pubKey)
      const req: GroupInviteJoinReq = {
        id: groupMember.groupId,
        items: [
          {
            uid: inviteUser.id,
            encKey: '',
            encPri: ''
          }
        ]
      }

      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/invite-join')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 邀请加入群聊
    it('邀请所有人加入群聊', async () => {
      const groupMember = await prismaService.groupMembers.findFirst({
        where: {
          uid: customId,
          role: { in: [GroupMemberRoleEnum.OWNER, GroupMemberRoleEnum.MANAGER] }
        }
      })
      if (groupMember === null) { throw new Error() }
      const group = await prismaService.group.findFirst({
        where: {
          id: groupMember.groupId
        }
      })
      if (group === null) { throw new Error() }

      const members = await prismaService.groupMembers.findMany({
        where: { groupId: group.id },
        select: { uid: true }
      })
      const memberIds = members.map(m => m.uid)
      memberIds.push(customId)
      const inviteUsers = await prismaService.user.findMany({
        where: { id: { notIn: memberIds } }
      })
      if (inviteUsers.length <= 0) { throw new Error() }

      const req: GroupInviteJoinReq = {
        id: groupMember.groupId,
        items: inviteUsers.map(u => {
          const sharedPk = computeSharedSecret(buildWallet(groupMember.encPri), u.pubKey)
          return {
            uid: u.id,
            encKey: sharedPk,
            encPri: ''
          }
        })
      }

      inviteUsers.map(u => {
        const sharedPk = computeSharedSecret(buildWallet(groupMember.encPri), u.pubKey)
        return {
          uid: u.id,
          encKey: sharedPk,
          encPri: ''
        }
      })

      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/invite-join')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('踢出群聊', async () => {
      const req: GroupKickOutReq = {
        id: _groupId,
        uids: [
          '488177b2f2c0af1fdf02012e31673ff6'
        ]
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/kick-out')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 修改群名称
    it('修改群名称', async () => {
      const req: GroupChangeNameReq = {
        id: _groupId,
        name: '经过修改的群名称_' + randomInt(10000).toString()
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/update-name')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('修改群头像', async () => {
      const req: GroupChangeAvatarReq = {
        id: _groupId,
        avatar: 'https://avatars.githubusercontent.com/u/122279700'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/update-avatar')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 修改群通告
    it('修改群通告', async () => {
      const req: GroupChangeNoticeReq = {
        id: _groupId,
        notice: '这是群通告_' + randomInt(10).toString(),
        noticeMd5: ''
      }
      req.noticeMd5 = strMd5(req.notice)
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/update-notice')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 修改群简介
    it('修改群简介', async () => {
      const req: GroupChangeDescReq = {
        id: _groupId,
        desc: '群简介_' + randomInt(100).toString(),
        descMd5: ''
      }
      req.descMd5 = strMd5(req.desc)
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/update-desc')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 解散群组
    it('解散群组', async () => {
      const req: BaseIdsArrayReq = {
        ids: [_groupId]
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/dismiss')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 移交群
    it('移交群', async () => {
      const req: GroupTransferReq = {
        id: _groupId,
        uid: '488177b2f2c0af1fdf02012e31673ff6',
        encKey: '',
        encPri: ''
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/transfer')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 添加管理员
    it('添加管理员', async () => {
      const req: GroupTransferReq = {
        id: _groupId,
        uid: 'bb464ee5653057b5082d24894ba4533e',
        encKey: '',
        encPri: ''
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/add-admin')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 移除管理员
    it('移除管理员', async () => {
      const req: GroupApplyJoinReq = {
        id: _groupId,
        uids: ['488177b2f2c0af1fdf02012e31673ff6']
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/remove-admin')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('同意入群', async () => {
      const req: GroupApplyJoinReq = {
        id: _groupId,
        uids: ['123456']
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/agree-join')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })
    it('查看申请列表', async () => {
      const req: BaseIdsArrayReq = {
        ids: [_groupId]
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/apply-list')
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

  describe('群聊数据展示', () => {
    it('群聊用户', async () => {
      const req: GroupMemberReq = {
        id: _groupId, limit: 10, page: 1
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/members')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('我的群聊', async () => {
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {})
      return await request(app.getHttpServer())
        .post('/groups/list')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 查看我的申请列表
    it('POST /groups/my-apply-list success', async () => {
      const req: BaseIdsArrayReq = {
        ids: [_groupId]
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/my-apply-list')
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

  describe('群成员操作', () => {
    it('修改我在群里面的昵称', async () => {
      const req: GroupChangeAliasReq = {
        id: _groupId,
        alias: '这是我的群昵称_' + randomInt(10).toString()
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/update-alias')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 退出群聊
    it('单个退出群聊', async () => {
      const req: BaseIdReq = {
        id: _groupId
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/quit')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    // 退出群聊
    it('批量退出群聊', async () => {
      const req: BaseIdsArrayReq = {
        ids: [_groupId]
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/quit-batch')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('退出我的全部群聊', async () => {
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, {})
      return await request(app.getHttpServer())
        .post('/groups/quit-all')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('批量获取群详情', async () => {
      const req: BaseIdsArrayReq = {
        ids: [_groupId]
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/get-batch-info')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('申请入群', async () => {
      const req: BaseIdReq = {
        id: _groupId
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post('/groups/require-join')
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
})
