import { ChatStatusEnum, ChatTypeEnum } from '@/enums'
import { CommonEnum } from '@/modules/common/dto/common.dto'

export class AddChatDto {
  groupId: string | null
  type: ChatTypeEnum
  status: ChatStatusEnum
  isEnc: CommonEnum
  receiver?: string | null
}
export class ChatListItem {
  id: string
  chatId: string
  isTop: number
  isMute: number
  isShow: number
  isHide: number
  maxReadSeq: number
  lastOnlineTime: Date
}

export class ChatDetailItem {
  id: string
  creatorId: string
  avatar: string
  sourceId: string
  chatAlias: string
  type: ChatTypeEnum
  status: number
  isEnc: number
  lastReadSequence: number
  lastSequence: number
  lastTime: number | null
  createdAt: Date
}

// chat: 删掉的chat id，chatUser: 删掉的chatUser的chatId
export class DropSimpleChatResult {
  chat: string[]
  chatUser: string[]
}

export class ChatTargetDto {
  avatar: string
  alias: string
}
