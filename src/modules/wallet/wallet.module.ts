import { Module } from '@nestjs/common'
import { WalletService } from './services/wallet.service'
import { WalletController } from './controllers/wallet.controller'
import { BillService } from './services/bill.service'
import { BillDetailService } from './services/bill.detail.service'
import { BillController } from './controllers/bill.controller'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { BoboCardService } from './services/boboCard.service'
@Module({
  imports: [UserModule, AuthModule],
  controllers: [WalletController, BillController],
  providers: [WalletService, BillService, BillDetailService, BoboCardService]
})
export class WalletModule {}
