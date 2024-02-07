import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { BillDetail, Prisma } from '@prisma/client'

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

  async create (input: Prisma.BillDetailCreateInput): Promise<BillDetail> {
    return await this.prisma.billDetail.create({
      data: input
    })
  }
}
