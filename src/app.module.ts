import { Module } from '@nestjs/common'
import { CommonModule } from './modules/common/common.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    CommonModule.register(),
    AuthModule,
    UserModule
  ]
})
export class AppModule {}
