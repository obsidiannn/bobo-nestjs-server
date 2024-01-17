import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Prisma, Group, GroupMembers, User } from '@prisma/client'
import { GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq } from '@/dto/group'
import { BaseIdReq, CommonEnum } from '@/dto/common'
import commonUtil from '@/util/common.util'
import { GroupMemberStatus } from '@/enums'
import { UserService } from './user.service'
import { randomUUID } from 'crypto'
@Injectable()
export class GroupService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) { }

  async create (data: Prisma.GroupCreateInput): Promise<Group> {
    return await this.prisma.group.create({ data })
  }

  async getGroupMembers (param: BaseIdReq): Promise<GroupMembers[]> {
    return await this.prisma.groupMembers.findMany({
      where: { groupId: { equals: param.id } }
    })
  }

  // 同意加入群聊
  async memberJoin (param: GroupApplyJoinReq): Promise<any> {
    const existMembers = await this.prisma.groupMembers.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: param.uids },
        status: { equals: GroupMemberStatus.PENDING }
      }
    })
    if (existMembers.length > 0) {
      // 当前存在的申请记录
      const existIds: string[] = existMembers.map(e => e.id)

      await this.prisma.groupMembers.updateMany({
        where: {
          groupId: { equals: param.id },
          uid: { in: existIds }
        },
        data: {
          status: GroupMemberStatus.NORMAL
        }
      })
    }
  }

  // 邀请加入群聊
  async inviteMember (param: GroupInviteJoinReq): Promise<any> {
    const uIds = param.items.map(i => i.uid)
    const existMembers = await this.prisma.groupMembers.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: uIds }
      }
    })
    if (existMembers.length <= 0) {
      const users: User[] = await this.userService.findByIds(uIds)
      const members: Prisma.GroupMembersCreateInput[] = users.map(u => {
        const member: Prisma.GroupMembersCreateInput = {
          id: randomUUID(),
          groupId: param.id,
          uid: u.unionId,
          encPri: '',
          encKey: '',
          inviteUid: 'todo',
          role: 3,
          joinType: 1,
          myAlias: u.name,
          status: CommonEnum.ON,
          banType: CommonEnum.ON
        }
        return member
      })
      await this.prisma.groupMembers.createMany({ data: members })
    }
  }

  // 踢出群聊
  async memberKickOut (param: GroupKickOutReq): Promise<any> {

  }
  // async create (param: any): Promise<any> {

  // }
  // async create (param: any): Promise<any> {

  // }
  // async create (param: any): Promise<any> {

  // }
  // async create (param: any): Promise<any> {

  // }
}
