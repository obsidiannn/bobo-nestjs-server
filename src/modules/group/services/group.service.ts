import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import { Prisma, Group, GroupMembers, User } from '@prisma/client'
import {
  GroupCreateReq,
  GroupMemberReq, GroupInviteJoinItem,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupInfoItem,
  MineGroupInfoItem, GroupDetailItem, GroupRequireJoinReq
} from '@/modules/group/controllers/group.dto'
import { BaseIdReq, BasePageResp, CommonEnum, BaseIdsArrayReq } from '@/modules/common/dto/common.dto'
import { GroupMemberStatus } from '@/enums'
import { UserService } from '@/modules/user/services/user.service'
import { randomUUID } from 'crypto'
import commonUtil from '@/utils/common.util'

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
      throw new HttpException('group 未找到数据', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return group
  }

  // 创建群组 + 创建群成员
  async create (currentUserId: string, param: GroupCreateReq): Promise<Group> {
    const data: Prisma.GroupCreateInput = {
      ...param,
      creatorId: currentUserId,
      ownerId: currentUserId,
      pubKey: param.pubKey,
      cover: '1'
    }

    const currentUser = await this.userService.findById(currentUserId)
    if (currentUser === null) {
      throw new HttpException('error', HttpStatus.BAD_REQUEST)
    }

    const group = await this.prisma.group.create({ data })
    const member: Prisma.GroupMembersCreateInput = {
      groupId: group.id,
      uid: data.ownerId,
      encPri: param.encPri,
      encKey: param.encKey,
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
  async memberJoin (currentUserId: string, param: GroupApplyJoinReq): Promise<any> {
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
  async inviteMember (currentUserId: string, param: GroupInviteJoinReq): Promise<any> {
    const uIds = param.items.map(i => i.uid)
    const existMembers = await this.prisma.groupMembers.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: uIds }
      }
    })
    const itemHash = new Map()
    param.items.forEach(i => {
      itemHash.set(i.uid, i)
    })
    const existIds = existMembers.map(u => u.uid)
    const saveIds = commonUtil.arrayDifference(uIds, existIds)
    if (saveIds.length > 0) {
      const users: User[] = await this.userService.findByIds(saveIds)
      const members: Prisma.GroupMembersCreateInput[] = users
        .filter(u => itemHash.has(u.id)).map(u => {
          const item: GroupInviteJoinItem = itemHash.get(u.id)
          const member: Prisma.GroupMembersCreateInput = {
            id: randomUUID(),
            groupId: param.id,
            uid: u.id,
            encPri: item.encPri,
            encKey: item.encKey,
            inviteUid: currentUserId,
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
  async memberKickOut (currentUserId: string, param: GroupKickOutReq): Promise<any> {
    if (param.uids.includes(currentUserId)) {
      throw new HttpException('不可踢出自己', HttpStatus.BAD_REQUEST)
    }
    await this.checkGroupRole(param.id, currentUserId, [1, 2])
    return await this.prisma.groupMembers.deleteMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: param.uids }
      }
    })
  }

  // 我的群聊id
  async mineGroup (currentUserId: string): Promise<string[]> {
    // todo 获取当前用户

    if (currentUserId != null) {
      const mineGroups = await this.prisma.groupMembers.findMany({
        where: {
          uid: { equals: currentUserId }
        }
      })
      return mineGroups.map(g => g.groupId)
    }
    return []
  }

  // 修改群名称
  async changeName (currentUserId: string, param: GroupChangeNameReq): Promise<any> {
    // const isAdmin = await this.isAdmin(param.id, '')
    // if (!isAdmin) {
    //   throw new HttpException('不是群组管理', HttpStatus.BAD_REQUEST)
    // }
    await this.checkGroupRole(param.id, currentUserId, [1, 2])
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
  async changeAvatar (currentUserId: string, param: GroupChangeAvatarReq): Promise<any> {
    await this.checkGroupRole(param.id, currentUserId, [1, 2])
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
  async changeNotice (currentUserId: string, param: GroupChangeNoticeReq): Promise<any> {
    await this.checkGroupRole(param.id, currentUserId, [1, 2])
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
  async changeDesc (currentUserId: string, param: GroupChangeDescReq): Promise<any> {
    await this.checkGroupRole(param.id, currentUserId, [1, 2])
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
  async changeAlias (currentUserId: string, param: GroupChangeAliasReq): Promise<any> {
    return await this.prisma.groupMembers.updateMany({
      where: {
        groupId: param.id,
        uid: currentUserId
      },
      data: { myAlias: param.alias }
    })
  }

  // 退出群聊
  async quitGroup (currentUserId: string, param: BaseIdReq): Promise<any> {
    const groupRole = await this.groupRole(param.id, currentUserId)
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
  async quitGroupBatch (currentUserId: string, param: BaseIdsArrayReq): Promise<any> {
    const ownerGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: currentUserId,
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
        uid: currentUserId
      }
    })
  }

  // 退出多个群聊
  async quitGroupAll (currentUserId: string): Promise<any> {
    const ownerGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: currentUserId,
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
        uid: currentUserId
      }
    })
  }

  // 解散群组
  async dismissGroup (currentUserId: string, param: BaseIdsArrayReq): Promise<any> {
    const ownerGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: currentUserId,
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
        uid: { equals: currentUserId }
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
  async transferGroup (currentUserId: string, param: GroupTransferReq): Promise<any> {
    await this.checkGroupRole(param.id, currentUserId, [1])
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
        uid: { equals: currentUserId }
      },
      data: {
        role: 2
      }
    })
  }

  // 添加管理员
  async addGroupManager (currentUserId: string, param: GroupTransferReq): Promise<any> {
    await this.checkGroupRole(param.id, currentUserId, [1])
    const member = await this.prisma.groupMembers.findFirst({
      where: {
        groupId: { equals: param.id },
        uid: { equals: param.uid }
      }
    })
    if (member === null) {
      const user = await this.userService.findById(param.uid)
      if (user != null) {
        const input: Prisma.GroupMembersCreateInput = this.user2GroupMemberInput(user, param.id)
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
  async removeGroupManager (currentUserId: string, param: GroupApplyJoinReq): Promise<any> {
    if (param.uids.includes(currentUserId)) {
      throw new HttpException('不可包含自己', HttpStatus.BAD_REQUEST)
    }
    await this.checkGroupRole(param.id, currentUserId, [1])
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
  async requireJoin (currentUserId: string, param: GroupRequireJoinReq): Promise<void> {
    const groupMember = await this.groupMemberById(param.id, currentUserId)
    if (groupMember !== null) {
      if (groupMember.status > 0) {
        throw new HttpException('已经加入群组', HttpStatus.BAD_REQUEST)
      } else {
        throw new HttpException('请等待管理审核', HttpStatus.BAD_REQUEST)
      }
    }

    const currentUser = await this.userService.findById(currentUserId)
    if (currentUser === null) {
      throw new HttpException('error', HttpStatus.BAD_REQUEST)
    }
    const member: Prisma.GroupMembersCreateInput = {
      id: randomUUID(),
      groupId: param.id,
      uid: currentUserId,
      encPri: param.encPri,
      encKey: param.encKey,
      inviteUid: currentUserId,
      role: 3,
      joinType: 1,
      myAlias: currentUser.name,
      status: CommonEnum.OFF,
      banType: CommonEnum.ON
    }
    await this.prisma.groupMembers.create({ data: member })
  }

  // 待审核申请列表 只有群主和管理员有权限
  async applyList (currentUserId: string, param: BaseIdsArrayReq): Promise<GroupInfoItem[]> {
    const managedGroups = await this.prisma.groupMembers.findMany({
      where: {
        uid: currentUserId,
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
  async myPendingApplyList (currentUserId: string, param: BaseIdsArrayReq): Promise<MineGroupInfoItem[]> {
    const pendingList = await this.prisma.groupMembers.findMany({
      where: {
        uid: currentUserId,
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

  user2GroupMemberInput (user: User, groupId: string): Prisma.GroupMembersCreateInput {
    const member: Prisma.GroupMembersCreateInput = {
      id: randomUUID(),
      groupId,
      uid: user.id,
      encPri: '',
      encKey: '',
      inviteUid: 'todo',
      role: 3,
      joinType: 1,
      myAlias: user.name,
      status: CommonEnum.ON,
      banType: CommonEnum.ON
    }
    return member
  }
}
