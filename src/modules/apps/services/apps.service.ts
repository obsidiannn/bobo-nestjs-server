import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { Injectable } from '@nestjs/common'
import { AppPageReq } from '../controllers/apps.dto'
import { BasePageResp } from '@/modules/common/dto/common.dto'
import { App, Prisma } from '@prisma/client'
import { ActiveEnum } from '@/enums'
import commonUtil from '@/utils/common.util'

@Injectable()
export class AppsService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) { }

  async findById (appId: string): Promise<App> {
    return await this.prisma.app.findFirstOrThrow({
      where: { id: appId }
    })
  }

  async findByIdIn (appIds: string[], query?: Prisma.AppSelect): Promise<App[]> {
    const apps = await this.prisma.app.findMany({
      where: { id: { in: appIds } },
      select: query
    })
    return apps
  }

  async findActiveApps (param: AppPageReq): Promise<BasePageResp<App>> {
    const query: Prisma.AppFindManyArgs = {
      where: {
        status: ActiveEnum.ACTIVE
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: commonUtil.pageSkip(param),
      take: param.limit
    }
    if (param.categoryId !== null && param.categoryId !== undefined) {
      query.where = {
        categoryIds: { has: param.categoryId },
        ...query.where
      }
    }
    const data = await this.prisma.app.findMany(query)
    return new BasePageResp(param, data, await this.prisma.app.count({ where: { ...query.where } }))
  }

  /**
   * 某个群组对于一批app的安装状态
   * @param appIds
   * @param groupId
   * @returns
   */
  async groupInstalledHash (appIds: string[], groupId: string): Promise<Map<string, boolean>> {
    const data = await this.prisma.groupApp.findMany({
      where: {
        groupId,
        appId: { in: appIds }
      },
      select: {
        appId: true
      }
    })
    const appIdSet = new Set<string>(data.map(d => d.appId))
    const result = new Map<string, boolean>()
    appIds.forEach(id => {
      result.set(id, appIdSet.has(id))
    })
    return result
  }

  // 应用是否安装过
  async hasInstalled (groupId: string, appId: string): Promise<boolean> {
    return await this.prisma.groupApp.count({
      where: {
        groupId,
        appId
      }
    }) > 0
  }
}
