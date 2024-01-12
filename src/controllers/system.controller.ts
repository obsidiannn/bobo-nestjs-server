import { Controller, Post } from '@nestjs/common'
import { ISystemController } from './types'
import { SystemService } from '@/services/system.service'
@Controller('system')
export class SystemController {
  constructor (private readonly systemService: SystemService) { }
  @Post('info')
  async info (): Promise<ISystemController.InfoResponse> {
    const staticUrl = this.systemService.getStaticUrl()
    const pubKey = this.systemService.getPubKey()
    return { static_url: staticUrl, pub_key: pubKey }
  }
}
