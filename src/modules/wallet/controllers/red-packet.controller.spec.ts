import { AppModule } from '@/app.module'
import { ActiveEnum, BillInOutEnum, BillTypeEnum, WalletTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { SystemService } from '@/modules/common/services/system.service'
import testUtil from '@/utils/test-util'
import { buildWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Prisma } from '@prisma/client'
import { Wallet } from 'ethers'
import * as request from 'supertest'
import { BillRecordReq } from './wallet.dto'

describe('RedPacketController', () => {
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

  describe('创建红包', () => {
    it('创建群红包-普通', async () => {

    })
    it('创建群红包-拼手气', async () => {

    })
    it('创建群红包-专属', async () => {

    })
    it('创建个人红包-普通', async () => {

    })
  })

  it('获取红包摘要', async () => {

  })

  it('获取红包详情', async () => {

  })

  it('抢红包', async () => {

  })
})
