import { GroupMemberRoleEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { GroupMembers, Prisma } from '@prisma/client'

@Injectable()
export class GroupMemberService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async createMany (data: Prisma.GroupMembersCreateInput[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.groupMembers.createMany({ data })
  }

  async create (data: Prisma.GroupMembersCreateInput): Promise<GroupMembers> {
    return await this.prisma.groupMembers.create({ data })
  }

  async update (id: string, data: Prisma.GroupMembersUpdateInput): Promise<GroupMembers> {
    return await this.prisma.groupMembers.update({
      where: { id },
      data
    })
  }

  async updateMany (param: Prisma.GroupMembersUpdateManyArgs): Promise<Prisma.BatchPayload> {
    return await this.prisma.groupMembers.updateMany(param)
  }

  async findMany (param: Prisma.GroupMembersFindManyArgs): Promise<GroupMembers[]> {
    return await this.prisma.groupMembers.findMany(param)
  }

  async deleteByIds (ids: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.groupMembers.deleteMany({
      where: { id: { in: ids } }
    })
  }

  async deleteByGroupIds (groupIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.groupMembers.deleteMany({
      where: { groupId: { in: groupIds } }
    })
  }

  async findByGroupIdAndUidIn (groupId: string, uIds: string[]): Promise<GroupMembers[]> {
    return await this.prisma.groupMembers.findMany({
      where: {
        groupId,
        uid: { in: uIds }
      }
    })
  }

  async deleteByGroupIdsAndUIdIn (groupIds: string[], uIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.groupMembers.deleteMany({
      where: {
        groupId: { in: groupIds },
        uid: { in: uIds }
      }
    })
  }

  // 我的群聊id
  async findGroupIdByUid (uId: string): Promise<string[]> {
    const mineGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: { equals: uId }
      },
      select: {
        groupId: true
      }
    })
    return mineGroups.map(g => g.groupId)
  }

  // 根据角色获取群身份
  async findGroupIdByUidRole (uId: string, groupIds: string[], roles: GroupMemberRoleEnum[]): Promise<GroupMembers[]> {
    return await this.prisma.groupMembers.findMany({
      where: {
        uid: uId,
        role: { in: roles },
        ...(groupIds.length > 0 && { groupId: { in: groupIds } })
      }
    })
  }

  // 修改群成员昵称
  async changeAlias (uId: string, groupId: string, alias: string): Promise<any> {
    return await this.prisma.groupMembers.updateMany({
      where: {
        groupId,
        uid: uId
      },
      data: { myAlias: alias }
    })
  }

  // 群组权限检查
  async checkGroupRole (groupId: string, uId: string, roles: GroupMemberRoleEnum[]): Promise<GroupMembers> {
    const groupMember = await this.groupRole(groupId, uId)
    if (!roles.includes(groupMember.role)) {
      throw new HttpException('没有群组权限', HttpStatus.BAD_REQUEST)
    }
    return groupMember
  }

  async groupMemberById (groupId: string, uId: string): Promise<GroupMembers | null> {
    return await this.prisma.groupMembers.findFirst({
      where: {
        groupId: { equals: groupId },
        uid: { equals: uId }
      }
    })
  }

  async groupRole (groupId: string, uId: string): Promise<GroupMembers> {
    const member = await this.groupMemberById(groupId, uId)
    if (member === null) {
      throw new HttpException('不在群组内', HttpStatus.BAD_REQUEST)
    }
    return member
  }
}
