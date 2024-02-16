import { GroupMemberRoleEnum } from '@/enums'
import { BaseIdsArrayReq, CommonEnum } from '@/modules/common/dto/common.dto'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { ChatUser, GroupMembers, Prisma } from '@prisma/client'

@Injectable()
export class ChatUserService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findUidByChatId (chatId: string): Promise<string[]> {
    const chatUsers = await this.prisma.chatUser.findMany({
      where: { chatId },
      select: { uid: true }
    })
    return chatUsers.map(c => c.uid)
  }

  async findByUidAndChatIdIn (chatIds: string[], uid: string): Promise<ChatUser[]> {
    return await this.prisma.chatUser.findMany({
      where: {
        chatId: { in: chatIds },
        uid
      }
    })
  }

  /**
 * 删除会话
 * @param currentUserId
 * @param param
 * @param hide true: 隐藏，false： 展开
 */
  async userChatHide (currentUserId: string, param: BaseIdsArrayReq, hide: boolean): Promise<string[]> {
    const chatArray = await this.prisma.chatUser.findMany({
      where: {
        chatId: { in: param.ids },
        uid: currentUserId
      },
      select: {
        chatId: true
      }
    })

    await this.prisma.chatUser.updateMany({
      where: {
        chatId: { in: param.ids },
        uid: currentUserId
      },
      data: {
        isShow: hide ? CommonEnum.OFF : CommonEnum.ON,
        isHide: hide ? CommonEnum.ON : CommonEnum.OFF
      }
    })
    return chatArray.map(c => c.chatId)
  }

  async deleteByChatIds (chatIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.chatUser.deleteMany({
      where: { chatId: { in: chatIds } }
    })
  }

  /**
   * 更新最大 read sequence
   * @param currentUserId
   * @param chatId
   * @param maxSequence
   */
  async refreshSequence (currentUserId: string, chatId: string, maxSequence: number): Promise<void> {
    await this.prisma.chatUser.updateMany({
      where: {
        uid: currentUserId,
        chatId,
        maxReadSeq: {
          lt: maxSequence
        }
      },
      data: {
        maxReadSeq: maxSequence
      }
    })
  }

  async findGroupRoleByGroupIds (groupIds: string[], uid: string, roles: GroupMemberRoleEnum[]): Promise<GroupMembers[]> {
    return await this.prisma.groupMembers.findMany({
      where: {
        groupId: { in: groupIds },
        uid,
        role: { in: roles }
      }
    })
  }
}
