import { FriendApply, Prisma } from '@prisma/client'
import { PrismaService } from '../../common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { BasePageReq, BasePageResp, CommonEnum } from '@/modules/common/dto/common.dto'
import commonUtil from '@/utils/common.util'
import { FriendApplyStatusEnum } from '@/enums'

@Injectable()
export class FriendApplyService {
  constructor (
    private readonly prisma: PrismaService
  ) { }

  async create (data: Prisma.FriendApplyCreateInput): Promise<FriendApply> {
    return await this.prisma.friendApply.create({ data })
  }

  async getFriendInviteApplyPage (currentUserId: string, param: BasePageReq): Promise<BasePageResp<FriendApply>> {
    const data = await this.prisma.friendApply.findMany({
      where: {
        OR: [
          {
            uid: currentUserId
          },
          {
            objUid: currentUserId
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: commonUtil.pageSkip(param),
      take: param.limit
    })

    return new BasePageResp(param, data, await this.prisma.friendApply.count({
      where: {
        OR: [
          {
            uid: currentUserId
          },
          {
            objUid: currentUserId
          }
        ]
      }
    }))
  }

  // 我的审批列表
  async getFriendApplyPage (currentUserId: string, param: BasePageReq): Promise<BasePageResp<FriendApply>> {
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
    return new BasePageResp(param, data, await this.prisma.friendApply.count({
      where: {
        uid: currentUserId
      }
    }))
  }

  // 申请统一
  async agreeApply (currentUserId: string, id: string): Promise<FriendApply> {
    return await this.prisma.friendApply.update({
      where: {
        id,
        objUid: currentUserId,
        status: FriendApplyStatusEnum.PENDING
      },
      data: {
        status: FriendApplyStatusEnum.PASSED,
        isRead: CommonEnum.ON,
        updatedAt: new Date()
      }
    })
  }

  // 申请拒绝
  async rejectApply (currentUserId: string, id: string, reason: string): Promise<FriendApply> {
    return await this.prisma.friendApply.update({
      where: {
        id,
        objUid: currentUserId,
        status: FriendApplyStatusEnum.PENDING
      },
      data: {
        status: FriendApplyStatusEnum.REFUSED,
        isRead: CommonEnum.ON,
        updatedAt: new Date(),
        rejectReason: reason
      }
    })
  }

  // 申请已读
  async applyRead (currentUserId: string, ids: string[]): Promise<Prisma.BatchPayload> {
    if (ids.length <= 0) {
      return { count: 0 }
    }
    return await this.prisma.friendApply.updateMany({
      where: {
        id: { in: ids },
        objUid: currentUserId,
        isRead: CommonEnum.OFF
      },
      data: {
        isRead: CommonEnum.ON,
        updatedAt: new Date()
      }
    })
  }

  async deleteMany (uids: string[], objUid: string[]): Promise<Prisma.BatchPayload> {
    if (objUid.length <= 0 || uids.length <= 0) {
      return { count: 0 }
    }
    return await this.prisma.friendApply.deleteMany({
      where: {
        uid: { in: uids },
        objUid: { in: objUid }
      }
    })
  }
}
