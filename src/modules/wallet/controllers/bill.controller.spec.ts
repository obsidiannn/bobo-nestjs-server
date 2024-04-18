import { AppModule } from '@/app.module'
import { BillInOutEnum, BillTypeEnum, WalletTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { SystemService } from '@/modules/common/services/system.service'
import testUtil from '@/utils/test-util'
import { buildWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Wallet } from 'ethers'
import * as request from 'supertest'
import { BillRecordReq } from './wallet.dto'

describe('BillController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let prisma: PrismaService

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
    prisma = app.get<PrismaService>(PrismaService)
    customWallet = buildWallet(customPk)
    customId = customWallet.address
  })

  it('查看账单列表', async () => {
    const req = {
      page: 1,
      limit: 20,
      inOut: BillInOutEnum.OUTCOME,
      types: [BillTypeEnum.DRAW_CASH]
    }
    const reqStr = JSON.stringify(req)
    console.log('req body', reqStr)

    const params = testUtil.buildAuthParams(customPk, systemPublicKey, reqStr)
    return await request(app.getHttpServer())
      .post('/bill/records')
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
