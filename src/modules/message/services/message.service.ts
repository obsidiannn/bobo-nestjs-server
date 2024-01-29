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
    const messageInput: Prisma.MessageDetailCreateInput = {
      chatId: param.chatId,
      content: param.content,
      type: param.type,
      isEnc: param.isEnc,
      fromUid: currentUserId,
      extra: JSON.stringify(param.extra),
      action: JSON.stringify(param.action),
      createdAt: new Date(),
      status: MessageStatus.NORMAL
    }
    let sequence = 1
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

    messageInput.sequence = sequence
    const message = await this.prisma.messageDetail.create({ data: messageInput })
    // sequence 这里应该是 消息最大序号 + 1
    const receiveIds = new Set<string>()
    // 如果指定recieveId 则
    if (param.receiveIds === undefined || param.receiveIds === null) {
      const chatUsers = await this.prisma.chatUser.findMany({
        where: { chatId: param.chatId },
        select: { uid: true }
      })
      chatUsers.forEach(c => receiveIds.add(c.uid))
    } else {
      param.receiveIds.forEach(u => { receiveIds.add(u) })
    }
    receiveIds.add(currentUserId)
    const userMsgs = Array.from(receiveIds).map(u => {
      const userMsg: Prisma.UserMessageCreateInput = {
        uid: u,
        msgId: message.id,
        isRead: CommonEnum.OFF,
        sequence,
        chatId: param.chatId
      }
      return userMsg
    })
    await this.prisma.userMessage.createMany({ data: userMsgs })
    await this.chatService.userChatHide(currentUserId, { ids: [param.chatId] }, false)
  }

  // 消息列表
  async mineMessageList (currentUserId: string, param: MessageListReq): Promise<MessageListItem[]> {
    const up: boolean = param.direction === 'up'
    const sequence: any = {}
    if (up) {
      sequence.lte = param.sequence
    } else {
      sequence.gte = param.sequence
    }
    const userMessages = await this.prisma.userMessage.findMany({
      where: {
        uid: currentUserId,
        chatId: param.chatId,
        sequence
      },
      take: 100,
      orderBy: {
        sequence: 'asc'
      }
    })
    if (userMessages.length <= 0) {
      return []
    }

    return userMessages.map(u => {
      const item: MessageListItem = {
        id: u.id,
        isRead: u.isRead,
        sequence: u.sequence,
        createdAt: u.createdAt
      }
      return item
    })
  }

  // 消息详情列表
  async getMessageDetail (currentUserId: string, param: MessageDetailListReq): Promise<MessageDetailItem[]> {
    const userMessages = await this.prisma.userMessage.findMany({
      where: {
        uid: currentUserId,
        msgId: { in: param.ids },
        chatId: param.chatId
      },
      select: {
        id: true,
        msgId: true,
        sequence: true
      },
      orderBy: {
        sequence: 'asc'
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

      // 已读 + 更新最大read sequence
      const max = userMessages[userMessages.length - 1]
      await this.prisma.userMessage.updateMany({
        where: {
          id: { in: userMessages.map(u => u.id) },
          isRead: CommonEnum.OFF
        },
        data: {
          isRead: CommonEnum.ON
        }
      })
      await this.chatService.refreshSequence(currentUserId, param.chatId, max.sequence)
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
          role: { in: [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER] }
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
