import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
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
  MessageDetailListReq,
  MessageSendResp
} from '../controllers/message.dto'
import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { Prisma, MessageDetail } from '@prisma/client'
import { isNumber } from 'class-validator'
import { ChatTypeEnum, MessageStatusEnum, MessageTypeEnum, RedPacketSourceEnum } from '@/enums'
import { DropSimpleChatResult } from '../controllers/chat.dto'
import { ChatService } from './chat.service'
import { UserMessageService } from './user-message.service'
import { ChatUserService } from './chat-user.service'
import commonUtil from '@/utils/common.util'
import { RedPacketInfo } from '@/modules/wallet/controllers/red-packet.dto'
import { SocketGateway } from '@/modules/socket/socket.gateway'
import { SocketMessageEvent } from '@/modules/socket/socket.dto'
import { FirebaseService } from '@/modules/common/services/firebase.service'
import { Message, MulticastMessage } from 'firebase-admin/messaging'
import { SenderService } from './sender.service'
@Injectable()
export class MessageService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly userMessageService: UserMessageService,
    private readonly chatUserService: ChatUserService,
    private readonly socketGateway: SocketGateway,
    private readonly firebaseService: FirebaseService,
    private readonly senderService: SenderService
  ) {}

  /**
   * 发起转账消息
   * @param currentUserId
   */
  async sendRemitMessage (
    id: string,
    currentUserId: string,
    objUid: string,
    type: MessageTypeEnum,
    isEnc: number,
    extra: MessageExtra,
    action: MessageAction,
    content: string,
    chatId: string
  ): Promise<any> {
    // const chatId = await this.chatService.findChatIdByUserId(currentUserId, objUid)
    const sequence = await this.findMaxSequenceByChatId(chatId)

    const messageInput: Prisma.MessageDetailCreateInput = {
      id,
      chatId,
      content,
      type,
      isEnc,
      fromUid: currentUserId,
      extra: JSON.stringify(extra),
      action: JSON.stringify(action),
      status: MessageStatusEnum.NORMAL,
      sequence
    }

    const message = await this.create(messageInput)
    const uids = await this.chatUserService.findUidByChatId(chatId)
    // sequence 这里应该是 消息最大序号 + 1
    await this.chatService.increaseSequence(chatId, sequence)
    const userMsgs = uids.map(u => {
      const userMsg: Prisma.UserMessageCreateInput = {
        uid: u,
        msgId: message.id,
        isRead: CommonEnum.OFF,
        sequence,
        chatId
      }
      return userMsg
    })
    await this.userMessageService.createMany(userMsgs)
    await this.chatUserService.userChatHide(currentUserId, { ids: [chatId] }, false)
    const result: MessageSendResp = {
      id,
      sequence,
      fromUid: currentUserId,
      time: message.createdAt
    }

    const socketData: SocketMessageEvent = {
      chatId,
      msgId: message.id,
      sequence,
      date: message.createdAt,
      type: 1
    }
    this.socketGateway.sendBatchMessage(Array.from(uids), socketData)

    return result
  }

  /**
   * 发起红包消息
   * @param currentUserId
   */
  async sendRedPacketMessage (
    id: string,
    currentUserId: string,
    sourceType: RedPacketSourceEnum,
    isEnc: number,
    extra: MessageExtra,
    action: MessageAction,
    redPacketId: string,
    objUid: string | null,
    content: string,
    groupId?: string
  ): Promise<RedPacketInfo> {
    let chatId: string
    if (sourceType === RedPacketSourceEnum.GROUP) {
      const _groupId: string = commonUtil.nullThrow(groupId)
      chatId = (await this.chatService.findChatByGroupId(currentUserId, _groupId)).id
    } else {
      const _objUid = commonUtil.nullThrow(objUid)
      chatId = await this.chatService.findChatIdByUserId(currentUserId, _objUid)
    }

    const sequence = await this.findMaxSequenceByChatId(chatId)

    const messageInput: Prisma.MessageDetailCreateInput = {
      id,
      chatId,
      content,
      type: MessageTypeEnum.RED_PACKET,
      isEnc,
      fromUid: currentUserId,
      extra: JSON.stringify(extra),
      action: JSON.stringify(action),
      sequence,
      status: MessageStatusEnum.NORMAL
    }

    const message = await this.create(messageInput)
    // sequence 这里应该是 消息最大序号 + 1
    await this.chatService.increaseSequence(chatId, sequence)
    const uIds = await this.chatUserService.findUidByChatId(chatId)
    const userMsgs = uIds.map(u => {
      const userMsg: Prisma.UserMessageCreateInput = {
        uid: u,
        msgId: message.id,
        isRead: CommonEnum.OFF,
        sequence,
        chatId
      }
      return userMsg
    })
    await this.userMessageService.createMany(userMsgs)
    await this.chatUserService.userChatHide(currentUserId, { ids: [chatId] }, false)
    const result: RedPacketInfo = {
      chatId,
      msgId: message.id,
      sequence,
      packetId: redPacketId,
      createdAt: message.createdAt,
      fromUid: message.fromUid,
      remark: extra.remark ?? ''
    }

    const socketData: SocketMessageEvent = {
      chatId: result.chatId,
      msgId: result.msgId,
      sequence: result.sequence,
      date: result.createdAt,
      type: 1
    }
    this.socketGateway.sendBatchMessage(Array.from(uIds), socketData)

    return result
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
    await this.prisma.messageDetail.deleteMany({
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

  async pushMessage (message: MessageDetail, receiveIds: string[], chatType: ChatTypeEnum): Promise<void> {
    const socketData: SocketMessageEvent = {
      chatId: message.chatId,
      msgId: message.id,
      sequence: message.sequence,
      date: message.createdAt,
      type: 1
    }
    // 发送失败的，需要进行推送
    await this.senderService.publishMessageTopic(socketData)

    // const failedIds = this.socketGateway.sendBatchMessage(Array.from(receiveIds), socketData)
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: receiveIds
        }
      },
      select: {
        id: true,
        userSequence: true,
        msgToken: true
      }
    })

    this.senderService.onlineCheck(users.map(u => u.userSequence)).then(offlineIds => {
      if (offlineIds.length > 0) {
        console.log('offlineIds', offlineIds)

        const offlineSet = new Set<number>(offlineIds)
        const offlineTokens = users.filter(u => offlineSet.has(u.userSequence) && u.msgToken !== undefined && u.msgToken !== null).map(u => u.msgToken ?? '')
        this.sendFirebase(offlineTokens, socketData, chatType).catch(err => {
          console.error(err)
        })
      }
    }).catch(e => {
      console.error(e)
    })
  }

  async sendFirebase (offlineTokens: string[], message: SocketMessageEvent, chatType: ChatTypeEnum): Promise<void> {
    if (offlineTokens.length <= 0) {
      return
    }
    let title = '单聊'
    if (chatType === ChatTypeEnum.GROUP) {
      title = '群聊'
    } else if (chatType === ChatTypeEnum.OFFICIAL) {
      title = '通知'
    }
    const firebaseMessage: MulticastMessage = {
      notification: {
        title,
        body: '您收到了一条' + title + '消息'
      },
      android: {
        // priority: 'high',
        notification: {
          imageUrl: 'https://foo.bar.pizza-monster.png'
        }
      },
      webpush: {
        headers: {
          image: 'https://foo.bar.pizza-monster.png'
        }
      },
      data: {
        sourceType: 'chat',
        subType: chatType.toString(),
        sourceId: message.chatId,
        sequence: message.sequence.toString()
      },
      tokens: offlineTokens
    }
    const result = await this.firebaseService.sendBatchMessage(offlineTokens, firebaseMessage)
    console.log('[firebase] result:', result)
  }
}
