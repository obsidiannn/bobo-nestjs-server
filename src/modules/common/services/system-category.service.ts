import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { SysCategory } from '@prisma/client'
import { SysCategoryTypeEnum } from '@/enums'
@Injectable()
export class SystemCategoryService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findByType (type: SysCategoryTypeEnum): Promise<SysCategory[]> {
    const result = await this.prisma.sysCategory.findMany({
      where: {
        type
      },
      orderBy: {
        sort: 'asc'
      }
    })
    return result
  }
}
