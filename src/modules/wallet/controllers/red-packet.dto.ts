import { RedPacketSourceEnum, RedPacketTypeEnum } from '@/enums'
import { IsArray, IsInt, IsNotEmpty, IsString, isInt } from 'class-validator'

export class RedPacketCreateReq {
  @IsNotEmpty({ message: 'req error' })
    type: RedPacketTypeEnum

  @IsNotEmpty({ message: 'req error' })
    sourceType: RedPacketSourceEnum

  @IsInt()
    packetCount: number

  remark?: string
  @IsInt()
    singleAmount?: number

  @IsInt()
    totalAmount?: number

  @IsArray()
    objUIds?: string[]

  @IsString()
    groupId?: string
};

export class RedPacketInfo {
  chatId: string
  msgId: string
  sequence: number
  packetId: string
  // enable: boolean
  // expiredFlag: boolean
};

export class RedPacketRecordTempDto {
  id: string
  uid: string | null
  status: number
}

export class RedPacketResp {
  packetId: string
  enable: boolean
  expiredFlag: boolean
}

export class RedPacketReq {
  msgId: string
  packetId: string
}

export class RedPacketRecordItem {
  uid?: string | null
  uidDesc?: string | null
  avatar?: string | null
  amount?: number | null
  recordAt: Date | null
  status: number
};

export interface RedPacketDetail {
  packetId: string
  packetCount: number
  totalAmount: number
  type: RedPacketTypeEnum
  createdBy?: string
  createdUid: string
  createdAt: Date
  createdAvatar?: string
  expireSeconds: number
  enable: boolean
  expiredFlag: boolean
  remark: string
  records: RedPacketRecordItem[]
}
