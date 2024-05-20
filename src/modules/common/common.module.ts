import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaService } from './services/prisma.service'
import { SystemService } from './services/system.service'
import { SystemController } from './controllers/system.controller'
import { SystemWalletService } from './services/system-wallet.service'
import { SystemCategoryService } from './services/system-category.service'
import { SystemCategoryController } from './controllers/system-category.controller'
import { FirebaseService } from './services/firebase.service'
import { HttpExceptionFilter } from './filter/global.exception.filter'
import { APP_FILTER } from '@nestjs/core'
import { ResponseInterceptor } from './interceptors/response.interceptor'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'
@Module({})
export class CommonModule {
  static register (): DynamicModule {
    const configService = new ConfigService()
    const systemPrivateKey = configService.get<string>('SYSTEM_PRIVATE_KEY')
    if (systemPrivateKey === undefined) {
      throw new Error('SYSTEM_PRIVATE_KEY is not defined')
    }
    SystemWalletService.init(systemPrivateKey)
    return {
      module: CommonModule,
      global: true,
      imports: [
        ConfigModule.forRoot({
          // cache: true
        }),
        CacheModule.registerAsync<RedisClientOptions>({
          imports: [ConfigModule],
          isGlobal: true,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            store: redisStore,

            // socket: {
            //   host: configService.get<string>('REDIS_HOST'),
            //   port: configService.get<number>('REDIS_PORT'),
            //   passphrase: 'redis',
            //   db: 2,
            //   reconnectStrategy: 5000
            // },
            database: 2,
            password: 'redis',
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            db: 2,
            ttl: 5

          })
        })
      ],
      controllers: [
        SystemController,
        SystemCategoryController
      ],
      providers: [
        PrismaService,
        SystemService,
        SystemCategoryService,
        FirebaseService,
        ResponseInterceptor,
        ConfigService,
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter
        }
      ],
      exports: [
        PrismaService,
        FirebaseService,
        ConfigService
      ]
    }
  }
}
