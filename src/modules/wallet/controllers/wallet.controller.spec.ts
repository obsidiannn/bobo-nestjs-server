import { AppModule } from '@/app.module'
import { ActiveEnum, WalletTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { SystemService } from '@/modules/common/services/system.service'
import testUtil from '@/utils/test-util'
import { buildWallet } from '@/utils/web3'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { Wallet } from 'ethers'
import * as request from 'supertest'

describe('WalletController', () => {
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

  it('初始化当前用户的wallet', async () => {
    const users = await prisma.user.findMany({})
    const walletInputs = users.map(u => {
      const wallet: Prisma.WalletCreateInput = {
        uid: u.id,
        balance: 0,
        currency: 1,
        type: WalletTypeEnum.NORMAL
      }
      return wallet
    })
    await prisma.wallet.createMany({ data: walletInputs })
  })

  // it('初始化系统用户及wallet', async () => {
  //   const sysUserInput: Prisma.OfficalUserCreateInput = {
  //     name: 'admin',
  //     avatar: 'https://avatars.githubusercontent.com/u/122279700',
  //     desc: '这是系统用户',
  //     status: 1
  //   }
  //   const sysUser = await prisma.officalUser.create({ data: sysUserInput })
  //   const walletInput: Prisma.WalletCreateInput = {
  //     uid: sysUser.id,
  //     balance: 0,
  //     currency: 1,
  // type: WalletTypeEnum.SYSTEM
  //   }
  //   await prisma.wallet.createMany({ data: walletInput })
  // })

  it('我的钱包', async () => {
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, {})
    return await request(app.getHttpServer())
      .post('/wallet/detail')
      .send({
        data: params.encData
      })
      .set(params.headers)
      .expect(200)
      .then(res => {
        console.log(res.body)
      })
  })

  it('批量创建礼品卡', async () => {
    const list: Prisma.PrePaidCardCreateInput[] = []
    for (let index = 0; index < 10; index++) {
      const item: Prisma.PrePaidCardCreateInput = {
        code: randomUUID(),
        status: ActiveEnum.ACTIVE,
        amount: 100000
      }
      list.push(item)
    }
    await prisma.prePaidCard.createMany({ data: list })
  })

  it('礼品卡充值', async () => {
    const card = await prisma.prePaidCard.findFirst({
      where: {
        status: ActiveEnum.ACTIVE
      }
    })
    if (card === null) {
      throw new Error()
    }
    const req = {
      cardNo: card.code
    }
    const params = testUtil.buildAuthParams(customPk, systemPublicKey, req)
    return await request(app.getHttpServer())
      .post('/wallet/fill/bobo-card')
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
