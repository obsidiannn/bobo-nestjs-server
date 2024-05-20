import { ChatTypeEnum, OfficialUserTypeEnum } from '@/enums'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { strMd5 } from '@/utils/buffer.util'
import commonUtil from '@/utils/common.util'
import { recoverAddress } from '@/utils/web3'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor (private readonly prisma: PrismaService) {

  }

  recoverUid (dataHash: string, sign: string): string {
    return recoverAddress(dataHash, sign)
  }

  /**
   *
   * @param user 初始化系统对话
   */
  async initOfficialChat (user: User): Promise<void> {
    const officialUsers = await this.prisma.officialUser.findMany({
      where: {
        type: OfficialUserTypeEnum.SYSTEM_CHAT,
        status: 1
      },
      take: 1
    })
    if (officialUsers.length <= 0) {
      throw new HttpException('system official data error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    const officialUser = officialUsers[0]
    const chat: Prisma.ChatCreateInput = {
      userIds: [user.id, officialUser.id],
      type: ChatTypeEnum.OFFICIAL,
      creatorUId: user.id,
      status: 1,
      lastReadSequence: 0,
      lastSequence: 0
    }
    const chatData = await this.prisma.chat.create({ data: chat })
    const userRef = commonUtil.generateRef([user.id, officialUser.id])
    const chatUser: Prisma.ChatUserCreateInput = {
      uid: user.id,
      chatId: chatData.id,
      isTop: 1,
      isMute: 0,
      isShow: 1,
      isHide: 0,
      maxReadSeq: 0,
      lastOnlineTime: new Date(),
      userRef
    }
    const chatUserOfficial: Prisma.ChatUserCreateInput = {
      uid: officialUser.id,
      chatId: chatData.id,
      isTop: 1,
      isMute: 0,
      isShow: 1,
      isHide: 0,
      maxReadSeq: 0,
      lastOnlineTime: new Date(),
      userRef
    }

    await this.prisma.chatUser.createMany({
      data: [chatUser, chatUserOfficial]
    })
  }
}
