import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test } from '@nestjs/testing'
import { BaseIdReq, CommonEnum, BaseIdsArrayReq, BasePageResp, BaseArrayResp } from '@/modules/common/dto/common.dto'
import {
  GroupCreateReq, GroupMemberReq, GroupDescResp,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq, GroupMemberItem,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq, GroupNoticeResp,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupInfoItem,
  MineGroupInfoItem, GroupDetailItem
} from '@/modules/group/controllers/group.dto'
import { randomUUID, randomInt } from 'crypto'
import { builWallet, generatePrivateKey } from '@/utils/web3'
import bufferUtil, { strMd5 } from '@/utils/buffer.util'
import testUtil from '@/utils/test-util'
import { UserService } from '@/modules/user/services/user.service'
import { SystemController } from '@/modules/common/controllers/system.controller'
import { PrismaService } from '@/modules/common/services/prisma.service'
import * as request from 'supertest'
describe('GroupController', () => {
  let app: NestExpressApplication
  const _groupId: string = '4bcfdb52-dd1e-4010-8c0f-2ca2c4f9b688'
  let systemPublicKey: string
  let prismaService: PrismaService
  let userService: UserService

  const customPk: string = '0x7aa1920049e5be949bfd82465eb08923d36ec6897f69cd3420929769a05e4c58'
  let customWallet: Wallet

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
    // 初始化要用的
    systemPublicKey = sysPubKeyResponse.pubKey
    userService = app.get<UserService>(UserService)
    prismaService = app.get<PrismaService>(PrismaService)
    customWallet = builWallet(customPk)
  })

  describe('群组管理', () => {
    it('创建群聊', async () => {
      const req: GroupCreateReq = {
        id: randomUUID(),
        pubKey: '',
        avatar: 'https://pica.zhimg.com/v2-9dc70be4b533afc8bcd07e51dff72616_l.jpg',
        name: '测试群组_' + randomInt(10000).toString(),
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
      const req: GroupInviteJoinReq = {
        id: _groupId,
        items: [
          {
            uid: '488177b2f2c0af1fdf02012e31673ff6'
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
        uid: '488177b2f2c0af1fdf02012e31673ff6'
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
        uid: 'bb464ee5653057b5082d24894ba4533e'
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
