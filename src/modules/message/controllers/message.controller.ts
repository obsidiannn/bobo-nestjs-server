import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { BaseIdsArrayReq, BaseArrayResp, CommonEnum } from '@/modules/common/dto/common.dto'
import {
  MessageSendReq,
  MessageListItem,
  MessageDetailItem,
  MessageDeleteByIdReq,
  MessageDeleteByMsgIdReq,
  MessageListReq,
  MessageDetailListReq,
  MessageExtra,
  MessageAction,
  MessageSendResp
} from '../controllers/message.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { MessageService } from '../services/message.service'
import { Request } from 'express'
import { MessageDetail, Prisma } from '@prisma/client'
import { ChatUserService } from '../services/chat-user.service'
import { UserMessageService } from '../services/user-message.service'
import { ChatService } from '../services/chat.service'
import { GroupMemberRoleEnum, MessageStatusEnum } from '@/enums'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'

@Controller('messages')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class MessageController {
  constructor (
    private readonly messageService: MessageService,
    private readonly chatUserService: ChatUserService,
    private readonly chatService: ChatService,
    private readonly userMessageService: UserMessageService

  ) { }

  // 发送消息
  @Post('send')
  async sendMessage (@Req() req: Request, @Body() param: MessageSendReq): Promise<MessageSendResp> {
    const currentUserId = req.uid
    const messageInput: Prisma.MessageDetailCreateInput = {
      id: param.id,
      chatId: param.chatId,
      content: param.content,
      type: param.type,
      isEnc: param.isEnc,
      fromUid: currentUserId,
      extra: JSON.stringify(param.extra),
      action: JSON.stringify(param.action),
      createdAt: new Date(),
      status: MessageStatusEnum.NORMAL
    }
    const sequence = await this.messageService.findMaxSequenceByChatId(param.chatId)
    messageInput.sequence = sequence
    const message = await this.messageService.create(messageInput)
    // chat 增加 sequence
    await this.chatService.increaseSequence(param.chatId, sequence)
    // sequence 这里应该是 消息最大序号 + 1
    const receiveIds = new Set<string>()
    // 如果指定recieveId 则
    if (param.receiveIds === undefined || param.receiveIds === null) {
      const chatUsers = await this.chatUserService.findUidByChatId(param.chatId)
      chatUsers.forEach(c => receiveIds.add(c))
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
    await this.userMessageService.createMany(userMsgs)
    await this.chatUserService.userChatHide(currentUserId, { ids: [param.chatId] }, false)
    return {
      sequence,
      id: param.id,
      fromUid: req.uid,
      time: message.createdAt
    }
  }

  // 我的消息列表
  @Post('list')
  async mineMessageList (@Req() req: Request, @Body() param: MessageListReq): Promise<BaseArrayResp<MessageListItem>> {
    const currentUserId = req.uid
    const up: boolean = param.direction === 'up'
    const sequence: any = {}
    if (up) {
      sequence.lte = param.sequence
    } else {
      sequence.gte = param.sequence
    }
    const userMessages = await this.userMessageService.findMany({
      where: {
        uid: currentUserId,
        chatId: param.chatId,
        sequence
      },
      skip: 0,
      take: param.limit ?? 20,
      orderBy: {
        sequence: up ? 'desc' : 'asc'
      }
    })
    if (userMessages.length <= 0) {
      return { items: [] }
    }
    const maxSequence = up ? userMessages[userMessages.length - 1].sequence : userMessages[0].sequence
    const data = userMessages.map(u => {
      const item: MessageListItem = {
        id: u.id,
        msgId: u.msgId,
        isRead: u.isRead,
        sequence: u.sequence,
        createdAt: u.createdAt
      }
      return item
    })
    // 更新sequence
    await this.chatUserService.refreshSequence(req.uid, param.chatId, maxSequence)
    return { items: data }
  }

  // 消息详情列表
  @Post('detail')
  async getMessageDetail (@Req() req: Request, @Body() param: MessageDetailListReq): Promise<BaseArrayResp<MessageDetailItem>> {
    const currentUserId = req.uid
    const userMessages = await this.userMessageService.findMany({
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
      return { items: [] }
    }
    const messages = await this.messageService.findManyByMsgId(userMessages.map(u => u.msgId))
    if (messages.length > 0) {
      const messageHash = new Map()
      messages.forEach(m => {
        messageHash.set(m.id, m)
      })

      // 已读 + 更新最大read sequence
      await this.userMessageService.readMany(userMessages.map(u => u.id))
      const data = userMessages.map(u => {
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
      return { items: data }
    }
    return { items: [] }
  }

  // 撤回消息
  @Post('delete-batch')
  async pullBack (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    const currentUserId = req.uid
    const messages = await this.messageService.findMany({
      where: {
        fromUid: currentUserId,
        id: { in: param.ids }
      },
      select: { id: true }
    })
    if (messages.length > 0) {
      const msgIds = messages.map(m => m.id)
      await this.messageService.deleteByIds(msgIds)
      await this.userMessageService.deleteByMsgIds(msgIds)
    }
  }

  // （单向）删除消息-按消息Id
  @Post('delete-self-all')
  async deleteSelfMsg (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<any> {
    await this.messageService.deleteSelfMsg(req.uid, param.ids)
  }

  // （双向）删除所有消息-根据会话IDs
  @Post('delete-chat-ids')
  async deleteChatByIds (@Req() req: Request, @Body() param: MessageDeleteByIdReq): Promise<any> {
    await this.messageService.deleteChatByIds(req.uid, param.chatIds)
  }

  // （单向）删除所有消息-根据会话IDs 解除自己与会话消息的关系
  @Post('delete-self-chat-ids')
  async deleteSelfChatByIds (@Req() req: Request, @Body()param: MessageDeleteByIdReq): Promise<any> {
    // 首先必须身处chat内
    const userChats = await this.chatUserService.findByUidAndChatIdIn(param.chatIds, req.uid)
    if (userChats.length > 0) {
      // 找到单聊消息
      const deleteChats = await this.chatService.findMany({
        where: {
          type: 1,
          id: { in: userChats.map(c => c.chatId) }
        },
        select: { id: true }
      })
      if (deleteChats.length > 0) {
        const chatIds = deleteChats.map(c => c.id)
        await this.chatUserService.deleteByChatIds(chatIds)
        await this.userMessageService.deleteByChatIds(chatIds)
      }
    }
  }

  // 撤回消息 根据messageIds 所有发送者的消息物理删除
  @Post('revoke-chat-ids')
  async pullBackByChatIds (@Req() req: Request, @Body()param: MessageDeleteByMsgIdReq): Promise<any> {
    const messages = await this.messageService.findMany({
      where: {
        id: { in: param.msgIds },
        fromUid: req.uid
      },
      select: { id: true }
    })
    if (messages.length > 0) {
      const msgIds = messages.map(m => m.id)
      await this.messageService.deleteByIds(msgIds)
      await this.userMessageService.deleteByMsgIds(msgIds)
    }
    // await this.messageService.pullBackByChatIds(req.uid, param)
  }

  // 清空群消息
  @Post('clear-chat-ids')
  async clearChatByChatIds (@Req() req: Request, @Body()param: MessageDeleteByIdReq): Promise<any> {
    const currentUserId: string = req.uid
    const chats = await this.chatService.findMany({
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
      const groups = await this.chatUserService.findGroupRoleByGroupIds(groupIds, currentUserId, [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER])

      if (groups.length > 0) {
        const messageGroupIds = new Set(groups.map(g => g.id))
        const delChatIds = chats.filter(c => {
          return c.groupId !== null && messageGroupIds.has(c.groupId)
        }).map(c => c.id)
        await this.messageService.deleteByChatIds(delChatIds)
        await this.userMessageService.deleteByChatIds(delChatIds)
      }
    }
  }
}
