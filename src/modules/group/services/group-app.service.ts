import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { Injectable } from '@nestjs/common'
import { App, GroupApp, Prisma } from '@prisma/client'

@Injectable()
export class GroupAppService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {

  }

  async findByGroupId (groupId: string): Promise<GroupApp[]> {
    const data = await this.prisma.groupApp.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' }
    })
    return data
  }

  async addApp (groupId: string, appId: string): Promise<GroupApp> {
    const entity = await this.prisma.groupApp.findFirst({
      where: { groupId, appId }
    })
    if (entity === null) {
      const input: Prisma.GroupAppCreateInput = {
        groupId,
        appId
      }
      return await this.prisma.groupApp.create({ data: input })
    }
    return entity
  }

  async removeApp (groupId: string, appId: string): Promise<void> {
    await this.prisma.groupApp.deleteMany({
      where: {
        groupId, appId
      }
    })
  }
}
