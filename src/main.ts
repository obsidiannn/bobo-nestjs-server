import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify'
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
  await app.listen(3000)
}
bootstrap().then(() => {
  console.log('NestJS server started')
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
