import { AppModule } from '@/app.module'
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import {
  GroupCreateReq, GroupMemberReq, GroupDescResp,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq, GroupMemberItem,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq, GroupNoticeResp,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupInfoItem,
  MineGroupInfoItem, GroupDetailItem
} from '@/dto/group'
import { randomUUID, randomInt } from 'crypto'
describe('GroupController', () => {
  let app: NestFastifyApplication

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

  // // 测试注册
  // it('POST /register error', async () => {
  //   const req: RegisterReq = new RegisterReq()
  //   req.avatar = 'https://avatars.githubusercontent.com/u/122279700?v=4'
  //   req.gender = 1
  //   req.id = '123456'
  //   req.pubKey = '123'
  //   req.name = 'test_' + req.id
  //   return await app
  //     .inject({
  //       method: 'POST',
  //       url: '/auth/register',
  //       payload: req
  //     })
  //     .then((result) => {
  //       expect(result.statusCode).toEqual(201)
  //       expect(result.json()).toEqual(
  //         expect.objectContaining({
  //           message: ['已注册'],
  //           error: 'Bad Request',
  //           statusCode: 400
  //         })
  //       )
  //     })
  // })

  afterAll(async () => {
    await app.close()
  })
})
