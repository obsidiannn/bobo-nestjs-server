import { ChatStatusEnum, ChatTypeEnum } from '@/enums'
import { CommonEnum } from '@/modules/common/dto/common.dto'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

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

export class ChatItem {

}
export class ChatDetailItem {
  id: string
  chatUserId: string
  creatorId: string
  avatar: string
  sourceId: string
  chatAlias: string
  type: ChatTypeEnum
  status: number
  isEnc: number
  lastReadSequence: number
  lastSequence: number
  firstSequence: number
  lastTime: number | null
  createdAt: Date
  isTop: number
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

export class ChatUserTopUpdateDto {
  @IsNotEmpty()
  @IsString()
    chatUserId: string

  @IsBoolean()
  @IsNotEmpty()
    top: boolean
}
