
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { SystemService } from '../services/system.service'
import { ResponseInterceptor } from '../interceptors/response.interceptor'
import { SysCategoryConfig, SysCategoryItem, SysCategoryReq } from './system-category.dto'
import { BaseArrayResp } from '../dto/common.dto'
import { SystemCategoryService } from '../services/system-category.service'
@Controller('system')
@UseInterceptors(ResponseInterceptor)
export class SystemController {
  constructor (private readonly systemService: SystemService,
    private readonly sysCagegoryService: SystemCategoryService

  ) { }

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

  @Post('category-list')
  async list (@Body() param: SysCategoryReq): Promise<BaseArrayResp<SysCategoryItem>> {
    console.log(param)

    const entities = await this.sysCagegoryService.findByType(param.type)
    const data = entities.map(e => {
      const { config, ...eDto } = e
      const dto: SysCategoryItem = { ...eDto }
      if (e.config !== null) {
        dto.config = JSON.parse(e.config as string) as SysCategoryConfig
      }
      return dto
    })
    return { items: data }
  }
}
