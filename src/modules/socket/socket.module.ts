
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { SocketGateway } from './socket.gateway'

@Module({
  imports: [UserModule, AuthModule],

  providers: [
    SocketGateway
  ],
  exports: [
    SocketGateway
  ]
})
export class SocketModule {
}
