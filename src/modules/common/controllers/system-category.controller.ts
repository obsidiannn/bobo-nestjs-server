import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { BaseArrayResp } from '../dto/common.dto'
import { SystemCategoryService } from '../services/system-category.service'
import { SysCategoryConfig, SysCategoryItem, SysCategoryReq } from './system-category.dto'
import { ResponseInterceptor } from '../interceptors/response.interceptor'

@Controller('system')
@UseInterceptors(ResponseInterceptor)
export class SystemCategoryController {
  constructor (private readonly sysCagegoryService: SystemCategoryService) {
  }
}
