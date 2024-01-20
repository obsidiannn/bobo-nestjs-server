
import { Controller, Post, Req, Body, UseInterceptors } from '@nestjs/common'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '@/modules/user/services/user.service'
import { FriendService } from '../services/friend.service'
import { Request } from 'express'
import { BasePageReq, BaseIdsArrayReq, BaseUIdArrayReq, BaseArrayResp, BasePageResp } from '../../common/dto/common.dto'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem
  , FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq, FriendListPageReq
} from './friend.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
// import { AuthInterceptor } from '@/modules/auth/interceptors/auth.interceptor'

@Controller('friends')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class FriendController {
  constructor (
    private readonly userService: UserService,
    private readonly friendService: FriendService
  ) { }

  // 获取用户关系
  @Post('relation-list')
  async getRelationList (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<BaseArrayResp<FriendRelationItem>> {
    return { items: await this.friendService.getRelationList(req.uid, param) }
  }

  // 申请好友
  @Post('invite-apply')
  async inviteApply (@Req() req: Request, @Body() param: FriendInviteApplyReq): Promise<void> {
    await this.friendService.inviteApply(req.uid, param)
  }

  // 我的申请列表
  @Post('invite-list')
  async getInviteList (@Req() req: Request, @Body() param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
    return await this.friendService.getInviteList(req.uid, param)
  }

  // 我的审批列表
  @Post('invite-apply-list')
  async getApplyList (@Req() req: Request, @Body() param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
    return await this.friendService.getApplyList(req.uid, param)
  }

  // 申请同意
  @Post('invite-agree')
  async inviteAgree (@Req() req: Request, @Body() param: FriendInviteAgreeReq): Promise<void> {
    await this.friendService.inviteAgree(req.uid, param)
  }

  // 申请拒绝
  @Post('invite-reject')
  async inviteReject (@Req() req: Request, @Body() param: FriendInviteRejectReq): Promise<void> {
    await this.friendService.inviteReject(req.uid, param)
  }

  // 申请已读
  @Post('invite-read')
  async inviteRead (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    await this.friendService.inviteRead(req.uid, param)
  }

  // 好友列表
  @Post('list')
  async getFriendList (@Req() req: Request, @Body() param: FriendListPageReq): Promise<BasePageResp<FriendInfoItem>> {
    return await this.friendService.getFriendList(req.uid, param)
  }

  // 变更好友备注
  @Post('update-alias')
  async changeAlias (@Req() req: Request, @Body() param: FriendChangeAliasReq): Promise<void> {
    await this.friendService.changeAlias(req.uid, param)
  }

  // 删除好友（单向）
  @Post('delete-unilateral')
  async dropRelationSingle (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<void> {
    await this.friendService.dropRelationSingle(req.uid, param)
  }

  // 删除所有好友（双向）
  @Post('delete-bilateral')
  async dropRelationMulti (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<void> {
    await this.friendService.dropRelationMulti(req.uid, param)
  }
}
