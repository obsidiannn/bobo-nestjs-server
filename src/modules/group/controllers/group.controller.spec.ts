import { AppModule } from '@/app.module'
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
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
import { strMd5 } from '@/utils/bufferUtil'
describe('GroupController', () => {
  let app: NestFastifyApplication
  const _groupId: string = '4bcfdb52-dd1e-4010-8c0f-2ca2c4f9b688'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  // 创建群聊
  it('POST /groups/create success', async () => {
    const req: GroupCreateReq = {
      id: randomUUID(),
      pubKey: randomUUID(),
      avatar: 'https://pica.zhimg.com/v2-9dc70be4b533afc8bcd07e51dff72616_l.jpg',
      name: '测试群组_' + randomInt(10000).toString(),
      isEnc: 0,
      type: 1,
      banType: 1,
      searchType: 1
    }

    return await app
      .inject({
        method: 'POST',
        url: '/groups/create',
        payload: req
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
      })
  })
  // 创建群聊
  it('POST /groups/create fail', async () => {
    const req: GroupCreateReq = {
      id: randomUUID(),
      pubKey: randomUUID(),
      avatar: 'https://pica.zhimg.com/v2-9dc70be4b533afc8bcd07e51dff72616_l.jpg',
      name: '测试群组_' + randomInt(10000).toString(),
      isEnc: 0,
      type: 1,
      banType: 1,
      searchType: 1
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/create',
        payload: req
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
      })
  })

  // 群聊用户
  it('POST /groups/members success', async () => {
    const req: GroupMemberReq = new GroupMemberReq()
    req.id = _groupId
    // req.limit = 1
    // req.page = 2
    return await app
      .inject({
        method: 'POST',
        url: '/groups/members',
        payload: req
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
        console.log('====================================success')
        console.log(result.body)
        console.log('====================================')
      })
  })

  // 邀请加入群聊
  it('POST /groups/invite-join success', async () => {
    const req: GroupInviteJoinReq = {
      id: _groupId,
      items: [
        {
          uid: '488177b2f2c0af1fdf02012e31673ff6'
        }
      ]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/invite-join',
        payload: req
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
        console.log('====================================success')
        console.log(result.body)
        console.log('====================================')
      })
  })

  // 踢出群聊
  it('POST /groups/kick-out success', async () => {
    const req: GroupKickOutReq = {
      id: _groupId,
      uids: [
        '488177b2f2c0af1fdf02012e31673ff6'
      ]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/kick-out',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 我的群聊
  it('POST /groups/list success', async () => {
    return await app
      .inject({
        method: 'POST',
        url: '/groups/list'
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 修改群名称
  it('POST /groups/update-name success', async () => {
    const req: GroupChangeNameReq = {
      id: _groupId,
      name: '经过修改的群名称_' + randomInt(10000).toString()
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/update-name',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 修改群名称
  it('POST /groups/update-name success', async () => {
    const req: GroupChangeNameReq = {
      id: _groupId,
      name: '经过修改的群名称_' + randomInt(10000).toString()
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/update-name',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 修改群头像
  it('POST /groups/update-avatar success', async () => {
    const req: GroupChangeAvatarReq = {
      id: _groupId,
      avatar: 'https://avatars.githubusercontent.com/u/122279700'
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/update-avatar',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 修改我在群里面的昵称
  it('POST /groups/update-alias success', async () => {
    const req: GroupChangeAliasReq = {
      id: _groupId,
      alias: '这是我的群昵称_' + randomInt(10).toString()
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/update-alias',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 退出群聊
  it('POST /groups/quit success', async () => {
    const req: BaseIdReq = {
      id: _groupId
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/quit',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 退出群聊
  it('POST /groups/quit-batch success', async () => {
    const req: BaseIdsArrayReq = {
      ids: [_groupId]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/quit-batch',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 退出我的全部群聊
  it('POST /groups/quit-all success', async () => {
    return await app
      .inject({
        method: 'POST',
        url: '/groups/quit-all'
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 修改群通告
  it('POST /groups/update-notice success', async () => {
    const req: GroupChangeNoticeReq = {
      id: _groupId,
      notice: '这是群通告_' + randomInt(10).toString(),
      noticeMd5: ''
    }
    req.noticeMd5 = strMd5(req.notice)
    return await app
      .inject({
        method: 'POST',
        url: '/groups/update-notice',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 修改群简介
  it('POST /groups/update-desc success', async () => {
    const req: GroupChangeDescReq = {
      id: _groupId,
      desc: '群简介_' + randomInt(100).toString(),
      descMd5: ''
    }
    req.descMd5 = strMd5(req.desc)
    return await app
      .inject({
        method: 'POST',
        url: '/groups/update-desc',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 解散群组
  it('POST /groups/dismiss success', async () => {
    const req: BaseIdsArrayReq = {
      ids: [_groupId]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/dismiss',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 移交群
  it('POST /groups/transfer success', async () => {
    const req: GroupTransferReq = {
      id: _groupId,
      uid: '488177b2f2c0af1fdf02012e31673ff6'
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/transfer',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 添加管理员
  it('POST /groups/add-admin success', async () => {
    const req: GroupTransferReq = {
      id: _groupId,
      uid: 'bb464ee5653057b5082d24894ba4533e'
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/add-admin',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 移除管理员
  it('POST /groups/remove-admin success', async () => {
    const req: GroupApplyJoinReq = {
      id: _groupId,
      uids: ['488177b2f2c0af1fdf02012e31673ff6']
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/remove-admin',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 批量获取群详情
  it('POST /groups/get-batch-info success', async () => {
    const req: BaseIdsArrayReq = {
      ids: [_groupId]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/get-batch-info',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 申请入群
  it('POST /groups/require-join success', async () => {
    const req: BaseIdReq = {
      id: _groupId
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/require-join',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 同意入群
  it('POST /groups/agree-join success', async () => {
    const req: GroupApplyJoinReq = {
      id: _groupId,
      uids: ['123456']
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/agree-join',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })
  // 查看申请列表
  it('POST /groups/apply-list success', async () => {
    const req: BaseIdsArrayReq = {
      ids: [_groupId]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/apply-list',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  // 查看我的申请列表
  it('POST /groups/my-apply-list success', async () => {
    const req: BaseIdsArrayReq = {
      ids: [_groupId]
    }
    return await app
      .inject({
        method: 'POST',
        url: '/groups/my-apply-list',
        payload: req
      })
      .then((result) => {
        console.log('====================================')
        console.log(result.body)
        console.log('====================================')
        expect(result.statusCode).toEqual(201)
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
