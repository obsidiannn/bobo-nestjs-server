import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { BaseArrayResp } from '../dto/common.dto'
import { SystemCategoryService } from '../services/system-category.service'
import { CryptInterceptor } from '../interceptors/crypt.interceptor'
import { SysCategoryConfig, SysCategoryItem, SysCategoryReq } from './system-category.dto'

@Controller('system')
export class SystemCategoryController {
  constructor (private readonly sysCagegoryService: SystemCategoryService) {
  }

  @Post('category/list')
  async list (@Body() param: SysCategoryReq): Promise<BaseArrayResp<SysCategoryItem>> {
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
