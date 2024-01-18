import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../common/services/prisma.service'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem
  , FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq
} from '../controllers/friend.dto'
import { Prisma, User } from '@prisma/client'
import { BaseUIdArrayReq, BaseArrayResp } from '@/modules/common/dto/common.dto'

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  // 获取用户关系
  async getRelationList(userId: string, param: BaseUIdArrayReq): FriendRelationItem[] {
    const friends = await this.prisma.friend.findMany({
      where: { uid: userId }
    })
    return friends.map(f => {

    })
  }

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
}
