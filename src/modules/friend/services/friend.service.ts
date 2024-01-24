import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem,
  FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq,
  FriendListPageReq
} from '../controllers/friend.dto'
import { Prisma, User, Group, GroupMembers, FriendApply } from '@prisma/client'
import { BaseUIdArrayReq, BaseIdsArrayReq, CommonEnum, BasePageReq, BasePageResp } from '@/modules/common/dto/common.dto'
import commonUtil from '@/utils/common.util'
import { ChatService } from '@/modules/message/services/chat.service'
import { FriendApplyStatusEnum } from '@/enums'
import { ChatStatusEnum, ChatTypeEnum } from '@/modules/message/controllers/chat.dto'
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
    const uIds = param.uids

    // 我的订阅 在uIds内，且是我的订阅的人
    const subscribe = await this.prisma.friend.findMany({
      where: {
        uid: currentUserId,
        objUid: { in: uIds }
      },
      select: {
        uid: true,
        objUid: true
      }
    })
    // 订阅我的人 在uIds内，且订阅我的人
    const follower = await this.prisma.friend.findMany({
      where: { objUid: { in: uIds } },
      select: {
        uid: true,
        objUid: true
      }
    })

    // // 去掉我已经拉黑的人
    // await this.prisma.blacklist.findMany({
    //   where: {
    //     uid: userId,
    //     objUid: { in: uIds }
    //   }
    // })

    const subscribeSet = new Set(subscribe.map(i => i.objUid))
    const followerSet = new Set(follower.map(i => i.objUid))

    // 是否是好友 0-互为陌生人 1-互为好友 2-我单方面关注 3-对方单方面关注
    return uIds.map(id => {
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

  // 申请好友
  async inviteApply (currentUserId: string, param: FriendInviteApplyReq): Promise<void> {
    if (currentUserId === param.uid) {
      return
    }
    if (await this.isFriend(currentUserId, [param.uid])) {
      return
    }
    // 是否拉黑
    if (await this.isDenied(currentUserId, [param.uid])) {
      return
    }

    const input: Prisma.FriendApplyCreateInput = {
      uid: currentUserId,
      objUid: param.uid,
      status: FriendApplyStatusEnum.PENDING,
      isRead: CommonEnum.OFF,
      remark: param.remark,
      createdAt: new Date(),
      expiredAt: new Date()
    }
    await this.prisma.friendApply.create({ data: input })
  }

  // 我的申请列表
  async getInviteList (currentUserId: string, param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
    const data = await this.prisma.friendApply.findMany({
      where: {
        objUid: currentUserId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: commonUtil.pageSkip(param), // 计算需要跳过的数据量
      take: param.limit // 指定每页取多少条数据
    })
    const datas: FriendInviteApplyItem[] = data.map(d => {
      const dto: FriendInviteApplyItem = {
        id: d.id,
        uid: d.uid,
        remark: d.remark,
        status: d.status,
        createdAt: d.createdAt
      }
      return dto
    })
    return new BasePageResp(param, datas, await this.prisma.friendApply.count({
      where: {
        uid: currentUserId
      }
    }))
  }

  // 我的审批列表
  async getApplyList (currentUserId: string, param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
    const data = await this.prisma.friendApply.findMany({
      where: {
        objUid: currentUserId
      },
      // 优先展示未读
      orderBy: [
        {
          status: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ],
      skip: commonUtil.pageSkip(param), // 计算需要跳过的数据量
      take: param.limit // 指定每页取多少条数据
    })
    const datas: FriendInviteApplyItem[] = data.map(d => {
      const dto: FriendInviteApplyItem = {
        id: d.id,
        uid: d.objUid,
        remark: d.remark,
        status: d.status,
        createdAt: d.createdAt
      }
      return dto
    })
    return new BasePageResp(param, datas, await this.prisma.friendApply.count({
      where: {
        uid: currentUserId
      }
    }))
  }

  // 申请同意
  async inviteAgree (currentUserId: string, param: FriendInviteAgreeReq): Promise<any> {
    const apply: FriendApply = await this.prisma.friendApply.update({
      where: {
        id: param.id,
        objUid: currentUserId,
        status: FriendApplyStatusEnum.PENDING
      },
      data: {
        status: FriendApplyStatusEnum.PASSED,
        isRead: CommonEnum.ON,
        updatedAt: new Date()
      }
    })
    const inputs: Prisma.FriendCreateInput[] = [
      {
        uid: currentUserId,
        objUid: apply.uid,
        agreeAt: new Date(),
        remark: '',
        remarkIndex: '',
        createdAt: new Date()
      },
      {
        uid: apply.uid,
        objUid: currentUserId,
        agreeAt: new Date(),
        remark: '',
        remarkIndex: '',
        createdAt: new Date()
      }
    ]

    await this.prisma.friend.createMany({ data: inputs })
    await this.chatService.addSimpleChat(currentUserId, {
      groupId: null,
      type: ChatTypeEnum.NORMAL,
      status: ChatStatusEnum.ENABLE,
      isEnc: CommonEnum.ON,
      receiver: apply.uid
    })
  }

  // 申请拒绝
  async inviteReject (currentUserId: string, param: FriendInviteRejectReq): Promise<any> {
    await this.prisma.friendApply.update({
      where: {
        id: param.id,
        objUid: currentUserId,
        status: FriendApplyStatusEnum.PENDING
      },
      data: {
        status: FriendApplyStatusEnum.REFUSED,
        isRead: CommonEnum.ON,
        updatedAt: new Date(),
        rejectReason: param.reason
      }
    })
  }

  // 申请已读
  async inviteRead (currentUserId: string, param: BaseIdsArrayReq): Promise<any> {
    await this.prisma.friendApply.updateMany({
      where: {
        id: { in: param.ids },
        objUid: currentUserId,
        isRead: 0
      },
      data: {
        isRead: 1,
        updatedAt: new Date()
      }
    })
  }

  // 好友列表
  async getFriendList (currentUserId: string, param: FriendListPageReq): Promise<BasePageResp<FriendInfoItem>> {
    if (param.uids != null && param.uids.length > 0) {
      param.limit = param.uids.length
      param.page = 1
    }
    const friends = await this.prisma.friend.findMany({
      where: {
        uid: currentUserId
      },
      skip: commonUtil.pageSkip(param),
      take: param.limit,
      orderBy: {
        createdAt: 'asc'
      }
    })
    const data = friends.map(f => {
      const dto: FriendInfoItem = {
        uid: f.objUid,
        chatId: 'todo',
        alias: f.remark
      }
      return dto
    })
    return new BasePageResp(param, data, await this.prisma.friend.count({
      where: {
        uid: currentUserId
      }
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
  async dropRelationSingle (currentUserId: string, param: BaseUIdArrayReq): Promise<any> {
    await this.prisma.friendApply.deleteMany({
      where: {
        uid: currentUserId,
        objUid: { in: param.uids }
      }
    })
    await this.prisma.friend.deleteMany({
      where: {
        uid: currentUserId,
        objUid: { in: param.uids }
      }
    })
    // 删除会话
    const chatIds = await this.chatService.deleteSimpleChat(currentUserId, param.uids, true, ChatTypeEnum.NORMAL)
    // 删除消息
    await this.messageService.clearMessageByChatIds(currentUserId, chatIds)
  }

  /**
   * 删除所有好友（双向）
   * @param currentUserId
   * @param param
   */
  async dropRelationMulti (currentUserId: string, param: BaseUIdArrayReq): Promise<any> {
    // a
    await this.prisma.friendApply.deleteMany({
      where: {
        uid: currentUserId,
        objUid: { in: param.uids }
      }
    })
    await this.prisma.friend.deleteMany({
      where: {
        uid: currentUserId,
        objUid: { in: param.uids }
      }
    })
    // b
    await this.prisma.friendApply.deleteMany({
      where: {
        uid: { in: param.uids },
        objUid: currentUserId
      }
    })
    await this.prisma.friend.deleteMany({
      where: {
        uid: { in: param.uids },
        objUid: currentUserId
      }
    })

    // 删除会话
    const chatIds = await this.chatService.deleteSimpleChat(currentUserId, param.uids, false, ChatTypeEnum.NORMAL)
    // 删除消息
    await this.messageService.clearAllMessageByChatIds(currentUserId, chatIds)
  }

  // 是否拉黑
  async isDenied (currentUserId: string, uids: string[]): Promise<boolean> {
    return await this.prisma.blacklist.count({
      where: {
        uid: currentUserId,
        objUid: { in: uids }
      }
    }) > 0
  }

  // 是否为好友
  async isFriend (currentUserId: string, uids: string[]): Promise<boolean> {
    return await this.prisma.friend.count({
      where: {
        uid: currentUserId,
        objUid: { in: uids }
      }
    }) > 0
  }
}
