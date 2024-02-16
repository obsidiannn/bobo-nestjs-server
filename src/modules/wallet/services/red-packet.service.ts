import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma, RedPacket } from '@prisma/client'
import { RedPacketCreateReq } from '../controllers/red-packet.dto'
import commonUtil from '@/utils/common.util'
import { CommonSecondEnum, RedPacketSourceEnum, RedPacketStatusEnum } from '@/enums'
import { CommonEnum } from '@/modules/common/dto/common.dto'

@Injectable()
export class RedPacketService {
  constructor (private readonly prisma: PrismaService) { }
  // 默认的红包过期时间
  defaultExpireSecond (): number {
    return CommonSecondEnum.DAY
  }

  /**
   * 群红包：普通 创建
   * red_packet + red_packet_record
   * @param currentUserId
   * @param param
   * @returns
   */
  async createGroupNormal (currentUserId: string, param: RedPacketCreateReq): Promise<RedPacket> {
    const singleAmount = commonUtil.nullThrow(param.singleAmount)
    const groupId = commonUtil.nullThrow(param.groupId)
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      sourceType: RedPacketSourceEnum.GROUP,
      totalAmount: singleAmount * param.packetCount,
      singleAmount,
      packetCount: param.packetCount,
      groupId,
      createdUid: currentUserId,
      status: CommonEnum.ON,
      consumeCount: 0,
      consumeAmount: 0,
      expireSecond: this.defaultExpireSecond()
    }
    const redPacket = await this.prisma.redPacket.create({ data: redPacketInput })
    const records: Prisma.RedPacketRecordCreateInput[] = []
    for (let index = 0; index < param.packetCount; index++) {
      const record: Prisma.RedPacketRecordCreateInput = {
        packetId: redPacket.id,
        amount: singleAmount,
        status: RedPacketStatusEnum.UN_USED
      }
      records.push(record)
    }
    await this.prisma.redPacketRecord.createMany({ data: records })
    return redPacket
  }

  /**
   * 群红包：手气 创建
   * @param currentUserId
   * @param param
   */
  async createGroupRandom (currentUserId: string, param: RedPacketCreateReq): Promise<RedPacket> {
    const totalAmount = commonUtil.nullThrow(param.totalAmount)
    const groupId = commonUtil.nullThrow(param.groupId)
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      sourceType: RedPacketSourceEnum.GROUP,
      totalAmount,
      packetCount: param.packetCount,
      groupId,
      createdUid: currentUserId,
      status: CommonEnum.ON,
      consumeCount: 0,
      consumeAmount: 0,
      expireSecond: this.defaultExpireSecond()
    }
    const redPacket = await this.prisma.redPacket.create({ data: redPacketInput })
    const records: Prisma.RedPacketRecordCreateInput[] = []
    for (let index = 0; index < param.packetCount; index++) {
      const record: Prisma.RedPacketRecordCreateInput = {
        packetId: redPacket.id,
        status: RedPacketStatusEnum.UN_USED
      }
      records.push(record)
    }
    await this.prisma.redPacketRecord.createMany({ data: records })
    return redPacket
  }

  /**
 * 群红包：指定 创建
 * @param currentUserId
 * @param param
 */
  async createGroupTargetUser (currentUserId: string, param: RedPacketCreateReq): Promise<RedPacket> {
    const singleAmount = commonUtil.nullThrow(param.singleAmount)
    const objUIds: string[] = commonUtil.emptyThrow(param.objUIds)
    const groupId = commonUtil.nullThrow(param.groupId)
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      sourceType: RedPacketSourceEnum.GROUP,
      singleAmount,
      totalAmount: singleAmount,
      packetCount: 1,
      groupId,
      createdUid: currentUserId,
      status: CommonEnum.ON,
      consumeCount: 0,
      consumeAmount: 0,
      expireSecond: this.defaultExpireSecond()
    }
    const redPacket = await this.prisma.redPacket.create({ data: redPacketInput })
    const record: Prisma.RedPacketRecordCreateInput = {
      packetId: redPacket.id,
      uid: objUIds[0],
      amount: singleAmount,
      status: RedPacketStatusEnum.UN_USED
    }
    await this.prisma.redPacketRecord.create({ data: record })
    return redPacket
  }

  /**
   * 个人红包 创建
   * @param currentUserId
   * @param param
   * @returns
   */
  async createUserPacket (currentUserId: string, param: RedPacketCreateReq): Promise<RedPacket> {
    const singleAmount = commonUtil.nullThrow(param.singleAmount)
    const objUIds: string[] = commonUtil.emptyThrow(param.objUIds)
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      sourceType: RedPacketSourceEnum.USER,
      singleAmount,
      totalAmount: singleAmount,
      packetCount: 1,
      createdUid: currentUserId,
      status: CommonEnum.ON,
      consumeCount: 0,
      consumeAmount: 0,
      expireSecond: this.defaultExpireSecond()
    }
    const redPacket = await this.prisma.redPacket.create({ data: redPacketInput })
    const record: Prisma.RedPacketRecordCreateInput = {
      packetId: redPacket.id,
      uid: objUIds[0],
      amount: singleAmount,
      status: RedPacketStatusEnum.UN_USED
    }
    await this.prisma.redPacketRecord.create({ data: record })
    return redPacket
  }
}
