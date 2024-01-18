
import { Module } from '@nestjs/common'
import { GroupController } from './controllers/group.controller'
import { GroupService } from './services/group.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [UserModule],
  controllers: [
    GroupController
  ],
  providers: [
    GroupService,
  ]
})
export class GroupModule {
}
