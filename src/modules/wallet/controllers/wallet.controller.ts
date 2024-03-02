import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, HttpException, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { WalletCardFillReq, WalletDetailResp, WalletRemitReq, WalletRemitResp } from './wallet.dto'
import { WalletService } from '../services/wallet.service'
import { BillService } from '../services/bill.service'
import { PrePaidService } from '../services/pre-paid.service'
import { Prisma } from '@prisma/client'
import { BillInOutEnum, BillStatusEnum, BillTypeEnum, MessageTypeEnum } from '@/enums'
import { BillDetailService } from '../services/bill-detail.service'
import { randomUUID } from 'crypto'
import { MessageService } from '@/modules/message/services/message.service'
import { CommonEnum } from '@/modules/common/dto/common.dto'

@Controller('wallet')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class WalletController {
  constructor (
    private readonly walletService: WalletService,
    private readonly billService: BillService,
    private readonly billDetailService: BillDetailService,
    private readonly prePaidService: PrePaidService,
    private readonly messageService: MessageService
  ) {}

  // 钱包详情
  @Post('detail')
  async detail (@Req() req: Request): Promise<WalletDetailResp> {
    const wallet = await this.walletService.findByUid(req.uid)
    return { balance: wallet.balance, currency: wallet.currency, type: wallet.type }
  }

  // 礼品卡充值
  @Post('fill/pre-paid-card')
  async fillByCard (@Req() req: Request, @Body() param: WalletCardFillReq): Promise<void> {
    const card = await this.prePaidService.findActiveByCardNo(param.cardNo)
    if (card === null) {
      throw new HttpException('卡无效', HttpStatus.BAD_REQUEST)
    }
    const sysWalletId = await this.walletService.findSystemWallet()
    await this.walletService.lock(req.uid)
    try {
      // 使用卡片
      const amount = await this.prePaidService.useCard(req.uid, card)
      await this.walletService.addAmount(req.uid, amount)
      const billInput: Prisma.BillCreateInput = {
        uid: req.uid,
        type: BillTypeEnum.FILL_IN,
        amount,
        inOut: BillInOutEnum.INCOME,
        status: BillStatusEnum.SUCCESS
      }
      const bill = await this.billService.create(req.uid, billInput)
      const billDetailInput: Prisma.BillDetailCreateInput =
      {
        billId: bill.id,
        uid: req.uid,
        from: sysWalletId,
        to: req.uid,
        transactionNo: param.cardNo
      }
      await this.billDetailService.create(billDetailInput)
    } finally {
      await this.walletService.unlock(req.uid)
    }
  }

  /**
   * 发起转账
   *  1.钱包余额变更
   *  2.账单变更
   *  3.会话消息
   * @param req
   * @param param
   * @returns
   */
  @Post('remit')
  async remit (@Req() req: Request, @Body() param: WalletRemitReq): Promise<WalletRemitResp> {
    const enable = await this.walletService.checkAmount(param.objUId, param.amount)
    if (!enable) {
      throw new HttpException('余额不足', HttpStatus.BAD_REQUEST)
    }
    const transactionNo = randomUUID().replaceAll('-', '')
    await this.walletService.addAmount(req.uid, -param.amount)
    const selfBill = await this.billService.createBill(req.uid, BillTypeEnum.REMIT, param.amount, BillInOutEnum.OUTCOME, BillStatusEnum.SUCCESS, req.uid, param.objUId, transactionNo, param.remark)
    await this.walletService.addAmount(param.objUId, param.amount)
    await this.billService.createBill(param.objUId, BillTypeEnum.REMIT, param.amount, BillInOutEnum.INCOME, BillStatusEnum.SUCCESS, req.uid, param.objUId, transactionNo, param.remark)
    // 发起转账消息
    await this.messageService.sendRemitMessage(req.uid, param.objUId, MessageTypeEnum.REMIT, CommonEnum.OFF,
      { remark: param.remark }, {}
    )
    return { billId: selfBill.id, transactionNo }
  }
}
