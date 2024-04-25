import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import { Prisma, Group, GroupMembers, User } from '@prisma/client'
import {
  GroupCreateReq,
  GroupMemberReq, GroupInviteJoinItem,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq,
  MineGroupInfoItem, GroupDetailItem, GroupRequireJoinReq
} from '@/modules/group/controllers/group.dto'
import { BaseIdReq, BasePageResp, CommonEnum, BaseIdsArrayReq } from '@/modules/common/dto/common.dto'
import { GroupMemberRoleEnum, GroupMemberStatus, ChatStatusEnum, ChatTypeEnum } from '@/enums'
import { UserService } from '@/modules/user/services/user.service'
import commonUtil from '@/utils/common.util'
import { ChatService } from '@/modules/message/services/chat.service'
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
  async getGroupMembersById (gid: string): Promise<GroupMembers[]> {
    const data = await this.prisma.groupMembers.findMany({
      where: {
        groupId: gid
      },
      orderBy: {
        createdAt: 'asc' // 按照创建时间降序排序，你可以根据需要修改排序字段和顺序
      }
    })
    return data
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
}
