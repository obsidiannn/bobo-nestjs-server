import { Module } from '@nestjs/common'
import { WalletService } from './services/wallet.service'
import { WalletController } from './controllers/wallet.controller'
import { BillService } from './services/bill.service'
import { BillDetailService } from './services/bill.detail.service'
@Module({
  imports: [UserModule],
  controllers: [WalletController],
  providers: [WalletService, BillService, BillDetailService]
})
export class UserModule {}
