
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AppsController } from './controllers/apps.controller'
import { AppsService } from './services/apps.service'
import { AuthModule } from '../auth/auth.module'
import { AppCommentService } from './services/apps-comment.service'
import { AppsCommentVoteService } from './services/apps-comment-vote.service'

@Module({
  imports: [UserModule, AuthModule],
  controllers: [
    AppsController
  ],
  providers: [
    AppsService,
    AppCommentService,
    AppsCommentVoteService
  ],
  exports: [
    AppsService
  ]
})
export class AppsModule {
}
