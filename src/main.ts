import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { HttpExceptionFilter } from './modules/common/filter/global.exception.filter'

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter())
  const corsOptions = {
    origin: '*', // 允许的前端域名
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true
  }

  app.enableCors(corsOptions)
  await app.listen(4000)
}
bootstrap().then(() => {
  console.log('NestJS server started')
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
