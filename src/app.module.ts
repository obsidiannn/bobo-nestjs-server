import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { CommonModule } from './modules/common/common.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { GroupModule } from './modules/group/group.module'
import { FriendModule } from './modules/friend/friend.module'
import { MessageModule } from './modules/message/message.module'
import { WalletModule } from './modules/wallet/wallet.module'
import { AppsModule } from './modules/apps/apps.module'
import { TweetModule } from './modules/tweet/tweet.module'
import { SocketModule } from './modules/socket/socket.module'
@Module({
  imports: [
    CommonModule.register(),
    AuthModule,
    UserModule,
    GroupModule,
    FriendModule,
    MessageModule,
    WalletModule,
    AppsModule,
    TweetModule,
    SocketModule
  ]
})
export class AppModule {

}
