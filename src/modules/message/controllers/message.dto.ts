import { BasePageReq, BasePageResp, CommonEnum, GroupTypeEnum } from '@/modules/common/dto/common.dto'
import { IsNotEmpty, ArrayNotEmpty, Matches, IsNumber } from 'class-validator'

export class MessageSendReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    chatId: string

  @IsNotEmpty({ message: 'not empty' })
    content: string

  @IsNotEmpty({ message: 'not empty' })
    type: number

  @IsNotEmpty({ message: 'not empty' })
    isEnc: number

  receiveIds?: string[]

  extra?: MessageExtra
  action?: MessageAction
}

export interface MessageSendResp {
  sequence: number
  id?: string
  fromUid: string
  content?: string
  time: Date
}

export class MessageListReq {
  @IsNotEmpty({ message: 'not empty' })
    chatId: string

  @IsNotEmpty({ message: 'not empty' })
    sequence: number

  @IsNotEmpty({ message: 'not empty' })
    direction: string

  @IsNumber()
    limit?: number
}

export class MessageDetailListReq {
  @IsNotEmpty({ message: 'not empty' })
    chatId: string

  @ArrayNotEmpty({ message: 'not empty' })
    ids: string[]

  // sequence start
  start: number
  // sequence end
  end: number
}

export class MessageListItem {
  id: string
  msgId: string
  isRead: number
  sequence: number
  createdAt: Date
}

export interface MessageExtra {
  // 备注
  remark?: string
  // 红包id
  id?: string
  // 过期时间
  expireSecond?: number
}

export interface MessageAction {
}

export class MessageDetailItem {
  id: string
  chatId: string
  fromUid: string
  content: string
  status: number
  type: number
  isEnc: number
  sequence: number | null
  extra: MessageExtra | null
  action: MessageAction | null
  createdAt: Date
}

export class MessageDeleteByIdReq {
  chatIds: string[]
}

export class MessageDeleteByMsgIdReq {
  msgIds: string[]
}
