
import { Module } from '@nestjs/common'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { UserModule } from '../user/user.module'
import { BaseInterceptor } from './interceptors/base.interceptor'

@Module({
  imports: [UserModule],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    BaseInterceptor
  ]
})
export class AuthModule {
}
