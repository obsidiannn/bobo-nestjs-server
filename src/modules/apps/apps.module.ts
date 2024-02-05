
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AppsController } from './controllers/apps.controller'
import { AppsService } from './services/apps.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [UserModule, AuthModule],
  controllers: [
    AppsController
  ],
  providers: [
    AppsService
  ],
  exports: [
    AppsService
  ]
})
export class AppsModule {
}
