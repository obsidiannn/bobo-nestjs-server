import { Injectable } from '@nestjs/common'
import * as AWS from 'aws-sdk'

import { ConfigService } from '@nestjs/config'
@Injectable()
export class S3Service {
  constructor (
    private readonly configService: ConfigService
  ) {
    this.initS3()
  }

  private s3: AWS.S3

  private initS3 (): void {
    this.s3 = new AWS.S3({
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      accessKeyId: this.configService.get<string>('R2_AK'),
      secretAccessKey: this.configService.get<string>('R2_SK'),
      signatureVersion: 'v4'
    })
  }

  getBucket (): string {
    return this.configService.get<string>('R2_BUCKET') ?? ''
  }

  async readPreSign (key: string): Promise<string> {
    return await this.s3.getSignedUrlPromise('getObject', { Bucket: this.getBucket(), Key: key, Expires: 3600 })
  }

  async uploadPreSign (key: string): Promise<string> {
    return await this.s3.getSignedUrlPromise('putObject', { Bucket: this.getBucket(), Key: key, Expires: 3600 })
  }
}
