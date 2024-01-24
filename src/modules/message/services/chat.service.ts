import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AddChatDto, ChatDetailItem, ChatListItem, ChatTypeEnum } from '../controllers/chat.dto'
import { Prisma } from '@prisma/client'
import { BaseIdsArrayReq, CommonEnum } from '@/modules/common/dto/common.dto'
import { strMd5 } from '@/utils/buffer.util'
import commonUtil from '@/utils/common.util'

@Injectable()
export class ChatService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  // 增加群组chat
  async addGroupChat (currentUserId: string, param: AddChatDto): Promise<void> {
    const groupChat = await this.prisma.chat.count({
      where: { groupId: param.groupId }
    })
    if (groupChat > 0) {
      return
    }
    const input: Prisma.ChatCreateInput = {
      ...param,
      type: ChatTypeEnum.GROUP,
      status: CommonEnum.ON,
      creatorUId: currentUserId,
      lastReadSequence: 0,
      lastSequence: 0
    }
    const chat = await this.prisma.chat.create({ data: input })
    const chatUserInput: Prisma.ChatUserCreateInput = {
      uid: currentUserId,
      chatId: chat.id,
      isTop: CommonEnum.OFF,
      isMute: CommonEnum.OFF,
      isShow: CommonEnum.ON,
      isHide: CommonEnum.OFF,
      maxReadSeq: 0,
      lastOnlineTime: new Date(),
      userRef: '0'
    }
    await this.prisma.chatUser.create({ data: chatUserInput })
  }

  /**
   * 增加单个 group chat user
   * @param groupId
   * @param memberId
   * @param currentUserId
   */
  async addChatGroupMember (groupId: string, memberIds: string[], currentUserId?: string): Promise<void> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        groupId,
        type: ChatTypeEnum.GROUP
      }
    })
    if (chat !== null) {
      const chatUsers = await this.prisma.chatUser.findMany({
        where: {
          chatId: chat.id,
          uid: { in: memberIds }
        },
        select: {
          uid: true
        }
      })
      const saveMemberIds = commonUtil.arrayDifference(memberIds, chatUsers.map(u => u.uid))
      if (saveMemberIds.length > 0) {
        const saveMembers = saveMemberIds.map(uid => {
          const chatUserInput: Prisma.ChatUserCreateInput = {
            uid,
            chatId: chat.id,
            isTop: CommonEnum.OFF,
            isMute: CommonEnum.OFF,
            isShow: CommonEnum.ON,
            isHide: CommonEnum.OFF,
            maxReadSeq: chat.lastSequence,
            lastOnlineTime: new Date(),
            userRef: '0'
          }
          return chatUserInput
        })
        await this.prisma.chatUser.createMany({ data: saveMembers })
      }
    }
  }

  /**
 *
 * @param groupId 群组移除会话
 * @param memberIds
 */
  async removeChatGroupMember (groupId: string, memberIds: string[]): Promise<string[]> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        groupId,
        type: ChatTypeEnum.GROUP
      }
    })
    if (chat !== null) {
      await this.prisma.chatUser.deleteMany({
        where: {
          chatId: chat.id,
          uid: { in: memberIds }
        }
      })
      return [chat.id]
    }
    return []
  }

  async removeChatGroupsMember (groupIds: string[], memberId: string): Promise<string[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        groupId: { in: groupIds },
        type: ChatTypeEnum.GROUP
      },
      select: { id: true }
    })
    if (chats.length > 0) {
      const chatIds = chats.map(c => c.id)
      await this.prisma.chatUser.deleteMany({
        where: {
          chatId: { in: chatIds },
          uid: memberId
        }
      })
      return chatIds
    } return []
  }

  /**
   * 全部删除 chat & chatUser
   * 调用前务必校验group 权限
   * @param groupIds
   * @returns chatIds
   */
  async dropChatGroups (groupIds: string[]): Promise<string[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        groupId: { in: groupIds },
        type: ChatTypeEnum.GROUP
      },
      select: { id: true }
    })
    if (chats.length > 0) {
      const chatIds = chats.map(i => i.id)
      await this.prisma.chat.deleteMany({
        where: {
          id: { in: chatIds }
        }
      })
      await this.prisma.chatUser.deleteMany({
        where: {
          chatId: { in: chatIds }
        }
      })
      return chatIds
    }
    return []
  }

  /**
   * 增加简单会话
   *  判断拉黑
   *  判断
   * @param currentUserId
   * @param param
   * @returns
   */
  async addSimpleChat (currentUserId: string, param: AddChatDto): Promise<string> {
    if (param.receiver === null) {
      throw new HttpException('error', HttpStatus.BAD_REQUEST)
    }
    // 判断拉黑
    // this.prisma.blacklist
    const userArray = [currentUserId, param.receiver]
    const userRef = this.userRefGenerate(userArray)
    const hasChat = await this.prisma.chatUser.findFirst({
      where: {
        userRef
      },
      select: { chatId: true }
    })
    if (hasChat !== null) {
      return hasChat.chatId
    }
    const input: Prisma.ChatCreateInput = {
      ...param,
      type: ChatTypeEnum.NORMAL,
      status: CommonEnum.ON,
      creatorUId: currentUserId,
      lastReadSequence: 0,
      lastSequence: 0
    }
    const chat = await this.prisma.chat.create({ data: input })

    const chatUserInputs = userArray.map(u => {
      const chatUserInput: Prisma.ChatUserCreateInput = {
        uid: u,
        chatId: chat.id,
        isTop: CommonEnum.OFF,
        isMute: CommonEnum.OFF,
        isShow: CommonEnum.ON,
        isHide: CommonEnum.OFF,
        maxReadSeq: 0,
        lastOnlineTime: new Date(),
        userRef
      }
      return chatUserInput
    })

    await this.prisma.chatUser.createMany({ data: chatUserInputs })
    return chat.id
  }

  // 获取我的会话列表
  async mineChatList (currentUserId: string): Promise<ChatListItem[]> {
    const chatList = await this.prisma.chatUser.findMany({
      where: {
        uid: currentUserId
      }
    })
    return chatList.map(c => {
      const item: ChatListItem = {
        ...c,
        lastOnlineTime: c.lastOnlineTime
      }
      return item
    })
  }

  // 会话详情
  async chatDetail (currentUserId: string, param: BaseIdsArrayReq): Promise<ChatDetailItem[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        id: { in: param.ids }
      }
    })
    return chats.map(c => {
      const item: ChatDetailItem = {
        ...c,
        creatorId: c.creatorUId
      }
      return item
    })
  }

  // 删除会话
  async deleteChat (currentUserId: string, param: BaseIdsArrayReq): Promise<any> {
    await this.prisma.chatUser.deleteMany({
      where: {
        chatId: { in: param.ids },
        uid: currentUserId
      }
    })
  }

  /**
   * 删除的chatIds
   * @param currentUserId
   * @param targetUIds
   * @param simple 是否为双向删除 true: 单向，false 双向
   * @returns chatIds
   */
  async deleteSimpleChat (currentUserId: string, targetUIds: string [], simple: boolean, chatType: ChatTypeEnum): Promise<string[]> {
    return []
  }

  // 单聊会话索引生成
  userRefGenerate (userIds: string[]): string {
    userIds.sort()
    const userRef = userIds.join(',')
    return strMd5(userRef)
  }
}
