import { Module } from '@nestjs/common'
import { AuthController } from '@/controllers/auth.controller'
import { AuthService } from '@/services/auth.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SystemController } from '@/controllers/system.controller'
import { UserService } from '@/services/user.service'
import { PrismaService } from '@/services/prisma.service'
import { SystemService } from '@/services/system.service'
import { GroupController } from './controllers/group.controller'
import { GroupService } from './services/group.service'

@Module({
  imports: [
    ConfigModule.forRoot()
  ],
  controllers: [
    AuthController,
    SystemController,
    GroupController
  ],
  providers: [
    AuthService,
    ConfigService,
    UserService,
    PrismaService,
    SystemService,
    GroupService
  ]
})
export class AppModule {}
