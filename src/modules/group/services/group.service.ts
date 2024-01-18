import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import { Prisma, Group, GroupMembers, User } from '@prisma/client'
import {
  GroupMemberReq,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupInfoItem,
  MineGroupInfoItem, GroupDetailItem
} from '@/modules/group/controllers/group.dto'
import { BaseIdReq, BasePageResp, CommonEnum, BaseIdsArrayReq } from '@/modules/common/dto/common.dto'
import { GroupMemberStatus } from '@/enums'
import { UserService } from '@/modules/user/services/user.service'
import { randomUUID } from 'crypto'
import { Request } from 'express'
import commonUtil, { virtualCurrentUser } from '@/utils/common.util'

@Injectable()
export class GroupService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) { }

  async findOne (groupId: string): Promise<Group> {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId }
    })
    if (group === null) {
      throw new HttpException('未找到数据', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return group
  }

  async create (data: Prisma.GroupCreateInput): Promise<Group> {
    // 创建群组 + 创建群成员
    const currentUser = await this.userService.findById(data.ownerId)
    if (currentUser === null) {
      throw new HttpException('error', HttpStatus.BAD_REQUEST)
    }
    const group = await this.prisma.group.create({ data })
    const member: Prisma.GroupMembersCreateInput = {
      id: randomUUID(),
      groupId: group.id,
      uid: data.ownerId,
      encPri: '',
      encKey: '',
      role: 1,
      joinType: 1,
      myAlias: currentUser.name,
      status: 1,
      banType: 1,
      adminAt: new Date(),
      packageExpiredAt: new Date(),
      createdAt: new Date()
    }
    await this.prisma.groupMembers.create({ data: member })
    return group
  }

  async getGroupMembers (param: GroupMemberReq): Promise<BasePageResp<GroupMembers>> {
    const data = await this.prisma.groupMembers.findMany({
      where: {
        groupId: { equals: param.id }
      },
      skip: commonUtil.pageSkip(param), // 计算需要跳过的数据量
      take: param.limit, // 指定每页取多少条数据
      orderBy: {
        createdAt: 'asc' // 按照创建时间降序排序，你可以根据需要修改排序字段和顺序
      }
    })
    return new BasePageResp(
      param, data, await this.prisma.groupMembers.count({
        where: { groupId: { equals: param.id } }
      })
    )
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
    const currentId = virtualCurrentUser()
    const uIds = param.items.map(i => i.uid)
    const existMembers = await this.prisma.groupMembers.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: uIds }
      }
    })
    const existIds = existMembers.map(u => u.uid)
    const saveIds = commonUtil.arrayDifference(uIds, existIds)
    if (saveIds.length > 0) {
      const users: User[] = await this.userService.findByIds(saveIds)
      const members: Prisma.GroupMembersCreateInput[] = users.map(u => {
        const member: Prisma.GroupMembersCreateInput = {
          id: randomUUID(),
          groupId: param.id,
          uid: u.unionId,
          encPri: '',
          encKey: '',
          inviteUid: currentId,
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
    const currentId = virtualCurrentUser()
    if (param.uids.includes(currentId)) {
      throw new HttpException('不可踢出自己', HttpStatus.BAD_REQUEST)
    }
    await this.checkGroupRole(param.id, currentId, [1, 2])
    return await this.prisma.groupMembers.deleteMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: param.uids }
      }
    })
  }

  // 我的群聊id
  async mineGroup (request: Request): Promise<string[]> {
    // todo 获取当前用户
    const uId = virtualCurrentUser()
    if (uId != null) {
      const mineGroups = await this.prisma.groupMembers.findMany({
        where: {
          uid: { equals: uId }
        }
      })
      return mineGroups.map(g => g.groupId)
    }
    return []
  }

  // 修改群名称
  async changeName (param: GroupChangeNameReq): Promise<any> {
    // const isAdmin = await this.isAdmin(param.id, '')
    // if (!isAdmin) {
    //   throw new HttpException('不是群组管理', HttpStatus.BAD_REQUEST)
    // }
    const uId = virtualCurrentUser()
    await this.checkGroupRole(param.id, uId, [1, 2])
    // const group: Group = this.findOne(param.id)
    const result = await this.prisma.group.update({
      where: { id: param.id },
      data: { name: param.name, updatedAt: new Date() }
    })
    if (result === null) {
      throw new HttpException('error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return result
  }

  // 修改群头像
  async changeAvatar (param: GroupChangeAvatarReq): Promise<any> {
    const uId = virtualCurrentUser()
    await this.checkGroupRole(param.id, uId, [1, 2])
    // const group: Group = this.findOne(param.id)
    const result = await this.prisma.group.update({
      where: { id: param.id },
      data: { avatar: param.avatar, updatedAt: new Date() }
    })
    if (result === null) {
      throw new HttpException('error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return result
  }

  // 修改群通告
  async changeNotice (param: GroupChangeNoticeReq): Promise<any> {
    const uId = virtualCurrentUser()
    await this.checkGroupRole(param.id, uId, [1, 2])
    // const group: Group = this.findOne(param.id)
    const result = await this.prisma.group.update({
      where: { id: param.id },
      data: {
        notice: param.notice,
        noticeMd5: param.noticeMd5,
        updatedAt: new Date()
      }
    })
    if (result === null) {
      throw new HttpException('error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return result
  }

  // 修改群简介
  async changeDesc (param: GroupChangeDescReq): Promise<any> {
    const uId = virtualCurrentUser()
    await this.checkGroupRole(param.id, uId, [1, 2])
    // const group: Group = this.findOne(param.id)
    const result = await this.prisma.group.update({
      where: { id: param.id },
      data: {
        desc: param.desc,
        descMd5: param.descMd5,
        updatedAt: new Date()
      }
    })
    if (result === null) {
      throw new HttpException('error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return result
  }

  // 修改我在群里面的昵称
  async changeAlias (param: GroupChangeAliasReq): Promise<any> {
    const uId = virtualCurrentUser()
    return await this.prisma.groupMembers.updateMany({
      where: {
        groupId: param.id,
        uid: uId
      },
      data: { myAlias: param.alias }
    })
  }

  // 退出群聊
  async quitGroup (param: BaseIdReq): Promise<any> {
    const uId = virtualCurrentUser()
    const groupRole = await this.groupRole(param.id, uId)
    if (groupRole === 1) {
      throw new HttpException('群主退群前请先进行转让或直接解散群聊', HttpStatus.BAD_REQUEST)
    }
    return await this.prisma.groupMembers.deleteMany({
      where: {
        groupId: param.id,
        uid: param.id
      }
    })
  }

  // 退出多个群聊
  async quitGroupBatch (param: BaseIdsArrayReq): Promise<any> {
    const uId = virtualCurrentUser()
    const ownerGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: uId,
        role: 1
      }
    })
    if (ownerGroups.length > 0) {
      const groups = await this.prisma.group.findMany({
        where: { id: { in: ownerGroups.map(m => m.groupId) } }
      })
      throw new HttpException('群' + groups.join(',') + '是群主，请直接解散群聊', HttpStatus.BAD_REQUEST)
    }
    return await this.prisma.groupMembers.deleteMany({
      where: {
        groupId: { in: param.ids },
        uid: uId
      }
    })
  }

  // 退出多个群聊
  async quitGroupAll (): Promise<any> {
    const uId = virtualCurrentUser()
    const ownerGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: uId,
        role: 1
      }
    })
    if (ownerGroups.length > 0) {
      const groups = await this.prisma.group.findMany({
        where: { id: { in: ownerGroups.map(m => m.groupId) } }
      })
      throw new HttpException('群' + groups.join(',') + '是群主，请直接解散群聊', HttpStatus.BAD_REQUEST)
    }
    return await this.prisma.groupMembers.deleteMany({
      where: {
        uid: uId
      }
    })
  }

  // 解散群组
  async dismissGroup (param: BaseIdsArrayReq): Promise<any> {
    const uId = virtualCurrentUser()
    const ownerGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: uId,
        role: { not: 1 }
      }
    })
    if (ownerGroups.length > 0) {
      const groups = await this.prisma.group.findMany({
        where: { id: { in: ownerGroups.map(m => m.groupId) } }
      })
      throw new HttpException('群' + groups.join(',') + '不是群主，没有权限', HttpStatus.BAD_REQUEST)
    }
    const member = await this.prisma.groupMembers.findMany({
      where: {
        groupId: { in: param.ids },
        uid: { equals: uId }
      }
    })
    if (member.length > 0) {
      const groupIds = member.filter(m => { return m.role === 1 }).map(m => m.groupId)
      if (groupIds.length > 0) {
        await this.prisma.groupMembers.deleteMany({
          where: { groupId: { in: groupIds } }
        })
        return await this.prisma.group.deleteMany({
          where: { id: { in: groupIds } }
        })
      }
    }
  }

  // 转移群组
  async transferGroup (param: GroupTransferReq): Promise<any> {
    const uId = virtualCurrentUser()
    await this.checkGroupRole(param.id, uId, [1])
    const member = await this.prisma.groupMembers.findFirst({
      where: {
        groupId: { equals: param.id },
        uid: { equals: param.uid }
      }
    })
    if (member === null) {
      throw new HttpException('必须是群组内成员', HttpStatus.BAD_REQUEST)
    }
    await this.prisma.groupMembers.update({
      where: {
        id: member.id
      },
      data: {
        role: 1
      }
    })
    return await this.prisma.groupMembers.updateMany({
      where: {
        groupId: { equals: param.id },
        uid: { equals: uId }
      },
      data: {
        role: 2
      }
    })
  }

  // 添加管理员
  async addGroupManager (param: GroupTransferReq): Promise<any> {
    const uId = virtualCurrentUser()
    await this.checkGroupRole(param.id, uId, [1])
    const member = await this.prisma.groupMembers.findFirst({
      where: {
        groupId: { equals: param.id },
        uid: { equals: param.uid }
      }
    })
    if (member === null) {
      const user = await this.userService.findById(param.uid)
      if (user != null) {
        const input: Prisma.GroupMembersCreateInput = this.userService.user2GroupMemberInput(user, param.id)
        input.role = 2
        return await this.prisma.groupMembers.create({ data: input })
      }
    } else {
      return await this.prisma.groupMembers.update({
        where: {
          id: member.id
        },
        data: {
          role: 2
        }
      })
    }
  }

  // 移除管理员(转为普通成员)
  async removeGroupManager (param: GroupApplyJoinReq): Promise<any> {
    const uId = virtualCurrentUser()
    if (param.uids.includes(uId)) {
      throw new HttpException('不可包含自己', HttpStatus.BAD_REQUEST)
    }
    await this.checkGroupRole(param.id, uId, [1])
    return await this.prisma.groupMembers.updateMany({
      where: {
        groupId: param.id,
        uid: { in: param.uids }
      },
      data: {
        role: 3
      }
    })
  }

  //  请求加入群组
  async requireJoin (param: BaseIdReq): Promise<void> {
    const currentId = virtualCurrentUser()
    const groupMember = await this.groupMemberById(param.id, currentId)
    if (groupMember !== null) {
      if (groupMember.status > 0) {
        throw new HttpException('已经加入群组', HttpStatus.BAD_REQUEST)
      } else {
        throw new HttpException('请等待管理审核', HttpStatus.BAD_REQUEST)
      }
    }

    const currentUser = await this.userService.findById(currentId)
    if (currentUser === null) {
      throw new HttpException('error', HttpStatus.BAD_REQUEST)
    }
    const member: Prisma.GroupMembersCreateInput = {
      id: randomUUID(),
      groupId: param.id,
      uid: currentId,
      encPri: '',
      encKey: '',
      inviteUid: currentId,
      role: 3,
      joinType: 1,
      myAlias: currentUser.name,
      status: CommonEnum.OFF,
      banType: CommonEnum.ON
    }
    await this.prisma.groupMembers.create({ data: member })
  }

  // 待审核申请列表 只有群主和管理员有权限
  async applyList (param: BaseIdsArrayReq): Promise<GroupInfoItem[]> {
    const uId = virtualCurrentUser()
    const managedGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: uId,
        role: { in: [1, 2] }
      }
    })
    if (managedGroups.length > 0) {
      const groupIds = managedGroups.map(g => g.groupId)
      const pendingMembers = await this.prisma.groupMembers.findMany({
        where: {
          status: GroupMemberStatus.PENDING,
          groupId: { in: groupIds }
        }
      })
      return pendingMembers.map(m => {
        const item: GroupInfoItem = {
          id: m.id,
          gid: m.groupId,
          uid: m.uid,
          encKey: m.encKey,
          role: m.role,
          status: m.status,
          createdAt: m.createdAt === null ? 0 : m.createdAt.getDate()
        }
        return item
      })
    }
    return []
  }

  // 我的申请列表
  async myPendingApplyList (param: BaseIdsArrayReq): Promise<MineGroupInfoItem[]> {
    const uId = virtualCurrentUser()
    const pendingList = await this.prisma.groupMembers.findMany({
      where: {
        uid: uId,
        status: GroupMemberStatus.PENDING
      }
    })
    return pendingList.map(m => {
      const item: MineGroupInfoItem = {
        id: m.id,
        gid: m.groupId,
        status: m.status,
        createdAt: m.createdAt === null ? 0 : m.createdAt.getDate()
      }
      return item
    })
  }

  // 批量获取群详情
  async groupDetailByIds (param: BaseIdsArrayReq): Promise<GroupDetailItem[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        id: { in: param.ids }
      }
    })
    return groups.map(g => {
      const item: GroupDetailItem = {
        id: g.id,
        gid: g.id,
        name: g.name,
        avatar: g.avatar,
        createdAt: g.createdAt === null ? 0 : g.createdAt.getDate(),
        memberLimit: g.memberLimit,
        total: g.total,
        pubKey: g.pubKey,
        ownerId: g.ownerId,
        creatorId: g.creatorId,
        notice: g.notice === null ? '' : g.notice,
        noticeMd5: g.noticeMd5 === null ? '' : g.noticeMd5,
        desc: g.desc === null ? '' : g.desc,
        descMd5: g.descMd5 === null ? '' : g.descMd5,
        cover: g.cover,
        isEnc: g.isEnc,
        type: g.type,
        banType: g.banType,
        searchType: g.searchType,
        status: g.status
      }
      return item
    })
  }

  // 群组权限检查
  async checkGroupRole (groupId: string, uId: string, roles: number[]): Promise<any> {
    const mRole = await this.groupRole(groupId, uId)
    if (!roles.includes(mRole)) {
      throw new HttpException('没有群组权限', HttpStatus.BAD_REQUEST)
    }
  }

  async groupMemberById (groupId: string, uId: string): Promise<GroupMembers | null> {
    return await this.prisma.groupMembers.findFirst({
      where: {
        groupId: { equals: groupId },
        uid: { equals: uId }
      }
    })
  }

  async groupRole (groupId: string, uId: string): Promise<number> {
    const member = await this.groupMemberById(groupId, uId)
    if (member === null) {
      throw new HttpException('不在群组内', HttpStatus.BAD_REQUEST)
    }
    return member.role
  }
}
