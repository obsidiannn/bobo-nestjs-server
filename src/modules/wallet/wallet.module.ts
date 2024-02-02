import { Module } from '@nestjs/common'
import { WalletService } from './services/wallet.service'
import { WalletController } from './controllers/wallet.controller'
import { BillService } from './services/bill.service'
import { BillDetailService } from './services/bill.detail.service'
import { BillController } from './controllers/bill.controller'
import { UserModule } from '../user/user.module'
@Module({
  imports: [UserModule],
  controllers: [WalletController, BillController],
  providers: [WalletService, BillService, BillDetailService]
})
export class WalletModule {}
