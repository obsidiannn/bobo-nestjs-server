import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common'
import { RedPacketCreateReq, RedPacketDetail, RedPacketInfo } from './red-packet.dto'
import { Request } from 'express'
import { RedPacketService } from '../services/red-packet.service'
import { BaseIdReq } from '@/modules/common/dto/common.dto'
import { BillInOutEnum, BillStatusEnum, BillTypeEnum, RedPacketSourceEnum, RedPacketTypeEnum } from '@/enums'
import { RedPacket } from '@prisma/client'
import { WalletService } from '../services/wallet.service'
import { BillService } from '../services/bill.service'
import commonUtil from '@/utils/common.util'
import { randomUUID } from 'crypto'
import { MessageService } from '@/modules/message/services/message.service'
import { MessageExtra } from '@/modules/message/controllers/message.dto'

@Controller('red-packet')
export class RedPacketController {
  constructor (
    private readonly redPacketService: RedPacketService,
    private readonly walletService: WalletService,
    private readonly billService: BillService,
    private readonly messageService: MessageService
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
      if (type === RedPacketTypeEnum.NORMAL) {
        redPacket = await this.redPacketService.createUserPacket(currentUserId, param)
      }
    }
    if (!(redPacket !== null && redPacket !== undefined)) {
      throw new HttpException('不支持的类型', HttpStatus.BAD_REQUEST)
    }
    const totalAmount = redPacket.totalAmount
    // 钱包划转
    await this.walletService.lock(currentUserId)
    try {
      await this.walletService.addAmount(currentUserId, -totalAmount)
    } finally {
      await this.walletService.unlock(currentUserId)
    }
    // bill 记录
    const sysWalletId = await this.walletService.findSystemWallet()
    const transactionNo = randomUUID().replaceAll('-', '')
    const bill = await this.billService.createBill(req.uid, BillTypeEnum.RED_PACKET, totalAmount, BillInOutEnum.OUTCOME, BillStatusEnum.SUCCESS, req.uid, sysWalletId, transactionNo, param.remark)

    const extra: MessageExtra = {
      id: redPacket.id,
      remark: param.remark,
      expireSecond: redPacket.expireSecond
    }
    // 发起转账消息
    const objUid:string = (commonUtil.notEmpty(param.objUIds)) ? param.objUIds?[0] : null
    await this.messageService.sendRedPacketMessage(req.uid, param.sourceType, 0, extra, {}, param.groupId)
    const result:RedPacketInfo = {}
    return result
  }

  // 红包摘要
  @Post('info')
  async info (@Req() req: Request, @Body() param: BaseIdReq): Promise<RedPacketInfo> {

  }

  // 红包详情
  @Post('detail')
  async detail (@Req() req: Request, @Body() param: BaseIdReq): Promise<RedPacketDetail> {

  }

  // 领取红包
  @Post('apply')
  async apply (@Req() req: Request, @Body() param: BaseIdReq): Promise<RedPacketInfo> {

  }
}
