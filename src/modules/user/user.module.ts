import { Module } from '@nestjs/common'
import { UserService } from './services/user.service'
import { BlockService } from './services/block.service'
@Module({
  providers: [UserService, BlockService],
  exports: [UserService, BlockService]
})
export class UserModule {}
