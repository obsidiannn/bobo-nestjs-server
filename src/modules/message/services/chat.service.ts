import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AddChatDto, ChatDetailItem, ChatListItem, DropSimpleChatResult } from '../controllers/chat.dto'
import { Chat, Prisma } from '@prisma/client'
import { CommonEnum } from '@/modules/common/dto/common.dto'
import { strMd5 } from '@/utils/buffer.util'
import commonUtil from '@/utils/common.util'
import { ChatStatusEnum, ChatTypeEnum } from '@/enums'
@Injectable()
export class ChatService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findMany (param: Prisma.ChatFindManyArgs): Promise<Chat[]> {
    return await this.prisma.chat.findMany(param)
  }

  // 查找某人的好友chat
  async getChatHashByUserIds (currentUserId: string, uids: string[]): Promise<Map<string, string>> {
    const refs = uids.map(id => {
      return this.userRefGenerate([currentUserId, id])
    })
    const result = await this.prisma.chatUser.findMany({
      where: {
        uid: { not: currentUserId },
        userRef: { in: refs }
      },
      select: {
        uid: true,
        chatId: true
      }
    })
    const chatHash = new Map<string, string>()
    result.forEach(r => {
      chatHash.set(r.uid, r.chatId)
    })
    return chatHash
  }

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
 * 群组移除某个人会话
 * @param groupId
 * @param memberIds
 * @returns 相关的chatId 用来删除message
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

  /**
   * 群组移除某些人会话
   * @param groupIds
   * @param memberId
   * @returns 相关的chatId 用来删除message
   */
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
    if (param.receiver === undefined) {
      throw new HttpException('error', HttpStatus.BAD_REQUEST)
    }
    // 判断拉黑
    // this.prisma.blacklist
    const receiver = param.receiver === null ? '' : param.receiver
    const userArray: string[] = [currentUserId, receiver]
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
      type: ChatTypeEnum.NORMAL,
      status: ChatStatusEnum.ENABLE,
      isEnc: CommonEnum.ON,
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
      },
      orderBy: {
        createdAt: 'desc'
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
  async chatDetail (currentUserId: string, chatIds: string[]): Promise<ChatDetailItem[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        id: { in: chatIds }
      }
    })
    const chatArray = await this.prisma.chatUser.findMany({
      where: {
        chatId: { in: chatIds },
        uid: currentUserId
      },
      select: {
        chatId: true
      }
    })
    const exitChatIds = chatArray.map(c => c.chatId)
    return chats.filter(c => exitChatIds.includes(c.id)).map(c => {
      const item: ChatDetailItem = {
        ...c,
        creatorId: c.creatorUId
      }
      return item
    })
  }

  //   /**
  //  * 删除会话
  //  * @param currentUserId
  //  * @param param
  //  * @param hide true: 隐藏，false： 展开
  //  */
  //   async userChatHide (currentUserId: string, param: BaseIdsArrayReq, hide: boolean): Promise<string[]> {
  //     const chatArray = await this.prisma.chatUser.findMany({
  //       where: {
  //         chatId: { in: param.ids },
  //         uid: currentUserId
  //       },
  //       select: {
  //         chatId: true
  //       }
  //     })

  //     await this.prisma.chatUser.updateMany({
  //       where: {
  //         chatId: { in: param.ids },
  //         uid: currentUserId
  //       },
  //       data: {
  //         isShow: hide ? CommonEnum.OFF : CommonEnum.ON,
  //         isHide: hide ? CommonEnum.ON : CommonEnum.OFF
  //       }
  //     })
  //     return chatArray.map(c => c.chatId)
  //   }

  /**
   * 删除会话关系 （chatUser） 如果双方都不存在，则删除chat
   * @param currentUserId 当前用户
   * @param targetUIds 目标用户
   * @param simple 是否为双向删除 true: 单向，false 双向
   * @returns chat: 删掉的chat id，chatUser: 删掉的chatUser的chatId
   */
  async deleteSimpleChat (currentUserId: string, targetUIds: string [], simple: boolean, chatType: ChatTypeEnum): Promise<DropSimpleChatResult> {
    const result = {
      chat: [],
      chatUser: []
    }
    const userRefIndex: string[] = targetUIds.map(uid => {
      return this.userRefGenerate([currentUserId, uid])
    })

    const chatUsers = await this.prisma.chatUser.findMany({
      where: {
        userRef: { in: userRefIndex }
      }
    })
    if (chatUsers.length <= 0) {
      return result
    }

    // 单向删除，要检查对侧数据
    if (simple) {
      const existUserChat = new Set<string>()
      chatUsers.forEach(c => {
        if (c.uid !== currentUserId) {
          existUserChat.add(c.chatId)
        }
      })
      await this.prisma.chatUser.deleteMany({
        where: {
          uid: currentUserId,
          userRef: { in: userRefIndex }
        }
      })
      const chatIds = chatUsers.map(c => c.chatId)
      const deleteChats = commonUtil.arrayDifference(chatIds, Array.from(existUserChat))
      if (deleteChats.length > 0) {
        await this.prisma.chat.deleteMany({
          where: { id: { in: deleteChats } }
        })
      }
      return {
        chat: deleteChats,
        chatUser: chatIds
      }
    } else {
      const chatIds = chatUsers.map(c => c.chatId)
      await this.prisma.chat.deleteMany({
        where: { id: { in: chatIds } }
      })
      await this.prisma.chatUser.deleteMany({
        where: {
          chatId: { in: chatIds }
        }
      })
      return {
        chat: chatIds,
        chatUser: chatIds
      }
    }
  }

  // 单聊会话索引生成
  userRefGenerate (userIds: string[]): string {
    userIds.sort()
    const userRef = userIds.join(',')
    return strMd5(userRef)
  }
}
