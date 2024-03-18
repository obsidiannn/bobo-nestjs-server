
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { FileController } from './controllers/file.controller'
import { S3Service } from './services/s3.service'

@Module({
  imports: [UserModule, AuthModule],
  controllers: [
    FileController
  ],
  providers: [
    S3Service
  ]
})
export class FileModule {
}
