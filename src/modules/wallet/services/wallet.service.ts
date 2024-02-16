import { WalletTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma, Wallet } from '@prisma/client'

@Injectable()
export class WalletService {
  constructor (
    private readonly prisma: PrismaService
  ) {
  }

  async findByUid (uid: string): Promise<Wallet> {
    return await this.prisma.wallet.findFirstOrThrow({
      where: { uid }
    })
  }

  // 普通钱包操作
  async addAmount (uid: string, amount: number): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findFirstOrThrow({
      where: {
        uid,
        type: WalletTypeEnum.NORMAL
      }
    })
    return await this.prisma.wallet.update({
      where: {
        id: wallet.id,
        type: WalletTypeEnum.NORMAL
      },
      data: {
        balance: wallet.balance + amount
      }
    })
  }

  // 系统账户划转
  // async useSystemWallet (amount: number): Promise<Wallet> {

  // }

  async findSystemWallet (): Promise<string> {
    const wallet = await this.prisma.wallet.findFirstOrThrow({
      where: {
        type: WalletTypeEnum.SYSTEM
      }
    })
    return wallet.id
  }

  async lock (uid: string): Promise<boolean> {
    // todo
    return true
  }

  async unlock (uid: string): Promise<boolean > {
    return true
  }

  async checkAmount (uid: string, amount: number): Promise<boolean> {
    const wallet = await this.findByUid(uid)
    return wallet.balance > amount
  }
}
