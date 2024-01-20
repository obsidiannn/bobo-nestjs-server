import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  await app.listen(4000)
}
bootstrap().then(() => {
  console.log('NestJS server started')
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
