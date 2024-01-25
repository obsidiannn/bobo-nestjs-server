
import { Module } from '@nestjs/common'
import { FriendController } from './controllers/friend.controller'
import { FriendService } from './services/friend.service'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { MessageModule } from '../message/message.module'

@Module({
  imports: [UserModule, AuthModule, MessageModule],
  controllers: [
    FriendController
  ],
  providers: [
    FriendService
  ]
})
export class FriendModule {
}
