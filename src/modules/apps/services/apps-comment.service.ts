import { Injectable } from '@nestjs/common'
import { AppCommentItem, AppCommentPageReq } from '../controllers/apps.dto'
import { BasePageResp } from '@/modules/common/dto/common.dto'
import { PrismaService } from '@/modules/common/services/prisma.service'
import commonUtil from '@/utils/common.util'
import { AppComment, Prisma } from '@prisma/client'

@Injectable()
export class AppCommentService {
  constructor (private readonly prisma: PrismaService) {}

  async create (input: Prisma.AppCommentCreateInput): Promise<AppComment> {
    return await this.prisma.appComment.create({ data: input })
  }

  // 应用分页
  async findPage (param: AppCommentPageReq): Promise<BasePageResp<AppComment>> {
    const data = await this.prisma.appComment.findMany({
      where: { appId: param.appId },
      orderBy: {
        createdAt: 'desc'
      },
      skip: commonUtil.pageSkip(param),
      take: param.limit
    })
    const total: number = await this.prisma.appComment.count({
      where: { appId: param.appId }
    })
    return new BasePageResp(param, data, total)
  }
}
