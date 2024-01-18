import { Module } from '@nestjs/common'
<<<<<<< HEAD
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
=======
import { CommonModule } from './modules/common/common.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    CommonModule.register(),
    AuthModule,
    UserModule
>>>>>>> ace4a75 (模块划分与测试用例)
  ]
})
export class AppModule {}
