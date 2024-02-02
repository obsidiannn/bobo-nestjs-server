import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Controller, HttpException, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { WalletCardFillReq, WalletDetailResp } from './wallet.dto'
import { WalletService } from '../services/wallet.service'
import { BillService } from '../services/bill.service'
import { BoboCardService } from '../services/boboCard.service'
import { Prisma } from '@prisma/client'
import { BillInOutEnum, BillStatusEnum, BillTypeEnum } from '@/enums'
import { BillDetailService } from '../services/bill.detail.service'

@Controller('wallet')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class WalletController {
  constructor (
    private readonly walletService: WalletService,
    private readonly billService: BillService,
    private readonly billDetailService: BillDetailService,
    private readonly boboCardService: BoboCardService
  ) {}

  // 钱包详情
  @Post('detail')
  async detail (@Req() req: Request): Promise<WalletDetailResp> {
    const wallet = await this.walletService.findByUid(req.uid)
    return { balance: wallet.balance, currency: wallet.currency, type: wallet.type }
  }

  // 礼品卡充值
  @Post('fill/bobo-card')
  async fillByCard (@Req() req: Request, param: WalletCardFillReq): Promise<void> {
    const card = await this.boboCardService.findActiveByCardNo(param.cardNo)
    if (card === null) {
      throw new HttpException('卡无效', HttpStatus.BAD_REQUEST)
    }
    const sysWalletId = await this.walletService.findSystemWallet()
    await this.walletService.lock(req.uid)
    try {
      // 使用卡片
      const amount = await this.boboCardService.useCard(req.uid, card)
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
}
