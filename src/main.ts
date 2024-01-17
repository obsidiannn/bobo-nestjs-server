import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify'
import { HttpExceptionFilter } from '@/controllers/all-exception.filter'
import { ValidationPipe } from '@nestjs/common'

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true
    }),
    {
      abortOnError: false
    }
  )
  // 全局异常处理
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  await app.listen(3000)
}
bootstrap().then(() => {
  console.log('NestJS server started')
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
