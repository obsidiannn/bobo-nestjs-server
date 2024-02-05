import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'
import { PrismaService } from './services/prisma.service'
import { SystemService } from './services/system.service'
import { SystemController } from './controllers/system.controller'
import { SystemWalletService } from './services/system-wallet.service'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TransactionInterceptor } from './interceptors/transaction.interceptor'
import { SystemTagController } from './controllers/system-tag.controller'
import { SystemTagService } from './services/system-tag.service'
@Module({})
export class CommonModule {
  static register (): DynamicModule {
    const configService = new ConfigService()
    const systemPrivateKey = configService.get<string>('SYSTEM_PRIVATE_KEY')
    if (systemPrivateKey === undefined) {
      throw new Error('SYSTEM_PRI_KEY is not defined')
    }
    SystemWalletService.init(systemPrivateKey)
    return {
      module: CommonModule,
      global: true,
      imports: [
        ConfigModule.forRoot({
          cache: false
        })
        // CacheModule.registerAsync<RedisClientOptions>({
        //   imports: [ConfigModule],
        //   useFactory: (configService: ConfigService) => ({
        //     store: redisStore,
        //     socket: {
        //       host: configService.get<string>('REDIS_HOST'),
        //       port: configService.get<number>('REDIS_PORT'),
        //       passphrase: 'redis'
        //     },
        //     ttl: 5
        //   }),
        //   inject: [ConfigService]
        // })
      ],
      controllers: [
        SystemController,
        SystemTagController
      ],
      providers: [
        PrismaService,
        SystemService,
        SystemTagService
      ],
      exports: [
        PrismaService
      ]
    }
  }
}
