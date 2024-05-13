import { CommonEnum } from '@/modules/common/dto/common.dto'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma, UserMessage } from '@prisma/client'

@Injectable()
export class UserMessageService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async createMany (data: Prisma.UserMessageCreateInput[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.userMessage.createMany({ data })
  }

  async findMany (param: Prisma.UserMessageFindManyArgs): Promise<UserMessage[]> {
    return await this.prisma.userMessage.findMany(param)
  }

  async readMany (ids: string[]): Promise<void> {
    await this.prisma.userMessage.updateMany({
      where: {
        id: { in: ids },
        isRead: CommonEnum.OFF
      },
      data: {
        isRead: CommonEnum.ON
      }
    })
  }

  async deleteByMsgIds (msgIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.userMessage.deleteMany({
      where: {
        msgId: { in: msgIds }
      }
    })
  }

  async deleteByChatIds (chatIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds }
      }
    })
  }

  /**
   * 清除个人的 message，对其他人的message没有影响
   * @param currentUserId
   * @param chatIds
   * @returns
   */
  async deleteUserMessageByChatIds (currentUserId: string, chatIds: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds },
        uid: currentUserId
      }
    })
  }
}
