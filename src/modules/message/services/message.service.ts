import { Injectable } from '@nestjs/common'
import { BaseIdsArrayReq, CommonEnum } from '@/modules/common/dto/common.dto'
import {
  MessageSendReq,
  MessageListItem,
  MessageDetailItem,
  MessageDeleteByIdReq,
  MessageExtra,
  MessageAction,
  MessageDeleteByMsgIdReq
} from '../controllers/message.dto'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { Prisma, MessageDetail } from '@prisma/client'
import { MessageStatus } from './message.enums'
import { isNumber } from 'class-validator'
import { GroupMemberRole } from '@/enums'
import commonUtil from '@/utils/common.util'

@Injectable()
export class MessageService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  // 发送消息
  async sendMessage (currentUserId: string, param: MessageSendReq): Promise<any> {
    const messageInput: Prisma.MessageDetailCreateInput = {
      ...param,
      fromUid: currentUserId,
      extra: JSON.stringify(param.extra),
      action: JSON.stringify(param.action),
      createdAt: new Date(),
      status: MessageStatus.NORMAL
    }
    await this.prisma.messageDetail.create({ data: messageInput })
    let sequence = 0
    await this.prisma.messageDetail.findFirst({
      where: {
        chatId: param.chatId
      },
      select: { sequence: true },
      orderBy: { sequence: 'desc' }
    }).then(res => {
      if ((res !== null) && isNumber(res.sequence)) {
        sequence = res.sequence + 1
      }
    })

    // sequence 这里应该是 消息最大序号 + 1
    const userMsgs = param.receiveIds.map(u => {
      const userMsg: Prisma.UserMessageCreateInput = {
        uid: u,
        msgId: param.id,
        isRead: CommonEnum.OFF,
        sequence,
        chatId: param.chatId
      }
      return userMsg
    })
    await this.prisma.userMessage.createMany({ data: userMsgs })
  }

  // 消息列表
  async mineMessageList (currentUserId: string): Promise<MessageListItem[]> {
    const userMessages = await this.prisma.userMessage.findMany({
      where: {
        uid: currentUserId
      }
    })
    if (userMessages.length <= 0) {
      return []
    }
    const messages = await this.prisma.messageDetail.findMany({
      where: {
        id: { in: userMessages.map(u => u.msgId) }
      },
      select: {
        id: true,
        chatId: true,
        createdAt: true
      }
    })
    if (messages.length > 0) {
      const messageHash = new Map()
      messages.forEach(m => {
        messageHash.set(m.id, m)
      })
      return userMessages.map(u => {
        const msg: MessageDetail = messageHash.get(u.msgId)
        const item: MessageListItem = {
          id: u.id,
          isRead: u.isRead,
          sequence: u.sequence,
          createdAt: msg === null ? new Date() : msg.createdAt
        }
        return item
      })
    }
    return []
  }

  // 消息列表
  async getMessageDetail (currentUserId: string, param: BaseIdsArrayReq): Promise<MessageDetailItem[]> {
    const userMessages = await this.prisma.userMessage.findMany({
      where: {
        uid: currentUserId,
        msgId: { in: param.ids }
      },
      select: {
        msgId: true
      }
    })
    if (userMessages.length <= 0) {
      return []
    }
    const messages = await this.prisma.messageDetail.findMany({
      where: {
        id: { in: userMessages.map(u => u.msgId) }
      }
    })
    if (messages.length > 0) {
      const messageHash = new Map()
      messages.forEach(m => {
        messageHash.set(m.id, m)
      })
      return userMessages.map(u => {
        const msg: MessageDetail = messageHash.get(u.msgId)
        if (msg === null) {
          return new MessageDetailItem()
        }
        const item: MessageDetailItem = {
          ...msg,
          extra: msg.extra as MessageExtra,
          action: msg.action as MessageAction
        }
        // 如果是撤回，则内容消失
        if (item.status === 2) {
          item.content = ''
        }

        return item
      }).filter(i => i.id !== null)
    }
    return []
  }

  // （双向）撤回消息-根据消息IDs (物理删除)
  async pullBack (currentUserId: string, param: BaseIdsArrayReq): Promise<any> {
    const messages = await this.prisma.messageDetail.findMany({
      where: {
        fromUid: currentUserId,
        id: { in: param.ids }
      },
      select: { id: true }
    })
    if (messages.length > 0) {
      const msgIds = messages.map(m => m.id)
      await this.prisma.messageDetail.deleteMany({
        where: {
          id: { in: msgIds }
        }
      })
      await this.prisma.userMessage.deleteMany({
        where: {
          msgId: { in: msgIds }
        }
      })
    }
  }

  // （单向）删除消息-按消息Id
  async deleteSelfMsg (currentUserId: string, param: BaseIdsArrayReq): Promise<any> {
    await this.prisma.userMessage.deleteMany({
      where: {
        uid: currentUserId,
        msgId: { in: param.ids }
      }
    })
  }

  // （双向）删除所有消息-根据会话IDs
  async deleteChatByIds (currentUserId: string, param: MessageDeleteByIdReq): Promise<any> {
    await this.prisma.userMessage.deleteMany({
      where: {
        chatId: { in: param.chatIds },
        uid: currentUserId
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

  // 根据msgIds 所有发送者的消息物理删除
  async pullBackByChatIds (currentUserId: string, param: MessageDeleteByMsgIdReq): Promise<any> {
    const messages = await this.prisma.messageDetail.findMany({
      where: {
        id: { in: param.msgIds },
        fromUid: currentUserId
      },
      select: { id: true }
    })
    if (messages.length > 0) {
      const msgIds = messages.map(m => m.id)
      await this.prisma.messageDetail.deleteMany({
        where: {
          id: { in: msgIds }
        }
      })
      await this.prisma.userMessage.deleteMany({
        where: {
          msgId: { in: msgIds }
        }
      })
    }
  }

  // 清空群消息
  async clearChatByChatIds (currentUserId: string, param: MessageDeleteByIdReq): Promise<any> {
    const chats = await this.prisma.chat.findMany({
      where: {
        id: { in: param.chatIds },
        type: 2,
        groupId: { not: null }
      },
      select: {
        id: true,
        groupId: true
      }
    })
    if (chats.length <= 0) { return }

    const groupIds: string[] = []
    chats.forEach(c => {
      if (c.groupId !== null) {
        groupIds.push(c.groupId)
      }
    })
    if (groupIds.length > 0) {
      // 符合管理权限的群
      const groups = await this.prisma.groupMembers.findMany({
        where: {
          groupId: { in: groupIds },
          uid: currentUserId,
          role: { in: [GroupMemberRole.MANAGER, GroupMemberRole.OWNER] }
        }
      })
      if (groups.length > 0) {
        const messageGroupIds = new Set(groups.map(g => g.id))
        const delChatIds = chats.filter(c => {
          return c.groupId !== null && messageGroupIds.has(c.groupId)
        }).map(c => c.id)
        await this.prisma.messageDetail.deleteMany({
          where: {
            chatId: { in: delChatIds }
          }
        })
        await this.prisma.userMessage.deleteMany({
          where: {
            chatId: { in: delChatIds }
          }
        })
      }
    }
  }

  /**
   * 根据chatId 清除消息
   * @param currentUserId
   * @param chatIds
   */
  async clearMessageByChatIds (currentUserId: string, chatIds: string[]): Promise<void> {
    await this.prisma.userMessage.deleteMany({
      where: {
        uid: currentUserId,
        chatId: { in: chatIds }
      }
    })
    //
    const aliveMessages = await this.prisma.userMessage.findMany({
      where: {
        chatId: { in: chatIds }
      },
      select: {
        chatId: true
      }
    })
    // 判断两边都被删除，取得差集，删掉所得差集的chatIds的message
    const dropChatIds = commonUtil.arrayDifference(chatIds, aliveMessages.map(a => a.chatId))
    await this.prisma.messageDetail.deleteMany({
      where: {
        chatId: { in: dropChatIds }
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
