import { CommonEnum } from '@/modules/common/dto/common.dto'

export class AddChatDto {
  groupId: string | null
  type: ChatTypeEnum
  status: ChatStatusEnum
  isEnc: CommonEnum
  receiver: string | null
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
  type: number
  status: number
  isEnc: number
  lastReadSequence: number
  lastSequence: number
  lastTime: Date | null
  createdAt: Date
}

// 1-单聊 2-群聊 3 官方会话
export enum ChatTypeEnum {
  NORMAL = 1,
  GROUP = 2,
  OFFICIAL = 3
}
// 状态 1-正常 2-禁用
export enum ChatStatusEnum {
  ENABLE = 1,
  DISABLE = 2
}
