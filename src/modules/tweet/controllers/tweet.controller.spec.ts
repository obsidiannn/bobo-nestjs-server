import { AppModule } from '@/app.module'
import { CommentLevelEnum, MediaTypeEnum, RedPacketSourceEnum, RedPacketTypeEnum, VisibleTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { SystemService } from '@/modules/common/services/system.service'
import testUtil from '@/utils/test-util'
import { buildWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { GroupMembers } from '@prisma/client'
import { Wallet } from 'ethers'
import * as request from 'supertest'

import { BaseIdReq } from '@/modules/common/dto/common.dto'
import { MediaItem, SearchReq, TweetCommentPageReq, TweetCreateReq, TweetPageReq, TweetRetweetReq } from './tweet.dto'
import { randomUUID } from 'crypto'

describe('TweetController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prisma: PrismaService

  let customPk: string
  let customWallet: Wallet
  let customId: string
  const BASE_PATH: string = '/tweet'
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
  it('搜索群组', async () => {
    const req: SearchReq = {
      keyword: '测试',
      page: 1,
      limit: 10
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post(BASE_PATH + '/search')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  describe('写操作', () => {
    it('发推:公开，可评论', async () => {
      const medias: MediaItem [] = [
        {
          url: 'https://avatars.githubusercontent.com/u/122279700',
          type: MediaTypeEnum.IMAGE,
          sort: 0
        }
      ]
      const req: TweetCreateReq = {
        visibleType: VisibleTypeEnum.PUBLIC,
        retweetId: null,
        parentId: null,
        medias,
        content: '公开，可评论' + randomUUID(),
        longitude: 1,
        latitude: 1,
        address: '随机地址',
        commentLevel: CommentLevelEnum.EACH
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/post')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('发推：好友，可评论', async () => {
      const medias: MediaItem [] = [
        {
          url: 'https://avatars.githubusercontent.com/u/122279700',
          type: MediaTypeEnum.IMAGE,
          sort: 0
        }
      ]
      const req: TweetCreateReq = {
        visibleType: VisibleTypeEnum.FRIEND,
        retweetId: null,
        parentId: null,
        medias,
        content: '好友，可评论' + randomUUID(),
        longitude: 1,
        latitude: 1,
        address: '随机地址',
        commentLevel: CommentLevelEnum.EACH
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/post')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('发推: 私有，可评论', async () => {
      const medias: MediaItem [] = [
        {
          url: 'https://avatars.githubusercontent.com/u/122279700',
          type: MediaTypeEnum.IMAGE,
          sort: 0
        }
      ]
      const req: TweetCreateReq = {
        visibleType: VisibleTypeEnum.SELF,
        retweetId: null,
        parentId: null,
        medias,
        content: '私有，可评论' + randomUUID(),
        longitude: 1,
        latitude: 1,
        address: '随机地址',
        commentLevel: CommentLevelEnum.EACH
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/post')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('发推: 私有，可评论', async () => {
      const medias: MediaItem [] = [
        {
          url: 'https://avatars.githubusercontent.com/u/122279700',
          type: MediaTypeEnum.IMAGE,
          sort: 0
        }
      ]
      const req: TweetCreateReq = {
        visibleType: VisibleTypeEnum.SELF,
        retweetId: null,
        parentId: null,
        medias,
        content: '私有，可评论' + randomUUID(),
        longitude: 1,
        latitude: 1,
        address: '随机地址',
        commentLevel: CommentLevelEnum.EACH
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/post')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('发推: 公有，好友可评论', async () => {
      const medias: MediaItem [] = [
        {
          url: 'https://avatars.githubusercontent.com/u/122279700',
          type: MediaTypeEnum.IMAGE,
          sort: 0
        }
      ]
      const req: TweetCreateReq = {
        visibleType: VisibleTypeEnum.PUBLIC,
        retweetId: null,
        parentId: null,
        medias,
        content: '公有，好友可评论' + randomUUID(),
        longitude: 1,
        latitude: 1,
        address: '随机地址',
        commentLevel: CommentLevelEnum.FRIEND
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/post')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('发评论', async () => {
      const req: TweetCreateReq = {
        visibleType: VisibleTypeEnum.PUBLIC,
        retweetId: null,
        parentId: '65d420bc3b12431adc16657f',
        medias: [],
        content: '这是评论' + randomUUID(),
        longitude: 1,
        latitude: 1,
        address: '随机地址',
        commentLevel: CommentLevelEnum.FRIEND
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/post')
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

  describe('列表查询', () => {
    it('评论列表', async () => {
      const req: TweetCommentPageReq = {
        tweetId: '65d420bc3b12431adc16657f',
        limit: 10,
        page: 1
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/comment/page')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('推荐列表', async () => {
      const req: TweetPageReq = {
        limit: 10,
        page: 1
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/recommend/page')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('好友列表', async () => {
      const req: TweetPageReq = {
        limit: 10,
        page: 1
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/friend/page')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })
    it('我的列表', async () => {
      const req: TweetPageReq = {
        limit: 10,
        page: 1
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/mine/page')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(JSON.stringify(res.body))
        })
    })
  })

  describe('其他操作', () => {
    it('转发/取消转发', async () => {
      const req: TweetRetweetReq = {
        tweetId: '65d420bc3b12431adc16657f'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/retweet')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .then(res => {
          console.log(res.body)
        })
    })

    it('点赞/取消点赞', async () => {
      const req: TweetRetweetReq = {
        tweetId: '65d420bc3b12431adc16657f'
      }
      const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
      return await request(app.getHttpServer())
        .post(BASE_PATH + '/vote')
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
