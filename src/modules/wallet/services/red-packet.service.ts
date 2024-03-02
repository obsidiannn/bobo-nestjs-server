import { PrismaService } from '@/modules/common/services/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma, RedPacket, RedPacketRecord } from '@prisma/client'
import { RedPacketCreateReq, RedPacketRecordTempDto } from '../controllers/red-packet.dto'
import commonUtil from '@/utils/common.util'
import { CommonSecondEnum, RedPacketSourceEnum, RedPacketStatusEnum, RedPacketTypeEnum } from '@/enums'
import { CommonEnum } from '@/modules/common/dto/common.dto'

@Injectable()
export class RedPacketService {
  constructor (private readonly prisma: PrismaService) { }
  // 默认的红包过期时间
  defaultExpireSecond (): number {
    return CommonSecondEnum.DAY
  }

  async checkGroupMemberCount (groupId: string, packetCount: number): Promise<void> {
    const memberCount = await this.prisma.groupMembers.count({
      where: { groupId }
    })
    if (memberCount < packetCount) {
      throw new HttpException('不可超过群聊人数', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   * 检查是否存在此群成员
   * @param groupId
   * @param packetCount
   */
  async checkGroupMemberExist (groupId: string, memberId: string): Promise<void> {
    const member = await this.prisma.groupMembers.count({
      where: {
        groupId,
        uid: memberId
      }
    })
    if (member <= 0) {
      throw new HttpException('没有此群成员', HttpStatus.BAD_REQUEST)
    }
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
    const remark = param.remark === undefined ? '恭喜发财' : param.remark
    await this.checkGroupMemberCount(groupId, param.packetCount)
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      remark,
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
    const remark = param.remark === undefined ? '恭喜发财' : param.remark
    await this.checkGroupMemberCount(groupId, param.packetCount)
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      remark,
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
    const randomAmount = commonUtil.randomSplit(param.packetCount, totalAmount)
    for (let index = 0; index < param.packetCount; index++) {
      const record: Prisma.RedPacketRecordCreateInput = {
        packetId: redPacket.id,
        status: RedPacketStatusEnum.UN_USED,
        amount: randomAmount[index]
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
    const remark = param.remark === undefined ? '恭喜发财' : param.remark
    await this.checkGroupMemberExist(groupId, objUIds[0])
    const redPacketInput: Prisma.RedPacketCreateInput = {
      type: param.type,
      remark,
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
    const remark = param.remark === undefined ? '恭喜发财' : param.remark
    const redPacketInput: Prisma.RedPacketCreateInput = {
      remark,
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

  async findById (packetId: string): Promise<RedPacket | null> {
    return await this.prisma.redPacket.findFirst({ where: { id: packetId } })
  }

  async findRecordIdById (packetId: string): Promise<RedPacketRecordTempDto[]> {
    const data = await this.prisma.redPacketRecord.findMany({
      where: {
        packetId
      },
      select: { id: true, uid: true, status: true }
    })
    return [...data]
  }

  async findRecordById (packetId: string): Promise<RedPacketRecord[]> {
    return await this.prisma.redPacketRecord.findMany({
      where: {
        packetId
      }
    })
  }

  async findRecordByIdAndStatus (packetId: string, status: RedPacketStatusEnum): Promise<RedPacketRecord[]> {
    return await this.prisma.redPacketRecord.findMany({
      where: {
        packetId,
        status
      }
    })
  }

  /**
   * 红包领取
   * @param uid
   * @param packetId
   */
  async recordCreate (uid: string, packetId: string): Promise<RedPacketRecord> {
    const packet = await this.findById(packetId)
    if (packet === null) {
      throw new HttpException('已失效', HttpStatus.BAD_REQUEST)
    }
    if (this.checkExpired(packet)) {
      throw new HttpException('已过期', HttpStatus.BAD_REQUEST)
    }
    // 检查是否已领取
    const record = await this.prisma.redPacketRecord.findFirst({
      where: {
        packetId,
        uid
      }
    })
    if (record !== null) {
      if (packet.type === RedPacketTypeEnum.TARGETED) {
        if (record.status !== RedPacketStatusEnum.UN_USED) {
          throw new HttpException('已领取', HttpStatus.BAD_REQUEST)
        }
      } else {
        throw new HttpException('已领取', HttpStatus.BAD_REQUEST)
      }
    }
    if (packet.type === RedPacketTypeEnum.NORMAL || packet.type === RedPacketTypeEnum.RANDOM) {
      const enableRecords = await this.findRecordByIdAndStatus(packetId, RedPacketStatusEnum.UN_USED)
      if (enableRecords.length <= 0) {
        throw new HttpException('已被领光', HttpStatus.BAD_REQUEST)
      }
      const data = enableRecords[commonUtil.randomIndex(enableRecords.length)]
      const locked = await this.recordLockOn(data.id)
      if (!locked) {
        throw new HttpException('已被领光', HttpStatus.BAD_REQUEST)
      }
      try {
        return await this.prisma.redPacketRecord.update({
          where: { id: data.id },
          data: {
            uid,
            recordAt: new Date(),
            status: RedPacketStatusEnum.USED
          }
        })
      } finally {
        await this.recordLockOff(data.id)
      }
    } else if (packet.type === RedPacketTypeEnum.TARGETED) {
      if (record === null) {
        throw new HttpException('error', HttpStatus.BAD_REQUEST)
      }
      const locked = await this.recordLockOn(record.id)
      if (!locked) {
        throw new HttpException('已被领光', HttpStatus.BAD_REQUEST)
      }
      try {
        return await this.prisma.redPacketRecord.update({
          where: { id: record.id },
          data: {
            uid,
            recordAt: new Date(),
            status: RedPacketStatusEnum.USED
          }
        })
      } finally {
        await this.recordLockOff(record.id)
      }
    }
    throw new HttpException('不支持的红包类型', HttpStatus.BAD_REQUEST)
  }

  async recordUpdate (record: RedPacketRecord, billId: string): Promise<void> {
    await this.prisma.redPacketRecord.update({
      where: { id: record.id },
      data: {
        billId
      }
    })
  }

  async recordLockOn (id: string): Promise<boolean> {
    return true
  }

  async recordLockOff (id: string): Promise<boolean> {
    return true
  }

  /**
   * 检查红包是否过期
   * @param packet
   * @returns true 已经过期 false 没有过期
   */
  checkExpired (packet: RedPacket): boolean {
    return new Date().getSeconds() >= (packet.createdAt.getSeconds() + packet.expireSecond)
  }
}
