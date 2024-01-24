import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import {
  GroupCreateReq, GroupMemberReq, GroupDescResp,
  GroupApplyJoinReq, GroupInviteJoinReq, GroupKickOutReq, GroupMemberItem,
  GroupChangeNameReq, GroupChangeAvatarReq, GroupChangeAliasReq, GroupNoticeResp,
  GroupChangeDescReq, GroupChangeNoticeReq, GroupTransferReq, GroupInfoItem,
  MineGroupInfoItem, GroupDetailItem, GroupRequireJoinReq
} from '@/modules/group/controllers/group.dto'
import { BaseIdReq, BaseIdsArrayReq, BasePageResp, BaseArrayResp } from '@/modules/common/dto/common.dto'
import { GroupService } from '../services/group.service'
import { Request } from 'express'
import { Prisma } from '@prisma/client'

import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'

@Controller('groups')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class GroupController {
  constructor (private readonly groupService: GroupService) { }

  // 创建群聊
  @Post('create')
  async create (@Req() req: Request, @Body() param: GroupCreateReq): Promise<void> {
    await this.groupService.create(req.uid, param)
  }

  // 群聊用户
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
    return await this.groupService.inviteMember(req.uid, param)
  }

  // 踢出群聊
  @Post('kick-out')
  async memberKickOut (@Req() req: Request, @Body() param: GroupKickOutReq): Promise<void> {
    return await this.groupService.memberKickOut(req.uid, param)
  }

  // 我的群聊
  @Post('list')
  async mineGroup (@Req() req: Request): Promise<BaseArrayResp<string>> {
    return { items: await this.groupService.mineGroup(req.uid) }
  }

  // 修改群名称
  @Post('update-name')
  async changeName (@Req() req: Request, @Body() param: GroupChangeNameReq): Promise<void> {
    return await this.groupService.changeName(req.uid, param)
  }

  // 修改群头像
  @Post('update-avatar')
  async changeAvatar (@Req() req: Request, @Body() param: GroupChangeAvatarReq): Promise<void> {
    return await this.groupService.changeAvatar(req.uid, param)
  }

  // 修改我在群里面的昵称
  @Post('update-alias')
  async changeAlias (@Req() req: Request, @Body() param: GroupChangeAliasReq): Promise<void> {
    return await this.groupService.changeAlias(req.uid, param)
  }

  // 退出群聊
  @Post('quit')
  async quitGroup (@Req() req: Request, @Body() param: BaseIdReq): Promise<void> {
    return await this.groupService.quitGroup(req.uid, param)
  }

  // 退出多个群聊
  @Post('quit-batch')
  async quitGroupBatch (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    return await this.groupService.quitGroupBatch(req.uid, param)
  }

  // 退出我的所有群聊
  @Post('quit-all')
  async quitGroupAll (@Req() req: Request, @Body() param: GroupInviteJoinReq): Promise<void> {
    return await this.groupService.quitGroupAll(req.uid)
  }

  // 修改群通告
  @Post('update-notice')
  async changeNotice (@Req() req: Request, @Body() param: GroupChangeNoticeReq): Promise<void> {
    return await this.groupService.changeNotice(req.uid, param)
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
    return await this.groupService.changeDesc(req.uid, param)
  }

  // 解散群组
  @Post('dismiss')
  async dismissGroup (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    return await this.groupService.dismissGroup(req.uid, param)
  }

  // 转移群组
  @Post('transfer')
  async transferGroup (@Req() req: Request, @Body() param: GroupTransferReq): Promise<void> {
    return await this.groupService.transferGroup(req.uid, param)
  }

  // 添加管理员
  @Post('add-admin')
  async addGroupManager (@Req() req: Request, @Body() param: GroupTransferReq): Promise<void> {
    return await this.groupService.addGroupManager(req.uid, param)
  }

  // 移除管理员
  @Post('remove-admin')
  async removeGroupManager (@Req() req: Request, @Body() param: GroupApplyJoinReq): Promise<void> {
    return await this.groupService.removeGroupManager(req.uid, param)
  }

  // 申请加入群聊
  @Post('require-join')
  async requireJoin (@Req() req: Request, @Body() param: GroupRequireJoinReq): Promise<void> {
    return await this.groupService.requireJoin(req.uid, param)
  }

  // 同意加入群聊
  @Post('agree-join')
  async memberJoin (@Req() req: Request, @Body() param: GroupApplyJoinReq): Promise<void> {
    return await this.groupService.memberJoin(req.uid, param)
  }

  // 待审核申请列表
  @Post('apply-list')
  async applyList (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<GroupInfoItem[]> {
    return await this.groupService.applyList(req.uid, param)
  }

  // 我的申请列表
  @Post('my-apply-list')
  async myPendingApplyList (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<MineGroupInfoItem[]> {
    return await this.groupService.myPendingApplyList(req.uid, param)
  }

  // 批量获取群详情
  @Post('get-batch-info')
  async groupDetailByIds (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<BaseArrayResp<GroupDetailItem>> {
    return { items: await this.groupService.groupDetailByIds(param) }
  }
}
