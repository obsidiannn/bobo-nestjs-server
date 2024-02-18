
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { TweetController } from './controllers/tweet.controller'
import { TweetService } from './services/tweet.service'

@Module({
  imports: [UserModule, AuthModule],
  controllers: [
    TweetController
  ],
  providers: [
    TweetService
  ]
})
export class TweetModule {
}
