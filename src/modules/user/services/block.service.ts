import { FriendStatusEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Blacklist, Prisma } from '@prisma/client'

@Injectable()
export class BlockService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async isBlock (uid: string, objUid: string): Promise<boolean> {
    return await this.prisma.friend.count({
      where: {
        uid,
        objUid,
        status: FriendStatusEnum.BLOCK
      }
    }) > 0
  }

  //  拉黑
  async doBlock (uid: string, objUid: string): Promise<void> {
    await this.prisma.friend.updateMany({
      where: {
        uid,
        objUid,
        status: FriendStatusEnum.NORMAL
      },
      data: {
        status: FriendStatusEnum.BLOCK
      }
    })
  }

  //  解除拉黑
  async unBlock (uid: string, objUid: string): Promise<void> {
    await this.prisma.friend.updateMany({
      where: {
        uid,
        objUid,
        status: FriendStatusEnum.BLOCK
      },
      data: {
        status: FriendStatusEnum.NORMAL
      }
    })
  }

  async findManyByUid (uid: string): Promise<Blacklist[]> {
    return await this.prisma.friend.findMany({
      where: {
        uid,
        status: FriendStatusEnum.BLOCK
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  }
}
