
import { Module } from '@nestjs/common'
import { GroupController } from './controllers/group.controller'
import { GroupService } from './services/group.service'
import { UserModule } from '../user/user.module'
import { MessageModule } from '../message/message.module'
import { AuthModule } from '../auth/auth.module'
import { GroupMemberService } from '@/modules/group/services/group-member.service'
import { AppsModule } from '../apps/apps.module'
import { GroupAppController } from './controllers/group-app.controller'
import { GroupAppService } from './services/group-app.service'

@Module({
  imports: [UserModule, AuthModule, MessageModule, AppsModule],
  controllers: [
    GroupController,
    GroupAppController
  ],
  providers: [
    GroupService,
    GroupMemberService,
    GroupAppService
  ],
  exports: [
    GroupMemberService
  ]
})
export class GroupModule {
}
