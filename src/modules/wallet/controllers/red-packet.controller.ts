import { Body, Controller, HttpException, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common'
import { RedPacketCreateReq, RedPacketDetail, RedPacketInfo, RedPacketRecordItem, RedPacketResp, RedPacketTouchResult } from './red-packet.dto'
import { Request } from 'express'
import { RedPacketService } from '../services/red-packet.service'
import { BaseIdReq } from '@/modules/common/dto/common.dto'
import { BillInOutEnum, BillStatusEnum, BillTypeEnum, RedPacketResultEnum, RedPacketSourceEnum, RedPacketStatusEnum, RedPacketTypeEnum } from '@/enums'
import { RedPacket } from '@prisma/client'
import { WalletService } from '../services/wallet.service'
import { BillService } from '../services/bill.service'
import commonUtil from '@/utils/common.util'
import { randomUUID } from 'crypto'
import { MessageService } from '@/modules/message/services/message.service'
import { MessageExtra } from '@/modules/message/controllers/message.dto'
import { UserService } from '@/modules/user/services/user.service'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'
import { SocketMessageEvent } from '@/modules/socket/socket.dto'

@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
@Controller('red-packet')
export class RedPacketController {
  constructor (
    private readonly redPacketService: RedPacketService,
    private readonly walletService: WalletService,
    private readonly billService: BillService,
    private readonly messageService: MessageService,
    private readonly userService: UserService
  ) {}

  /**
   * 创建红包
   *   - 红包创建
   *   - 钱包划转
   *   - bill记录
   *   - 消息发起
   * @param req
   * @param param
   */
  @Post('create')
  async create (@Req() req: Request, @Body() param: RedPacketCreateReq): Promise<RedPacketInfo> {
    console.log('redpacket')

    console.log(param)

    const currentUserId: string = req.uid
    const type: number = param.type
    let redPacket: RedPacket | undefined
    // 红包创建
    if (param.sourceType === RedPacketSourceEnum.GROUP) {
      if (type === RedPacketTypeEnum.NORMAL) {
        redPacket = await this.redPacketService.createGroupNormal(currentUserId, param)
      } else if (type === RedPacketTypeEnum.RANDOM) {
        redPacket = await this.redPacketService.createGroupRandom(currentUserId, param)
      } else if (type === RedPacketTypeEnum.TARGETED) {
        redPacket = await this.redPacketService.createGroupTargetUser(currentUserId, param)
      }
    } else {
      if (type === RedPacketTypeEnum.TARGETED) {
        redPacket = await this.redPacketService.createUserPacket(currentUserId, param)
      }
    }
    if (!(redPacket !== null && redPacket !== undefined)) {
      console.log('errrrr')

      throw new HttpException('不支持的类型', HttpStatus.BAD_REQUEST)
    }
    const totalAmount = redPacket.totalAmount
    // 钱包划转
    await this.walletService.lock(currentUserId)
    try {
      const enable = await this.walletService.checkAmount(currentUserId, totalAmount)
      if (!enable) {
        throw new HttpException('余额不足', HttpStatus.BAD_REQUEST)
      }
      await this.walletService.addAmount(currentUserId, -totalAmount)
    } finally {
      await this.walletService.unlock(currentUserId)
    }
    // bill 记录
    const wallet = await this.walletService.findByUid(currentUserId)
    const transactionNo = randomUUID().replaceAll('-', '')
    await this.billService.createBill(req.uid, BillTypeEnum.RED_PACKET, totalAmount, BillInOutEnum.OUTCOME, BillStatusEnum.SUCCESS, req.uid, wallet.id, transactionNo, param.remark)

    const extra: MessageExtra = {
      id: redPacket.id,
      remark: param.remark,
      expireSecond: redPacket.expireSecond
    }
    // 发起转账消息
    let objUid: string | null
    if (param.objUIds !== undefined && commonUtil.notEmpty(param.objUIds)) {
      objUid = param.objUIds[0]
    } else { objUid = null }
    return await this.messageService.sendRedPacketMessage(param.id, req.uid, param.sourceType, 0, extra, {}, redPacket.id, objUid, param.content, param.groupId)
  }

  // 红包摘要
  @Post('info')
  async info (@Req() req: Request, @Body() param: BaseIdReq): Promise<RedPacketResp> {
    const redPacket = await this.redPacketService.findById(param.id)
    if (redPacket === null) {
      throw new HttpException('已失效', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    const expiredFlag = this.redPacketService.checkExpired(redPacket)
    const touchFlag = await this.redPacketService.checkMineFlag(param.id, req.uid) > 0
    const enable = await this.redPacketService.checkEnable(param.id) > 0
    return { packetId: redPacket.id, expiredFlag, enable, createdAt: redPacket.createdAt, expireSecond: redPacket.expireSecond, touchFlag }
  }

  // 红包详情
  @Post('detail')
  async detail (@Req() req: Request, @Body() param: BaseIdReq): Promise<RedPacketDetail | null> {
    const redPacket = await this.redPacketService.findById(param.id)
    if (redPacket === null) {
      return null
    }
    const records = await this.redPacketService.findRecordById(param.id)
    const uIds: string[] = []
    records.forEach(r => {
      if (r.uid !== null) {
        uIds.push(r.uid)
      }
    })
    uIds.push(redPacket.createdUid)

    const userHash = await this.userService.userHash(uIds)
    const creator = userHash.get(redPacket.createdUid)
    const expiredFlag = this.redPacketService.checkExpired(redPacket)
    const enable = records.filter(r => {
      return r.status === RedPacketStatusEnum.UN_USED
    }).length > 0
    const recordsDto: RedPacketRecordItem[] = records
      .filter(u => { return u.uid !== null }).map(r => {
        const dto: RedPacketRecordItem = {
          status: r.status,
          amount: r.amount,
          recordAt: r.recordAt
        }
        if (r.uid !== null) {
          const user = userHash.get(r.uid)
          if (user !== null && user !== undefined) {
            dto.uid = r.uid
            dto.uidDesc = user.name
            dto.avatar = user.avatar
          }
        }
        return dto
      })
    const result: RedPacketDetail = {
      packetId: redPacket.id,
      packetCount: redPacket.packetCount,
      totalAmount: redPacket.totalAmount,
      type: redPacket.type,
      createdUid: redPacket.createdUid,
      createdAt: redPacket.createdAt,
      createdBy: creator?.name,
      createdAvatar: creator?.avatar,
      expireSeconds: redPacket.expireSecond,
      enable,
      expiredFlag,
      remark: redPacket.remark,
      records: recordsDto
    }
    return result
  }

  /**
   * 领取红包
   *
   * red_packet_record
   * 钱包
   * bill
   * @param req
   * @param param
   */
  @Post('touch')
  async touch (@Req() req: Request, @Body() param: BaseIdReq): Promise<RedPacketTouchResult> {
    const record = await this.redPacketService.recordCreate(req.uid, param.id)
    if (typeof (record) === 'number') {
      return { result: record, packetId: param.id }
    }
    await this.walletService.addAmount(req.uid, record.amount)
    const bill = await this.billService.createBill(req.uid, BillTypeEnum.RED_PACKET, record.amount, BillInOutEnum.INCOME, BillStatusEnum.SUCCESS, req.uid, req.uid, '', '')
    await this.redPacketService.recordUpdate(record, bill.id)
    return { result: RedPacketResultEnum.TOUCHED, packetId: param.id }
  }
}
