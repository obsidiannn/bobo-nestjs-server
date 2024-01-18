import { Body, Controller, Post } from '@nestjs/common'
import {
  GroupCreateReq, GroupMemberReq, GroupDescResp,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq, GroupMemberItem,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq, GroupNoticeResp,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupInfoItem,
  MineGroupInfoItem, GroupDetailItem
} from '@/modules/group/controllers/group.dto'
import { BaseIdReq, CommonEnum, BaseIdsArrayReq, BasePageResp, BaseArrayResp } from '@/modules/common/dto/common.dto'
import { GroupService } from '../services/group.service'
import { Request } from 'express'
import { virtualCurrentUser } from '@/utils/common.util'
import { Prisma } from '@prisma/client'
@Controller('groups')
export class GroupController {
  constructor (private readonly groupService: GroupService) { }

  // 创建群聊
  @Post('create')
  async create (@Body() param: GroupCreateReq): Promise<void> {
    const creatorId: string = virtualCurrentUser()
    const data: Prisma.GroupCreateInput = {
      ...param,
      creatorId,
      ownerId: creatorId,
      pubKey: param.pubKey,
      cover: '1'
    }
    await this.groupService.create(data)
  }

  // 群聊用户
  @Post('members')
  async getMembers (@Body() param: GroupMemberReq): Promise<BasePageResp<GroupMemberItem>> {
    const result = await this.groupService.getGroupMembers(param)
    const data = result.items.map(i => {
      const dto: GroupMemberItem = { ...i, gid: i.groupId }
      return dto
    })
    return result.transfer(data)
  }

  // 邀请加入群聊
  @Post('invite-join')
  async inviteMember (@Body() param: GroupInviteJoinReq): Promise<void> {
    return await this.groupService.inviteMember(param)
  }

  // 踢出群聊
  @Post('kick-out')
  async memberKickOut (@Body() param: GroupKickOutReq): Promise<void> {
    return await this.groupService.memberKickOut(param)
  }

  // 我的群聊
  @Post('list')
  async mineGroup (@Body() request: Request): Promise<BaseArrayResp<string>> {
    return { items: await this.groupService.mineGroup(request) }
  }

  // 修改群名称
  @Post('update-name')
  async changeName (@Body() param: GroupChangeNameReq): Promise<void> {
    return await this.groupService.changeName(param)
  }

  // 修改群头像
  @Post('update-avatar')
  async changeAvatar (@Body() param: GroupChangeAvatarReq): Promise<void> {
    return await this.groupService.changeAvatar(param)
  }

  // 修改我在群里面的昵称
  @Post('update-alias')
  async changeAlias (@Body() param: GroupChangeAliasReq): Promise<void> {
    return await this.groupService.changeAlias(param)
  }

  // 退出群聊
  @Post('quit')
  async quitGroup (@Body() param: BaseIdReq): Promise<void> {
    return await this.groupService.quitGroup(param)
  }

  // 退出多个群聊
  @Post('quit-batch')
  async quitGroupBatch (@Body() param: BaseIdsArrayReq): Promise<void> {
    return await this.groupService.quitGroupBatch(param)
  }

  // 退出我的所有群聊
  @Post('quit-all')
  async quitGroupAll (@Body() param: GroupInviteJoinReq): Promise<void> {
    return await this.groupService.quitGroupAll()
  }

  // 修改群通告
  @Post('update-notice')
  async changeNotice (@Body() param: GroupChangeNoticeReq): Promise<void> {
    return await this.groupService.changeNotice(param)
  }

  // 获取群通告
  @Post('get-notice')
  async getGroupNotice (@Body() param: BaseIdReq): Promise<GroupNoticeResp> {
    const group = await this.groupService.findOne(param.id)
    return { id: group.id, notice: group.notice, noticeMd5: group.noticeMd5 }
  }

  // 获取群简介
  @Post('get-desc')
  async getGroupDesc (@Body() param: BaseIdReq): Promise<GroupDescResp> {
    const group = await this.groupService.findOne(param.id)
    return { id: group.id, desc: group.desc, descMd5: group.descMd5 }
  }

  // 修改群简介
  @Post('update-desc')
  async changeDesc (@Body() param: GroupChangeDescReq): Promise<void> {
    return await this.groupService.changeDesc(param)
  }

  // 解散群组
  @Post('dismiss')
  async dismissGroup (@Body() param: BaseIdsArrayReq): Promise<void> {
    return await this.groupService.dismissGroup(param)
  }

  // 转移群组
  @Post('transfer')
  async transferGroup (@Body() param: GroupTransferReq): Promise<void> {
    return await this.groupService.transferGroup(param)
  }

  // 添加管理员
  @Post('add-admin')
  async addGroupManager (@Body() param: GroupTransferReq): Promise<void> {
    return await this.groupService.addGroupManager(param)
  }

  // 移除管理员
  @Post('remove-admin')
  async removeGroupManager (@Body() param: GroupApplyJoinReq): Promise<void> {
    return await this.groupService.removeGroupManager(param)
  }

  // 申请加入群聊
  @Post('require-join')
  async requireJoin (@Body() param: BaseIdReq): Promise<void> {
    return await this.groupService.requireJoin(param)
  }

  // 同意加入群聊
  @Post('agree-join')
  async memberJoin (@Body() param: GroupApplyJoinReq): Promise<void> {
    return await this.groupService.memberJoin(param)
  }

  // 待审核申请列表
  @Post('apply-list')
  async applyList (@Body() param: BaseIdsArrayReq): Promise<GroupInfoItem[]> {
    return await this.groupService.applyList(param)
  }

  // 我的申请列表
  @Post('my-apply-list')
  async myPendingApplyList (@Body() param: BaseIdsArrayReq): Promise<MineGroupInfoItem[]> {
    return await this.groupService.myPendingApplyList(param)
  }

  // 批量获取群详情
  @Post('get-batch-info')
  async groupDetailByIds (@Body() param: BaseIdsArrayReq): Promise<BaseArrayResp<GroupDetailItem>> {
    return { items: await this.groupService.groupDetailByIds(param) }
  }
}
