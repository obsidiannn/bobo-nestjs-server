import { Injectable } from '@nestjs/common'
import { BaseIdsArrayReq, CommonEnum } from '@/modules/common/dto/common.dto'
import {
  MessageSendReq,
  MessageListItem,
  MessageDetailItem,
  MessageDeleteByIdReq,
  MessageExtra,
  MessageAction,
  MessageDeleteByMsgIdReq,
  MessageListReq,
  MessageDetailListReq
} from '../controllers/message.dto'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { Prisma, MessageDetail } from '@prisma/client'
import { MessageStatus } from './message.enums'
import { isNumber } from 'class-validator'
import { GroupMemberRoleEnum } from '@/enums'
import { DropSimpleChatResult } from '../controllers/chat.dto'
import { ChatService } from './chat.service'

@Injectable()
export class MessageService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly chatService: ChatService
  ) {}

  // 发送消息
  async sendMessage (currentUserId: string, param: MessageSendReq): Promise<any> {

  }

  async create (data: Prisma.MessageDetailCreateInput): Promise<MessageDetail> {
    return await this.prisma.messageDetail.create({ data })
  }

  async createMany (data: Prisma.MessageDetailCreateInput): Promise<MessageDetail> {
    return await this.prisma.messageDetail.create({ data })
  }

  // 寻找chat下最大的message sequence
  async findMaxSequenceByChatId (chatId: string): Promise<number> {
    let sequence = 1
    await this.prisma.messageDetail.findFirst({
      where: {
        chatId
      },
      select: { sequence: true },
      orderBy: { sequence: 'desc' }
    }).then(res => {
      if ((res !== null) && isNumber(res.sequence)) {
        sequence = res.sequence + 1
      }
    })
    return sequence
  }

  async findManyByMsgId (msgIds: string[]): Promise<MessageDetail[]> {
    return await this.prisma.messageDetail.findMany({
      where: {
        id: { in: msgIds }
      }
    })
  }

  async findMany (param: Prisma.MessageDetailFindManyArgs): Promise<MessageDetail[]> {
    return await this.prisma.messageDetail.findMany(param)
  }

  async deleteByIds (ids: string[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.messageDetail.deleteMany({
      where: {
        id: { in: ids }
      }
    })
  }

  // （单向）删除消息-按消息Id
  async deleteSelfMsg (currentUserId: string, msgIds: string[]): Promise<any> {
    await this.prisma.userMessage.deleteMany({
      where: {
        uid: currentUserId,
        msgId: { in: msgIds }
      }
    })
  }

  // （双向）删除所有消息-根据会话IDs
  async deleteChatByIds (currentUserId: string, chatIds: string[]): Promise<any> {
    await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds },
        uid: currentUserId
      }
    })
  }

  async deleteByChatIds (chatIds: string[]): Promise<any> {
    await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds }
      }
    })
  }

  // （单向）删除所有消息-根据会话IDs 解除自己与会话消息的关系
  // 多删了一个chatUser
  async deleteSelfChatByIds (currentUserId: string, param: MessageDeleteByIdReq): Promise<any> {
    // 首先必须身处chat内
    const userChats = await this.prisma.chatUser.findMany({
      where: {
        chatId: { in: param.chatIds },
        uid: currentUserId
      },
      select: { chatId: true }
    })
    if (userChats.length > 0) {
      // 找到单聊消息
      const deleteChats = await this.prisma.chat.findMany({
        where: {
          type: 1,
          id: { in: userChats.map(c => c.chatId) }
        },
        select: { id: true }
      })
      if (deleteChats.length > 0) {
        const chatIds = deleteChats.map(c => c.id)
        await this.prisma.chatUser.deleteMany({
          where: { chatId: { in: chatIds } }
        })
        await this.prisma.userMessage.deleteMany({
          where: { chatId: { in: chatIds } }
        })
      }
    }
  }

  /**
   * 根据chatId 清除消息
   *  会删除 messageDetail 与 userMessage
   * @param currentUserId
   * @param chatIds
   */
  async clearMessageByChatIds (currentUserId: string, chatDeleteResult: DropSimpleChatResult): Promise<void> {
    await this.prisma.userMessage.deleteMany({
      where: {
        uid: currentUserId,
        chatId: { in: chatDeleteResult.chatUser }
      }
    })
    //
    // const aliveMessages = await this.prisma.userMessage.findMany({
    //   where: {
    //     chatId: { in: chatDeleteResult.chat }
    //   },
    //   select: {
    //     chatId: true
    //   }
    // })
    // // 判断两边都被删除，取得差集，删掉所得差集的chatIds的message
    // const dropChatIds = commonUtil.arrayDifference(chatIds, aliveMessages.map(a => a.chatId))
    if (chatDeleteResult.chat.length > 0) {
      await this.prisma.messageDetail.deleteMany({
        where: {
          chatId: { in: chatDeleteResult.chat }
        }
      })
    }
  }

  /**
   * 根据chatId & memberId 清除部分消息
   * @param currentUserId
   * @param chatIds
   */
  async clearMemberMessageByChatIds (memberIds: string[], chatIds: string[]): Promise<void> {
    if (chatIds.length <= 0 || memberIds.length <= 0) { return }
    await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds },
        uid: { in: memberIds }
      }
    })
  }

  /**
   * 根据chatId 全部清除消息
   * @param currentUserId
   * @param chatIds
   */
  async clearAllMessageByChatIds (currentUserId: string, chatIds: string[]): Promise<void> {
    if (chatIds.length <= 0) { return }
    await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: chatIds }
      }
    })
    await this.prisma.messageDetail.deleteMany({
      where: {
        chatId: { in: chatIds }
      }
    })
  }
}
