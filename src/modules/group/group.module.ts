
import { Module } from '@nestjs/common'
import { GroupController } from './controllers/group.controller'
import { GroupService } from './services/group.service'
import { UserModule } from '../user/user.module'
import { MessageModule } from '../message/message.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [UserModule, AuthModule, MessageModule],
  controllers: [
    GroupController
  ],
  providers: [
    GroupService
  ]
})
export class GroupModule {
}
