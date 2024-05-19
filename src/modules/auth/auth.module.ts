
import { Module } from '@nestjs/common'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { UserModule } from '../user/user.module'
import { BaseInterceptor } from './interceptors/base.interceptor'
import { AuthInterceptor } from './interceptors/auth.interceptor'

@Module({
  imports: [UserModule],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    BaseInterceptor,
    AuthInterceptor
  ],
  exports: [
    AuthService,
    BaseInterceptor,
    AuthInterceptor
  ]
})
export class AuthModule {
}
