
import { Body, Controller, HttpException, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '@/modules/user/services/user.service'
import { FriendService } from '../services/friend.service'
import { Prisma, User } from '@prisma/client'
import { AuthEnumIsRegister, UserGenderEnum } from '@/enums'
import { Request } from 'express'
import { BaseIdReq, BaseIdsArrayReq, BaseUIdArrayReq, BaseArrayResp } from '../../common/dto/common.dto'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem
  , FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq
} from './friend.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { AuthInterceptor } from '@/modules/auth/interceptors/auth.interceptor'

@Controller('friends')
@UseInterceptors(CryptInterceptor, BaseInterceptor, AuthInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly friendService: FriendService
  ) { }

  // 获取用户关系
  @Post('relation-list')
  async isRegister(@Req() req: Request, param: FriendRelationItem): Promise<BaseArrayResp<FriendRelationItem>> {
    return { items: await this.friendService.getRelationList(req.uid, param) }
  }
}

// 获取用户关系
const getRelationList = async (param: BaseUIdArrayReq): Promise<BaseArrayResp<FriendRelationItem>> => {
  return createRequestInstance(true).post('/friends/relation-list', param)
}

// 申请好友
const inviteApply = (param: FriendInviteApplyReq) => {
  return createRequestInstance(true).post('/friends/invite-apply', param)
}

// 申请列表
const getApplyList = async (): Promise<BaseArrayResp<FriendInviteApplyItem>> => {
  return createRequestInstance(true).post('/friends/invite-list')
}

// 申请同意
const inviteAgree = (param: FriendInviteAgreeReq) => {
  return createRequestInstance(true).post('/friends/invite-agree', param)
}

// 申请拒绝
const inviteReject = (param: FriendInviteRejectReq) => {
  return createRequestInstance(true).post('/friends/invite-reject', param)
}

// 申请已读
const inviteRead = (param: BaseIdsArrayReq) => {
  return createRequestInstance(true).post('/friends/invite-read', param)
}

// 好友列表
const getFriendList = async (param: BaseUIdArrayReq): Promise<BaseArrayResp<FriendInfoItem>> => {
  return createRequestInstance(true).post('/friends/list', param)
}
// 变更好友备注
const changeAlias = (param: FriendChangeAliasReq) => {
  return createRequestInstance(true).post('/friends/update-alias', param)
}

// 删除好友（单向）
const dropRelationSingle = (param: BaseUIdArrayReq) => {
  return createRequestInstance(true).post('/friends/delete-unilateral', param)
}

// 删除所有好友（双向）
const dropRelationDouble = (param: BaseUIdArrayReq) => {
  return createRequestInstance(true).post('/friends/delete-bilateral', param)
}
