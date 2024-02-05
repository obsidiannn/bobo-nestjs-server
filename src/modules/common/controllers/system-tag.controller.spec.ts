import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { PrismaService } from '../services/prisma.service'
import { Prisma } from '@prisma/client'
import { SysTagTypeEnum } from '@/enums'
import testUtil from '@/utils/test-util'
import { SystemService } from '../services/system.service'
import * as request from 'supertest'

describe('SystemTagController', () => {
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

  it('初始化App tags', async () => {
    const list: Prisma.SysTagCreateInput[] = []
    const colorName = ['红色', '绿色', '黄色']
    const colorValue = ['red', 'green', 'yellow']
    for (let index = 0; index < colorName.length; index++) {
      const config = { color: colorValue[index] }
      const e: Prisma.SysTagCreateInput = {
        name: colorName[index],
        tagType: SysTagTypeEnum.APP,
        sort: index,
        config: JSON.stringify(config)
      }
      list.push(e)
    }
    await prisma.sysTag.createMany({ data: list })
  })

  it('app tag列表', async () => {
    const req = {
      type: SysTagTypeEnum.APP
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
