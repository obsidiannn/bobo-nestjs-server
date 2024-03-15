import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SystemService {
  constructor (private readonly configService: ConfigService) {
  }

  getPubKey (): string | undefined {
    return this.configService.get<string>('SYSTEM_PUBLIC_KEY')
  }

  getStaticUrl (): string | undefined {
    return this.configService.get<string>('STATIC_URL')
  }

  getNodes (): string[] | undefined {
    const nodesStr = this.configService.get<string>('NODES')
    if (nodesStr == null) {
      return undefined
    }
    return nodesStr.split(',')
  }

  getTestUserId (): string {
    const userId = this.configService.get<string>('TEST_USER_ID')
    if (userId === undefined) {
      return ''
    }
    return userId
  }

  getConfig (configKey: string): string {
    const userId = this.configService.get<string>('TEST_USER_ID')
    if (userId === undefined) {
      return ''
    }
    return userId
  }
}
