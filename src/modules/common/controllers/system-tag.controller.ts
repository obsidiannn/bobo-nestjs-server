import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { SysTagConfig, SysTagItem, SysTagReq } from './system-tag.dto'
import { BaseArrayResp } from '../dto/common.dto'
import { SystemTagService } from '../services/system-tag.service'
import { CryptInterceptor } from '../interceptors/crypt.interceptor'

@Controller('system')
export class SystemTagController {
  constructor (private readonly sysTagService: SystemTagService) {
  }

  @Post('tags/list')
  async list (@Body() param: SysTagReq): Promise<BaseArrayResp<SysTagItem>> {
    const entities = await this.sysTagService.findByType(param.type)
    const data = entities.map(e => {
      const { config, ...eDto } = e
      const dto: SysTagItem = { ...eDto }
      if (e.config !== null) {
        dto.config = JSON.parse(e.config as string) as SysTagConfig
      }
      return dto
    })
    return { items: data }
  }
}
