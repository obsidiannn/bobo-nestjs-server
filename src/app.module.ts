import { Module } from '@nestjs/common'
import { AuthController } from '@/controllers/auth.controller'
import { AuthService } from '@/services/auth.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SystemController } from '@/controllers/system.controller'
import { UserService } from '@/services/user.service'
import { PrismaService } from '@/services/prisma.service'
import { SystemService } from '@/services/system.service'

@Module({
  imports: [
    ConfigModule.forRoot()
  ],
  controllers: [
    AuthController,
    SystemController
  ],
  providers: [
    AuthService,
    ConfigService,
    UserService,
    PrismaService,
    SystemService
  ]
})
export class AppModule {}
