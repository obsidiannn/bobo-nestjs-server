import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { MessageService } from './message.service'
import { Chat, ChatUser, OfficialUser, Prisma } from '@prisma/client'
import { ChatTypeEnum, GroupMemberRoleEnum, GroupMemberStatus, MessageStatusEnum, MessageTypeEnum, OfficialMessageTypeEnum, OfficialUserTypeEnum } from '@/enums'
import { ChatService } from './chat.service'
import { SenderService } from './sender.service'
import { ChatUserService } from './chat-user.service'
import { UserMessageService } from './user-message.service'
import { CommonEnum } from '@/modules/common/dto/common.dto'
import { MessageExtra } from '../controllers/message.dto'
import commonUtil from '@/utils/common.util'

@Injectable()
export class OfficialMessageService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly userMessageService: UserMessageService,
    private readonly chatUserService: ChatUserService,
    private readonly senderService: SenderService
  ) {}

  /**
   * 发起官方消息
   * 目前是 好友申请以及群加入申请
   * 1.好友申请
   *  fromUser
   *  objUId
   *
   * 2.群消息
   *  from user
   *  receiveIds
   *
   * @param currentUserId 发起人id
   * @param sourceId 被申请人id或者groupId
   */
  async sendOfficialMessage (
    currentUserId: string,
    officialMsgType: OfficialMessageTypeEnum,
    sourceId: string,
    extra: MessageExtra,
    content: string
  ): Promise<void> {
    const userIds: string[] = []
    if (officialMsgType === OfficialMessageTypeEnum.FRIEND_APPLY) {
      userIds.push(sourceId)
    } else if (officialMsgType === OfficialMessageTypeEnum.GROUP_APPLY) {
      userIds.push(...await this.findGroupManager(sourceId))
    }
    if (userIds.length <= 0) {
      return
    }
    const officialUsers = await this.prisma.officialUser.findMany({
      where: {
        type: OfficialUserTypeEnum.SYSTEM_CHAT,
        status: 1
      },
      take: 1
    })
    if (officialUsers.length <= 0) {
      return
    }
    const officialUser = officialUsers[0]

    const chatUsers = await this.findChatUserByOfficialUser(userIds, officialUser)
    const chatIds = chatUsers.map(u => (u.chatId))

    const sequenceMap = await this.messageService.findMaxSequenceByChatIds(chatIds)
    const userMessages: Prisma.UserMessageCreateInput[] = []
    const messages: Prisma.MessageDetailCreateInput[] = []

    for (let index = 0; index < chatUsers.length; index++) {
      const u = chatUsers[index]
      let sequence = sequenceMap.get(u.chatId)
      if (sequence === null || sequence === undefined) {
        sequence = 1
      }
      const messageInput: Prisma.MessageDetailCreateInput = {
        id: commonUtil.generateId(),
        chatId: u.chatId,
        content,
        type: MessageTypeEnum.OFFICIAL_MESSAGE,
        isEnc: 0,
        fromUid: currentUserId,
        extra: JSON.stringify(extra),
        action: {},
        status: MessageStatusEnum.NORMAL,
        sequence
      }

      const userMsg: Prisma.UserMessageCreateInput = {
        uid: u.uid,
        msgId: messageInput.id,
        isRead: CommonEnum.OFF,
        sequence,
        chatId: u.chatId
      }
      messages.push(messageInput)
      userMessages.push(userMsg)
    }
    await this.prisma.messageDetail.createMany({ data: messages })
    await this.prisma.userMessage.createMany({ data: userMessages })

    for (let index = 0; index < messages.length; index++) {
      const m = messages[index]
      await this.chatService.increaseSequence(m.chatId, m.sequence)
    }
  }

  /**
   * 找到指定user的sys chat user
   * @param userIds
   * @returns
   */
  async findChatUserByOfficialUser (userIds: string[], officialUser: OfficialUser): Promise<ChatUser[]> {
    const refIdxs = userIds.map(u => {
      return commonUtil.generateRef([u, officialUser.id])
    })
    return await this.prisma.chatUser.findMany({
      where: {
        userRef: { in: refIdxs }
      }
    })
  }

  async findGroupManager (groupId: string): Promise<string[]> {
    const groupMembers = await this.prisma.groupMembers.findMany({
      where: {
        role: { in: [GroupMemberRoleEnum.MANAGER, GroupMemberRoleEnum.OWNER] },
        groupId,
        status: GroupMemberStatus.NORMAL
      },
      select: {
        uid: true
      }
    })
    return groupMembers.map(g => g.uid)
  }
}
