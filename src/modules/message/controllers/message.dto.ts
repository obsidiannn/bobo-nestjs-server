import { BasePageReq, BasePageResp, CommonEnum, GroupTypeEnum } from '@/modules/common/dto/common.dto'
import { IsNotEmpty, ArrayNotEmpty, Matches } from 'class-validator'

export class MessageSendReq {
  id?: string

  @IsNotEmpty({ message: 'not empty' })
    chatId: string

  @IsNotEmpty({ message: 'not empty' })
    content: string

  @IsNotEmpty({ message: 'not empty' })
    type: number

  @IsNotEmpty({ message: 'not empty' })
    isEnc: number

  receiveIds?: string[]

  extra: MessageExtra
  action?: MessageAction
}

export class MessageListReq {
  @IsNotEmpty({ message: 'not empty' })
    chatId: string

  @IsNotEmpty({ message: 'not empty' })
    sequence: number

  @IsNotEmpty({ message: 'not empty' })
    direction: string
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
  isRead: number
  sequence: number
  createdAt: Date
}

export interface MessageExtra {

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