
import { PrismaService } from '@/modules/common/services/prisma.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { UserService } from '../../user/services/user.service'
import { Wallet } from 'ethers'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { SystemService } from '@/modules/common/services/system.service'
import { buildWallet } from '@/utils/web3'
import testUtil from '@/utils/test-util'
import * as request from 'supertest'
import { Prisma } from '@prisma/client'
import { ActiveEnum } from '@/enums'
import { AppPageReq, AppTagItem } from './apps.dto'
describe('AppsController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prismaService: PrismaService
  let userService: UserService

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
    customWallet = buildWallet(customPk)
    customId = customWallet.address
    userService = app.get<UserService>(UserService)
  })

  it('初始化应用数据', async () => {
    const list: Prisma.AppCreateInput[] = []
    const tags: AppTagItem[] = [
      { name: '蓝色', color: 'blue' },
      { name: '红色', color: 'red' },
      { name: '黄色', color: 'yellow' }
    ]
    const categories = await prismaService.sysCategory.findMany()
    for (let index = 0; index < 10; index++) {
      const item: Prisma.AppCreateInput = {
        name: '测试应用' + index.toString(),
        icon: 'https://avatars.githubusercontent.com/u/122279700',
        desc: '应用描述',
        url: 'https://www.baidu.com',
        detailImages: [],
        sort: index,
        status: ActiveEnum.ACTIVE,
        tags: [JSON.parse(JSON.stringify(tags[index % tags.length]))],
        categoryIds: [categories[index % categories.length].id],
        author: '应用作者',
        activeAt: new Date(),
        avgStar: 0,
        installCount: 0
      }
      list.push(item)
    }
    await prismaService.app.createMany({ data: list })
  })

  it('应用分页', async () => {
    const req: AppPageReq = {
      page: 1,
      limit: 10,
      categoryId: '65c23782f904835bb73a66c0'
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/apps/page')
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
