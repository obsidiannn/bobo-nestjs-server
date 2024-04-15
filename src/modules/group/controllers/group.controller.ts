import { Body, Controller, HttpException, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common'
import {
  GroupCreateReq, GroupMemberReq, GroupDescResp,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq, GroupMemberItem,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq, GroupNoticeResp,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupApplyItem,
  MineGroupInfoItem, GroupDetailItem, GroupRequireJoinReq, GroupInviteJoinItem, GroupInfoItem, GroupIdsReq
} from '@/modules/group/controllers/group.dto'
import { BaseIdReq, BaseIdsArrayReq, BasePageResp, BaseArrayResp, CommonEnum } from '@/modules/common/dto/common.dto'
import { GroupService } from '../services/group.service'
import { Request } from 'express'
import { Prisma } from '@prisma/client'

import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '@/modules/user/services/user.service'
import { ChatService } from '@/modules/message/services/chat.service'
import { GroupMemberRoleEnum, GroupMemberStatus, ChatStatusEnum, ChatTypeEnum, GroupStatusEnum } from '@/enums'
import { GroupMemberService } from '../services/group-member.service'
import commonUtil from '@/utils/common.util'
import { MessageService } from '@/modules/message/services/message.service'
import { TransactionInterceptor } from '@/modules/common/interceptors/transaction.interceptor'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'

@Controller('groups')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class GroupController {
  constructor (
    private readonly groupService: GroupService,
    private readonly groupMemberService: GroupMemberService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly prisma: PrismaService
  ) { }

  // 创建群聊
  @Post('create')
  // @Transaction()
  async create (@Req() req: Request, @Body() param: GroupCreateReq): Promise<void> {
    const currentUserId: string = req.uid
    const data: Prisma.GroupCreateInput = {
      id: param.id,
      pubKey: param.pubKey,
      avatar: param.avatar,
      name: param.name,
      isEnc: param.isEnc,
      type: param.type,
      banType: param.banType,
      searchType: param.searchType,
      creatorId: currentUserId,
      ownerId: currentUserId,
      cover: '1',
      status: GroupStatusEnum.ENABLE
    }
    console.log('group create:', param)

    await this.prisma.$transaction(async (tx) => {
      const currentUser = await this.userService.findById(currentUserId)
      if (currentUser === null) {
        throw new HttpException('error', HttpStatus.BAD_REQUEST)
      }

      const group = await this.groupService.create(currentUserId, data)
      // const a = 1
      // if (a === 1) {
      //   throw new HttpException('test', 400)
      // }
      const member: Prisma.GroupMembersCreateInput = {
        groupId: group.id,
        uid: data.ownerId,
        encPri: param.encPri,
        encKey: param.encKey,
        role: GroupMemberRoleEnum.OWNER,
        joinType: 1,
        myAlias: currentUser.name,
        status: 1,
        banType: 1,
        adminAt: new Date(),
        packageExpiredAt: new Date(),
        createdAt: new Date()
      }
      await this.groupMemberService.createMany([member])
      await this.chatService.addGroupChat(currentUserId, {
        groupId: group.id,
        type: ChatTypeEnum.GROUP,
        status: ChatStatusEnum.ENABLE,
        isEnc: group.isEnc
      })
    })
  }

  // 获取群聊用户分页
  @Post('members')
  async getMembers (@Req() req: Request, @Body() param: GroupMemberReq): Promise<BasePageResp<GroupMemberItem>> {
    const result = await this.groupService.getGroupMembers(param)
    const data = result.items.map(i => {
      const dto: GroupMemberItem = { ...i, gid: i.groupId }
      return dto
    })
    return result.transfer(data)
  }

  // 邀请加入群聊
  @Post('invite-join')
  async inviteMember (@Req() req: Request, @Body() param: GroupInviteJoinReq): Promise<void> {
    const currentUserId = req.uid
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.OWNER, GroupMemberRoleEnum.MANAGER])
    const uIds = param.items.map(i => i.uid)
    const existMembers = await this.groupMemberService.findByGroupIdAndUidIn(param.id, uIds)
    const itemHash = new Map()
    param.items.forEach(i => {
      itemHash.set(i.uid, i)
    })
    const existIds = existMembers.map(u => u.uid)
    // 求差集
    const saveIds = commonUtil.arrayDifference(uIds, existIds)
    if (saveIds.length > 0) {
      const users = await this.userService.findByIds(saveIds)
      const members: Prisma.GroupMembersCreateInput[] = users
        .filter(u => itemHash.has(u.id)).map(u => {
          const item: GroupInviteJoinItem = itemHash.get(u.id)
          const member: Prisma.GroupMembersCreateInput = {
            groupId: param.id,
            uid: u.id,
            encPri: item.encPri ?? '',
            encKey: item.encKey,
            inviteUid: currentUserId,
            role: GroupMemberRoleEnum.MEMBER,
            joinType: 1,
            myAlias: u.name,
            status: CommonEnum.ON,
            banType: CommonEnum.ON
          }
          return member
        })
      await this.groupMemberService.createMany(members)
      await this.chatService.addChatGroupMember(param.id, members.map(u => u.uid))
    }
  }

  // 踢出群聊
  @Post('kick-out')
  async memberKickOut (@Req() req: Request, @Body() param: GroupKickOutReq): Promise<void> {
    const currentUserId = req.uid
    if (param.uids.includes(currentUserId)) {
      throw new HttpException('不可踢出自己', HttpStatus.BAD_REQUEST)
    }
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    await this.groupMemberService.deleteByGroupIdsAndUIdIn([param.id], param.uids)
    const chatIds = await this.chatService.removeChatGroupMember(param.id, param.uids)
    await this.messageService.clearMemberMessageByChatIds(param.uids, chatIds)
  }

  // 获取我的groupId
  @Post('list')
  async mineGroup (@Req() req: Request): Promise<BaseArrayResp<string>> {
    return { items: await this.groupMemberService.findGroupIdByUid(req.uid) }
  }

  @Post('list-by-ids')
  async groupList (@Req() req: Request, @Body() param: GroupIdsReq): Promise<BaseArrayResp<GroupInfoItem>> {
    const groups = await this.groupService.findByIds(param.gids)
    const result = groups.map(g => {
      const item: GroupInfoItem = {
        id: g.id,
        name: g.name,
        avatar: g.avatar,
        memberLimit: g.memberLimit,
        total: g.total,
        pubKey: g.pubKey,
        desc: g.desc ?? '',
        isEnc: g.isEnc
      }
      return item
    })
    return { items: result }
  }

  // 修改群名称
  @Post('update-name')
  async changeName (@Req() req: Request, @Body() param: GroupChangeNameReq): Promise<void> {
    await this.groupMemberService.checkGroupRole(param.id, req.uid, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    await this.groupService.changeName(param.id, param.name)
  }

  // 修改群头像
  @Post('update-avatar')
  async changeAvatar (@Req() req: Request, @Body() param: GroupChangeAvatarReq): Promise<void> {
    await this.groupMemberService.checkGroupRole(param.id, req.uid, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    await this.groupService.changeAvatar(param.id, param.avatar)
  }

  // 修改我在群里面的昵称
  @Post('update-alias')
  async changeAlias (@Req() req: Request, @Body() param: GroupChangeAliasReq): Promise<void> {
    await this.groupMemberService.changeAlias(req.uid, param.id, param.alias)
  }

  // 退出群聊
  @Post('quit')
  async quitGroup (@Req() req: Request, @Body() param: BaseIdReq): Promise<void> {
    const currentUserId = req.uid
    const groupMember = await this.groupMemberService.groupRole(param.id, currentUserId)
    if (groupMember.role === GroupMemberRoleEnum.OWNER) {
      throw new HttpException('群主退群前请先进行转让或直接解散群聊', HttpStatus.BAD_REQUEST)
    }
    await this.groupMemberService.deleteByGroupIdsAndUIdIn([param.id], [currentUserId])
    const chatIds = await this.chatService.removeChatGroupMember(param.id, [currentUserId])
    await this.messageService.clearMemberMessageByChatIds([currentUserId], chatIds)
  }

  // 退出多个群聊
  @Post('quit-batch')
  async quitGroupBatch (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    const currentUserId = req.uid
    const ownerGroups = await this.groupMemberService.findGroupIdByUidRole(currentUserId, param.ids, [GroupMemberRoleEnum.OWNER])
    if (ownerGroups.length > 0) {
      const groups = await this.groupService.findByIds(ownerGroups.map(g => g.groupId))
      throw new HttpException('群' + groups.map(g => g.name).join(',') + '是群主，请直接解散群聊', HttpStatus.BAD_REQUEST)
    }
    await this.groupMemberService.deleteByGroupIdsAndUIdIn(param.ids, [currentUserId])
    const chatIds = await this.chatService.removeChatGroupsMember(param.ids, currentUserId)
    await this.messageService.clearMemberMessageByChatIds([currentUserId], chatIds)
  }

  // 退出我的所有群聊
  @Post('quit-all')
  async quitGroupAll (@Req() req: Request, @Body() param: GroupInviteJoinReq): Promise<void> {
    const currentUserId = req.uid
    const ownerGroups = await this.groupMemberService.findGroupIdByUidRole(currentUserId, [], [GroupMemberRoleEnum.OWNER])
    if (ownerGroups.length > 0) {
      const groups = await this.groupService.findByIds(ownerGroups.map(g => g.groupId))
      throw new HttpException('群' + groups.map(g => g.name).join(',') + '是群主，请直接解散群聊', HttpStatus.BAD_REQUEST)
    }
    const queryMember = {
      where: {
        uid: currentUserId
      },
      select: {
        id: true,
        groupId: true
      }
    }
    const groups = await this.groupMemberService.findMany(queryMember)
    await this.groupMemberService.deleteByIds(groups.map(g => g.id))
    const chatIds = await this.chatService.removeChatGroupsMember(groups.map(g => g.groupId), currentUserId)
    await this.messageService.clearMemberMessageByChatIds([currentUserId], chatIds)
  }

  // 修改群通告
  @Post('update-notice')
  async changeNotice (@Req() req: Request, @Body() param: GroupChangeNoticeReq): Promise<void> {
    await this.groupMemberService.checkGroupRole(param.id, req.uid, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    await this.groupService.changeNotice(req.uid, param)
  }

  // 获取群通告
  @Post('get-notice')
  async getGroupNotice (@Req() req: Request, @Body() param: BaseIdReq): Promise<GroupNoticeResp> {
    const group = await this.groupService.findOne(param.id)
    return { id: group.id, notice: group.notice, noticeMd5: group.noticeMd5 }
  }

  // 获取群简介
  @Post('get-desc')
  async getGroupDesc (@Req() req: Request, @Body() param: BaseIdReq): Promise<GroupDescResp> {
    const group = await this.groupService.findOne(param.id)
    return { id: group.id, desc: group.desc, descMd5: group.descMd5 }
  }

  // 修改群简介
  @Post('update-desc')
  async changeDesc (@Req() req: Request, @Body() param: GroupChangeDescReq): Promise<void> {
    await this.groupMemberService.checkGroupRole(param.id, req.uid, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    await this.groupService.changeDesc(req.uid, param)
  }

  // 解散群组
  @Post('dismiss')
  async dismissGroup (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    const ownerGroups = await this.groupMemberService.findMany({
      where: {
        uid: req.uid,
        role: { not: GroupMemberRoleEnum.OWNER }
      }
    })
    if (ownerGroups.length > 0) {
      const groups = await this.groupService.findByIds(ownerGroups.map(m => m.groupId))
      throw new HttpException('群' + groups.join(',') + '不是群主，没有权限', HttpStatus.BAD_REQUEST)
    }
    const member = await this.groupMemberService.findMany({
      where: {
        groupId: { in: param.ids },
        uid: req.uid
      }
    })
    if (member.length > 0) {
      const groupIds = member.filter(m => { return m.role === GroupMemberRoleEnum.OWNER }).map(m => m.groupId)
      if (groupIds.length > 0) {
        await this.groupMemberService.deleteByGroupIds(groupIds)
        await this.groupService.deleteByIds(groupIds)
        const chatIds = await this.chatService.dropChatGroups(groupIds)
        await this.messageService.clearAllMessageByChatIds(req.uid, chatIds)
      }
    }
  }

  // 转移群组
  @Post('transfer')
  async transferGroup (@Req() req: Request, @Body() param: GroupTransferReq): Promise<void> {
    const currentUserId = req.uid
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.OWNER])
    const members = await this.groupMemberService.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { equals: param.uid }
      }
    })
    if (members.length <= 0) {
      throw new HttpException('必须是群组内成员', HttpStatus.BAD_REQUEST)
    }
    await this.groupMemberService.update(members[0].id, { role: GroupMemberRoleEnum.OWNER })
    await this.groupMemberService.updateMany({
      where: {
        groupId: { equals: param.id },
        uid: { equals: currentUserId }
      },
      data: {
        role: GroupMemberRoleEnum.MANAGER
      }
    })
  }

  // 添加管理员 todo
  @Post('add-admin')
  async addGroupManager (@Req() req: Request, @Body() param: GroupTransferReq): Promise<void> {
    const currentUserId = req.uid
    const group = await this.groupService.findOne(param.id)
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.OWNER])
    const members = await this.groupMemberService.findByGroupIdAndUidIn(param.id, [param.uid])
    if (members.length <= 0) {
      const newManager = await this.userService.findById(param.uid)
      if (newManager === null) {
        throw new HttpException('找不到此用户', HttpStatus.INTERNAL_SERVER_ERROR)
      }
      // // 组装 shareSecret
      if (newManager != null) {
        const input: Prisma.GroupMembersCreateInput = {
          groupId: param.id,
          uid: newManager.id,
          encPri: param.encPri,
          encKey: param.encKey,
          inviteUid: currentUserId,
          role: GroupMemberRoleEnum.MANAGER,
          joinType: 1,
          myAlias: newManager.name,
          status: CommonEnum.ON,
          banType: CommonEnum.ON
        }

        await this.groupMemberService.create(input)
        await this.chatService.addGroupChat(currentUserId, {
          groupId: param.id,
          type: ChatTypeEnum.GROUP,
          status: ChatStatusEnum.ENABLE,
          isEnc: group.isEnc
        })
      }
    } else {
      await this.groupMemberService.update(members[0].id,
        {
          role: GroupMemberRoleEnum.MANAGER
        })
    }
  }

  // 移除管理员
  @Post('remove-admin')
  async removeGroupManager (@Req() req: Request, @Body() param: GroupApplyJoinReq): Promise<void> {
    const currentUserId = req.uid
    if (param.uids.includes(currentUserId)) {
      throw new HttpException('不可包含自己', HttpStatus.BAD_REQUEST)
    }
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.OWNER])
    await this.groupMemberService.updateMany({
      where: {
        groupId: param.id,
        uid: { in: param.uids }
      },
      data: {
        role: GroupMemberRoleEnum.MEMBER
      }
    })
  }

  // 申请加入群聊
  @Post('require-join')
  async requireJoin (@Req() req: Request, @Body() param: GroupRequireJoinReq): Promise<void> {
    const currentUserId = req.uid
    const groupMember = await this.groupMemberService.groupMemberById(param.id, currentUserId)
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
    await this.groupMemberService.create(member)
  }

  // 同意加入群聊
  @Post('agree-join')
  async memberJoin (@Req() req: Request, @Body() param: GroupApplyJoinReq): Promise<void> {
    const currentUserId = req.uid
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    const existMembers = await this.groupMemberService.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: param.uids },
        status: { equals: GroupMemberStatus.PENDING }
      }
    })
    if (existMembers.length > 0) {
      // 当前存在的申请记录
      const existIds: string[] = existMembers.map(e => e.id)
      await this.groupMemberService.updateMany({
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

  // TODO: 拒绝加入群聊
  @Post('reject-join')
  async rejectMemberJoin (@Req() req: Request, @Body() param: GroupApplyJoinReq): Promise<void> {
    const currentUserId = req.uid
    await this.groupMemberService.checkGroupRole(param.id, currentUserId, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])
    const existMembers = await this.groupMemberService.findMany({
      where: {
        groupId: { equals: param.id },
        uid: { in: param.uids },
        status: { equals: GroupMemberStatus.PENDING }
      }
    })
    if (existMembers.length > 0) {
      // 当前存在的申请记录
      const existIds: string[] = existMembers.map(e => e.id)
      await this.groupMemberService.updateMany({
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

  // 待审核申请列表 只有群主和管理员有权限
  @Post('apply-list')
  async applyList (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<GroupApplyItem[]> {
    const currentUserId = req.uid
    const managedGroups = await this.groupMemberService.findMany({
      where: {
        uid: currentUserId,
        role: { in: [GroupMemberRoleEnum.OWNER, GroupMemberRoleEnum.MANAGER] }
      }
    })
    if (managedGroups.length > 0) {
      const groupIds = managedGroups.map(g => g.groupId)
      const pendingMembers = await this.groupMemberService.findMany({
        where: {
          status: GroupMemberStatus.PENDING,
          groupId: { in: groupIds }
        }
      })
      return pendingMembers.map(m => {
        const item: GroupApplyItem = {
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
  @Post('my-apply-list')
  async myPendingApplyList (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<MineGroupInfoItem[]> {
    const currentUserId = req.uid
    const pendingList = await this.groupMemberService.findMany({
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
        createdAt: m.createdAt
      }
      return item
    })
  }

  // 批量获取群详情
  @Post('get-batch-info')
  async groupDetailByIds (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<BaseArrayResp<GroupDetailItem>> {
    const groups = await this.groupService.findByIds(param.ids)
    const data = groups.map(g => {
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
    return { items: data }
  }
}
