import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { PrismaService } from '../services/prisma.service'
import { Prisma } from '@prisma/client'
import { SysCategoryTypeEnum } from '@/enums'
import testUtil from '@/utils/test-util'
import { SystemService } from '../services/system.service'
import * as request from 'supertest'

describe('SystemCategoryController', () => {
  let app: NestExpressApplication
  let systemService: SystemService
  let systemPublicKey: string
  let prisma: PrismaService
  let customPk: string
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    systemService = app.get<SystemService>(SystemService)
    const sysPubKeyResponse = systemService.getPubKey()
    if (sysPubKeyResponse === '' || sysPubKeyResponse === undefined) {
      throw new Error('pubKey is empty')
    }
    systemPublicKey = sysPubKeyResponse
    customPk = systemService.getTestUserId()
    prisma = app.get<PrismaService>(PrismaService)
  })

  it('初始化App 分类', async () => {
    const list: Prisma.SysCategoryCreateInput[] = []
    const cateName = ['分类1', '分类2', '分类3']
    for (let index = 0; index < cateName.length; index++) {
      const e: Prisma.SysCategoryCreateInput = {
        name: cateName[index],
        type: SysCategoryTypeEnum.APP,
        sort: index
      }
      list.push(e)
    }
    await prisma.sysCategory.createMany({ data: list })
  })

  it('初始化群 分类', async () => {
    const list: Prisma.SysCategoryCreateInput[] = []
    const cateName = ['科技', '军事', '信息', '政治',
      '游戏', '文学', '音乐', '美术',
      '闲聊', '交友', '动漫', '美剧',
      '宠物', '养生', '体育', '健身',
      '娱乐圈'
    ]
    for (let index = 0; index < cateName.length; index++) {
      const e: Prisma.SysCategoryCreateInput = {
        name: cateName[index],
        type: SysCategoryTypeEnum.GROUP,
        sort: index
      }
      list.push(e)
    }
    await prisma.sysCategory.createMany({ data: list })
  })

  it('app tag列表', async () => {
    const req = {
      type: SysCategoryTypeEnum.APP
    }
    return await request(app.getHttpServer())
      .post('/system/tags/list')
      .send({
        data: req
      })
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })
})
