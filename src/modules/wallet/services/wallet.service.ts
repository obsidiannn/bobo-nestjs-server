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
}
