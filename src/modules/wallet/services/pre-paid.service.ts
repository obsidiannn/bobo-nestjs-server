import { ActiveEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, Injectable } from '@nestjs/common'
import { PrePaidCard } from '@prisma/client'

@Injectable()
export class PrePaidService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findActiveByCardNo (cardNo: string): Promise<PrePaidCard | null> {
    const result = await this.prisma.prePaidCard.findFirst({
      where: {
        code: cardNo,
        status: ActiveEnum.ACTIVE
      }
    })
    return result
  }

  async useCard (uid: string, card: PrePaidCard): Promise<number> {
    const result = await this.prisma.prePaidCard.update({
      where: {
        id: card.id
      },
      data: {
        status: ActiveEnum.INACTIVE,
        convertUid: uid,
        updatedAt: new Date()
      }
    })
    return result.amount
  }
}
