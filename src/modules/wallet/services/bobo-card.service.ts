import { ActiveEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, Injectable } from '@nestjs/common'
import { BoboCard } from '@prisma/client'

@Injectable()
export class BoboCardService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findActiveByCardNo (cardNo: string): Promise<BoboCard | null> {
    const result = await this.prisma.boboCard.findFirst({
      where: {
        boboCode: cardNo,
        status: ActiveEnum.ACTIVE
      }
    })
    return result
  }

  async useCard (uid: string, card: BoboCard): Promise<number> {
    const result = await this.prisma.boboCard.update({
      where: {
        id: card.id
      },
      data: {
        status: ActiveEnum.INACTIVE,
        convertUid: uid,
        updatedAt: new Date()
      }
    })
    return result.cardAmount
  }
}
