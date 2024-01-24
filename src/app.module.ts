import { Module } from '@nestjs/common'
import { CommonModule } from './modules/common/common.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { GroupModule } from './modules/group/group.module'
import { FriendModule } from './modules/friend/friend.module'
import { MessageModule } from './modules/message/message.module'

@Module({
  imports: [
    CommonModule.register(),
    AuthModule,
    UserModule,
    GroupModule,
    FriendModule,
    MessageModule
  ]
})
export class AppModule {}
