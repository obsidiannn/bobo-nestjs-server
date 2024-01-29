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
import { GroupMemberRoleEnum, GroupMemberStatus } from '@/enums'
import { UserService } from '@/modules/user/services/user.service'
import commonUtil from '@/utils/common.util'
import { ChatService } from '@/modules/message/services/chat.service'
import { ChatStatusEnum, ChatTypeEnum } from '@/modules/message/controllers/chat.dto'
import { MessageService } from '@/modules/message/services/message.service'

@Injectable()
export class GroupService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService
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

  async findByIds (groupIds: string[]): Promise<Group[]> {
    return await this.prisma.group.findMany({
      where: { id: { in: groupIds } }
    })
  }

  async deleteByIds (groupIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.group.deleteMany({
      where: { id: { in: groupIds } }
    })
  }

  /**
   * 创建群组 + 创建群成员
   * @param currentUserId
   * @param param
   * @returns group entity
   */
  async create (currentUserId: string, data: Prisma.GroupCreateInput): Promise<Group> {
    data.ownerId = currentUserId
    return await this.prisma.group.create({ data })
  }

  /**
   * 获取群成员
   * @param param
   * @returns
   */
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

  /**
   * 同意加入群聊
   * @param currentUserId
   * @param param
   */
  async memberJoin (currentUserId: string, param: GroupApplyJoinReq): Promise<any> {
    await this.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
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
      await this.chatService.addChatGroupMember(param.id, existIds)
    }
  }

  // 修改群名称
  async changeName (groupId: string, name: string): Promise<Group> {
    return await this.prisma.group.update({
      where: { id: groupId },
      data: { name, updatedAt: new Date() }
    })
  }

  // 修改群头像
  async changeAvatar (groupId: string, avatar: string): Promise<Group> {
    return await this.prisma.group.update({
      where: { id: groupId },
      data: { avatar, updatedAt: new Date() }
    })
  }

  // 修改群通告
  async changeNotice (currentUserId: string, param: GroupChangeNoticeReq): Promise<Group> {
    return await this.prisma.group.update({
      where: { id: param.id },
      data: {
        notice: param.notice,
        noticeMd5: param.noticeMd5,
        updatedAt: new Date()
      }
    })
  }

  // 修改群简介
  async changeDesc (currentUserId: string, param: GroupChangeDescReq): Promise<Group> {
    return await this.prisma.group.update({
      where: { id: param.id },
      data: {
        desc: param.desc,
        descMd5: param.descMd5,
        updatedAt: new Date()
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
      groupId: param.id,
      uid: currentUserId,
      encPri: param.encPri,
      encKey: param.encKey,
      inviteUid: currentUserId,
      role: GroupMemberRoleEnum.MEMBER,
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
 
}
