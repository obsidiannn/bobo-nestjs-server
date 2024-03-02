import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { SearchReq, SearchResultItem } from '../controllers/tweet.dto'
import { BasePageResp } from '@/modules/common/dto/common.dto'
import commonUtil from '@/utils/common.util'
import { Prisma } from '@prisma/client'
import { BusinessTypeEnum, GroupStatusEnum, SourceSearchTypeEnum } from '@/enums'

@Injectable()
export class SearchService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  /**
   * 检索群组
   * @param param
   * @returns
   */
  async searchGroup (param: SearchReq): Promise<BasePageResp<SearchResultItem>> {
    const where: Prisma.GroupWhereInput = {
      OR: [
        { name: { contains: param.keyword } },
        { desc: { contains: param.keyword } }
      ],
      searchType: SourceSearchTypeEnum.ALLOW,
      status: GroupStatusEnum.ENABLE
    }
    const groups = await this.prisma.group.findMany({
      where,
      select: {
        id: true, name: true, tags: true, desc: true, total: true
      },
      orderBy: { weight: 'desc' },
      skip: commonUtil.pageSkip(param),
      take: param.limit
    })

    const result = groups.map(g => {
      const dto: SearchResultItem = {
        sourceId: g.id,
        sourceType: BusinessTypeEnum.GROUP,
        label: g.name,
        desc: g.desc,
        memberCount: g.total,
        tags: JSON.parse(JSON.stringify(g.tags))
      }
      return dto
    })
    const total = await this.prisma.group.count({ where })
    return new BasePageResp(param, result, total)
  }
}
