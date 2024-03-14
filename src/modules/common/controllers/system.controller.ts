
import { Controller, Post, UseInterceptors } from '@nestjs/common'
import { SystemService } from '../services/system.service'
import { ResponseInterceptor } from '../interceptors/response.interceptor'
@Controller('system')
@UseInterceptors(ResponseInterceptor)
export class SystemController {
  constructor (private readonly systemService: SystemService) { }

  @Post('get-pub-key')
  async getPubKey (): Promise<ISystemController.GetPubKeyResponse> {
    const pubKey = this.systemService.getPubKey()
    return { pubKey }
  }

  @Post('get-static-url')
  async getStaticUrl (): Promise<ISystemController.GetStaticUrlResponse> {
    const staticUrl = this.systemService.getStaticUrl()
    return { staticUrl }
  }

  @Post('get-nodes')
  async getNodes (): Promise<ISystemController.GetNodesResponse> {
    const nodes = this.systemService.getNodes()
    return { nodes }
  }

  @Post('info')
  async getInfo (): Promise<ISystemController.SysInfoResponse> {
    const pubKey = this.systemService.getPubKey()
    const staticUrl = this.systemService.getStaticUrl()
    const result = { pubKey, staticUrl }
    console.log(result)

    return result
  }
}
