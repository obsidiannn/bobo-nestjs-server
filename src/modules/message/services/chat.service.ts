import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AddChatDto, ChatDetailItem, ChatListItem, ChatTargetDto, DropSimpleChatResult } from '../controllers/chat.dto'
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

  /**
   * 根据uid查找chatId
   * @param uid
   * @param objUid
   * @returns
   */
  async findChatIdByUserId (uid: string, objUid: string): Promise<string> {
    const userRef = this.userRefGenerate([uid, objUid])
    console.log('userRef=', userRef)

    const result = await this.prisma.chatUser.findFirstOrThrow({
      where: {
        uid,
        userRef
      },
      select: {
        chatId: true
      }
    })
    return result.chatId
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
      console.log('saveMembers', saveMemberIds)

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
      lastSequence: 0,
      userIds: [currentUserId, receiver]
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
      orderBy: [
        {
          isTop: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ]
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
    if (chatIds === null || chatIds === undefined) {
      return []
    }
    const chatArray = await this.prisma.chatUser.findMany({
      where: {
        chatId: { in: chatIds },
        uid: currentUserId
      },
      select: {
        chatId: true,
        maxReadSeq: true,
        lastOnlineTime: true,
        isTop: true,
        id: true
      }
    })
    const chatUserHash = new Map<string, any>()
    chatArray.forEach(c => {
      chatUserHash.set(c.chatId, c)
      // chatUserHash.set(c.chatId, [c.maxReadSeq, c.lastOnlineTime.getTime(), c.isTop])
    })
    const chats = await this.prisma.chat.findMany({
      where: {
        id: { in: chatArray.map(c => c.chatId) }
      }
    })

    const groupChat: string[] = []
    const userChat: string[] = []

    const firstSequences = await this.prisma.userMessage.groupBy({
      where: {
        chatId: { in: chatIds },
        uid: currentUserId
      },
      by: ['chatId'],
      _min: {
        sequence: true
      }
    })
    const firstSequenceHash = new Map<string, number>()
    firstSequences.forEach(f => {
      firstSequenceHash.set(f.chatId, f._min.sequence ?? 1)
    })
    const chatMap = new Map<string, Chat>()
    chats.forEach(c => {
      chatMap.set(c.id, c)
      if (c.type === ChatTypeEnum.GROUP) {
        groupChat.push(c.groupId ?? '')
      } else if (c.type === ChatTypeEnum.NORMAL) {
        userChat.push((c.userIds ?? []).find(id => id !== currentUserId) ?? '')
      }
    })
    const groupHash = await this.chatGroupInfo(groupChat)
    const userHash = await this.chatUserInfo(userChat, currentUserId)

    return chatIds.filter(id => chatMap.has(id))
      .map(id => {
        const c = chatMap.get(id)
        if (c === null || c === undefined) {
          throw new HttpException('error', HttpStatus.BAD_REQUEST)
        }
        // [c.maxReadSeq, c.lastOnlineTime.getTime(), c.isTop]
        const chatUserItem = chatUserHash.get(c.id) ?? undefined
        const item: ChatDetailItem = {
          ...c,
          chatUserId: chatUserItem !== undefined ? chatUserItem.id : '',
          avatar: '',
          sourceId: '',
          chatAlias: '',
          firstSequence: firstSequenceHash.get(c.id) ?? c.lastSequence,
          creatorId: c.creatorUId,
          lastReadSequence: chatUserItem !== undefined ? chatUserItem.maxReadSeq : 0,
          lastTime: chatUserItem !== undefined ? chatUserItem.lastOnlineTime.getTime() : 0,
          isTop: chatUserItem !== undefined ? chatUserItem.isTop : CommonEnum.OFF
        }
        if (c.type === ChatTypeEnum.GROUP) {
          const sourceId = c.groupId ?? ''
          item.sourceId = sourceId
          const group = groupHash.get(sourceId) ?? null
          if (group !== null) {
            item.avatar = group.avatar
            item.chatAlias = group.alias
          }
        } else if (c.type === ChatTypeEnum.NORMAL) {
          const sourceId = (c.userIds ?? []).find(id => id !== currentUserId) ?? ''
          item.sourceId = sourceId
          const user = userHash.get(sourceId) ?? null
          if (user !== null) {
            item.avatar = user.avatar
            item.chatAlias = user.alias
          }
        }
        return item
      })
  }

  async chatGroupInfo (groupIds: string[]): Promise<Map<string, ChatTargetDto>> {
    const data = await this.prisma.group.findMany({
      where: { id: { in: groupIds } },
      select: {
        id: true,
        avatar: true,
        name: true
      }
    })
    const result = new Map<string, ChatTargetDto>()
    data.forEach(d => {
      const item: ChatTargetDto = {
        avatar: d.avatar,
        alias: d.name
      }
      result.set(d.id, item)
    })
    return result
  }

  async chatUserInfo (userIds: string[], currentUserId: string): Promise<Map<string, ChatTargetDto>> {
    const data = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        avatar: true,
        name: true
      }
    })
    const friends = await this.prisma.friend.findMany({
      where: {
        objUid: { in: userIds },
        uid: currentUserId
      }
    })
    const result = new Map<string, ChatTargetDto>()
    data.forEach(d => {
      const item: ChatTargetDto = {
        avatar: d.avatar,
        alias: d.name
      }
      result.set(d.id, item)
    })
    // 替换为备注
    friends.forEach(f => {
      if (commonUtil.notBlank(f.remark ?? '')) {
        const user = result.get(f.objUid) ?? null
        if (user !== null) {
          user.alias = f.remark ?? ''
        }
      }
    })
    return result
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

  /**
   * 根据groupId获取chat
   * @param uid
   * @param groupId
   * @returns
   */
  async findChatByGroupId (uid: string, groupId: string): Promise<Chat> {
    const chat = await this.prisma.chat.findFirstOrThrow({
      where: {
        groupId,
        type: ChatTypeEnum.GROUP
      }
    })
    await this.prisma.chatUser.findFirstOrThrow({
      where: {
        uid,
        chatId: chat.id
      },
      select: { id: true }
    })
    return chat
  }

  // 变更chat max sequence
  async increaseSequence (chatId: string, sequence: number): Promise<number> {
    const result = await this.prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        lastSequence: sequence,
        updatedAt: new Date()
      },
      select: {
        id: true,
        lastSequence: true,
        type: true
      }
    })
    return result.type
  }

  // 单聊会话索引生成
  userRefGenerate (userIds: string[]): string {
    userIds.sort()
    const userRef = userIds.join(',')
    return strMd5(userRef)
  }
}
