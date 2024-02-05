import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { SysTagTypeEnum } from '@/enums'
import { SysTag } from '@prisma/client'

@Injectable()
export class SystemTagService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findByType (tagType: SysTagTypeEnum): Promise<SysTag[]> {
    const result = await this.prisma.sysTag.findMany({
      where: {
        tagType
      },
      orderBy: {
        sort: 'asc'
      }
    })
    return result
  }
}
