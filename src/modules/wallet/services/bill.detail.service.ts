import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { BillDetail } from '@prisma/client'

@Injectable()
export class BillDetailService {
  constructor (
    private readonly prisma: PrismaService
  ) {
  }

  async findOneByUIdAndBillId (uid: string, billId: string): Promise<BillDetail> {
    return await this.prisma.billDetail.findFirstOrThrow({
      where: {
        uid,
        billId
      }
    })
  }
}
