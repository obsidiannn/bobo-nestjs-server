import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem,
  FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq,
  FriendListPageReq
} from '../controllers/friend.dto'
import { Prisma, User, Group, GroupMembers, FriendApply, Friend } from '@prisma/client'
import { BaseUIdArrayReq, BasePageResp } from '@/modules/common/dto/common.dto'
import commonUtil from '@/utils/common.util'
import { ChatService } from '@/modules/message/services/chat.service'
import { FriendApplyStatusEnum, ChatStatusEnum, ChatTypeEnum, FriendStatusEnum } from '@/enums'
import { MessageService } from '@/modules/message/services/message.service'

@Injectable()
export class FriendService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService
  ) { }

  // 获取用户关系
  async getRelationList (currentUserId: string, param: BaseUIdArrayReq): Promise<FriendRelationItem[]> {
    const uIds: string[] = param.uids

    // 我的订阅 在uIds内，且是我的订阅的人
    const subscribe = await this.prisma.friend.findMany({
      where: {
        uid: currentUserId,
        objUid: { in: uIds },
        status: FriendStatusEnum.NORMAL
      },
      select: {
        uid: true,
        objUid: true
      }
    })
    console.log(uIds)
    // 订阅我的人 在uIds内，且订阅我的人
    const follower = await this.prisma.friend.findMany({
      where: {
        uid: { in: uIds },
        objUid: currentUserId,
        status: FriendStatusEnum.NORMAL
      },
      select: {
        uid: true,
        objUid: true
      }
    })
    console.log(uIds)
    const subscribeSet = new Set(subscribe.map(i => i.objUid))
    const followerSet = new Set(follower.map(i => i.objUid))
    console.log(uIds)

    // 是否是好友 0-互为陌生人 1-互为好友 2-我单方面关注 3-对方单方面关注
    return param.uids.map(id => {
      const subscribeFlag = subscribeSet.has(id)
      const followerFlag = followerSet.has(id)
      const item: FriendRelationItem = {
        uid: id,
        isFriend: 0
      }
      if (subscribeFlag && followerFlag) {
        // 互相关注
        item.isFriend = 1
      } else if (!subscribeFlag && !followerFlag) {
        // 陌生人
        item.isFriend = 0
      } else {
        if (subscribeFlag && !followerFlag) {
          // 我单方面订阅
          item.isFriend = 2
        } else {
          // 单方面被订阅
          item.isFriend = 3
        }
      }
      return item
    })
  }

  // // 我的申请列表
  // async getInviteList (currentUserId: string, param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
  //   const data = await this.prisma.friendApply.findMany({
  //     where: {
  //       objUid: currentUserId
  //     },
  //     orderBy: {
  //       createdAt: 'desc'
  //     },
  //     skip: commonUtil.pageSkip(param), // 计算需要跳过的数据量
  //     take: param.limit // 指定每页取多少条数据
  //   })
  //   const datas: FriendInviteApplyItem[] = data.map(d => {
  //     const dto: FriendInviteApplyItem = {
  //       id: d.id,
  //       uid: d.uid,
  //       remark: d.remark,
  //       status: d.status,
  //       createdAt: d.createdAt
  //     }
  //     return dto
  //   })
  //   return new BasePageResp(param, datas, await this.prisma.friendApply.count({
  //     where: {
  //       uid: currentUserId
  //     }
  //   }))
  // }

  async createBatch (data: Prisma.FriendCreateInput []): Promise<Prisma.BatchPayload> {
    return await this.prisma.friend.createMany({ data })
  }

  // 好友列表
  async getFriendList (currentUserId: string, param: FriendListPageReq): Promise<BasePageResp<Friend>> {
    const where: Prisma.FriendWhereInput = {
      uid: currentUserId,
      status: FriendStatusEnum.NORMAL
    }
    if (commonUtil.notEmpty(param.uids)) {
      where.objUid = { in: param.uids }
    }
    const data = await this.prisma.friend.findMany({
      where,
      skip: commonUtil.pageSkip(param),
      take: param.limit,
      orderBy: {
        createdAt: 'asc'
      }
    })
    return new BasePageResp(param, data, await this.prisma.friend.count({
      where
    }))
  }

  // 变更好友备注
  async changeAlias (currentUserId: string, param: FriendChangeAliasReq): Promise<any> {
    await this.prisma.friend.update({
      where: {
        id: param.id,
        uid: currentUserId
      },
      data: {
        remark: param.alias,
        // todo
        remarkIndex: param.alias
      }
    })
  }

  /**
   *  删除好友（单向）
   * @param currentUserId
   * @param param
   */
  async deleteMany (uids: string[], objUids: string[]): Promise<Prisma.BatchPayload> {
    if (objUids.length <= 0 || uids.length <= 0) {
      return { count: 0 }
    }
    return await this.prisma.friend.deleteMany({
      where: {
        uid: { in: uids },
        objUid: { in: objUids }
      }
    })
  }

  // 是否拉黑
  async isDenied (currentUserId: string, uid: string): Promise<boolean> {
    return await this.prisma.friend.count({
      where: {
        uid: currentUserId,
        objUid: uid,
        status: FriendStatusEnum.BLOCK
      }
    }) > 0
  }

  // 是否为好友
  async isFriend (currentUserId: string, uid: string): Promise<boolean> {
    return await this.prisma.friend.count({
      where: {
        uid: currentUserId,
        objUid: uid,
        status: FriendStatusEnum.NORMAL
      }
    }) > 0
  }
}
