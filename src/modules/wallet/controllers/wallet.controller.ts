import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { WalletDetailResp } from './wallet.dto'
import { WalletService } from '../services/wallet.service'
import { BillService } from '../services/bill.service'
import { BillRecordService } from '../services/bill.detail.service'

@Controller('wallet')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class WalletController {
  constructor (
    private readonly walletService: WalletService,
    private readonly billService: BillService,
    private readonly billRecordService: BillRecordService
  ) {}

  @Post('/detail')
  async detail (@Req() req: Request): Promise<WalletDetailResp> {
    const wallet = await this.walletService.findByUid(req.uid)
    return { balance: wallet.balance, currency: wallet.currency, type: wallet.type }
  }
}
