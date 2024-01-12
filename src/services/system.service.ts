import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class SystemService {
  constructor (private readonly configService: ConfigService) {}

  getStaticUrl (): string | undefined {
    return this.configService.get<string>('STATIC_URL')
  }

  getPubKey (): string | undefined {
    return this.configService.get<string>('SYSTEM_PUB_KEY')
  }

  getPriKey (): string | undefined {
    return this.configService.get<string>('SYSTEM_PRI_KEY')
  }
}
