import { Module } from '@nestjs/common'
import { WalletService } from './services/wallet.service'
import { WalletController } from './controllers/wallet.controller'
import { BillService } from './services/bill.service'
import { BillDetailService } from './services/bill-detail.service'
import { BillController } from './controllers/bill.controller'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { PrePaidService } from './services/pre-paid.service'
import { RedPacketService } from './services/red-packet.service'
import { MessageModule } from '../message/message.module'
import { RedPacketController } from './controllers/red-packet.controller'
@Module({
  imports: [UserModule, AuthModule, MessageModule],
  controllers: [WalletController, BillController, RedPacketController],
  providers: [WalletService, BillService, BillDetailService, PrePaidService, RedPacketService]
})
export class WalletModule {}
