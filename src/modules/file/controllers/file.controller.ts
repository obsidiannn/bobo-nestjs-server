import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { S3Service } from '../services/s3.service'
import { Request } from 'express'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor'
import { CryptInterceptor } from '../../common/interceptors/crypt.interceptor'

@Controller('file')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class FileController {
  constructor (
    private readonly s3Service: S3Service
  ) {}

  @Post('upload-pre-sign')
  async uploadPreSign (@Req() req: Request, @Body() params: IFileController.PreSignRequest): Promise<IFileController.PreSignResponse> {
    return { result: await this.s3Service.uploadPreSign(params.key) }
  }
}
