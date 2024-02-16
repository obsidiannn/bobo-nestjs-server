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
  createdBy: string
  createdUid: string
  createdAt: Date
  expireSeconds: number
  enable: boolean
  remark: string
};

export class RedPacketDetail {

}
