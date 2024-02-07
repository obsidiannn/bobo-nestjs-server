import { GroupAppItem, GroupAppListReq, GroupAppReq } from '@/modules/apps/controllers/apps.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { BaseArrayResp } from '@/modules/common/dto/common.dto'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { GroupAppService } from '../services/group.app.service'

@Controller('groups/app')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class GroupAppController {
  constructor (private readonly groupAppService: GroupAppService) {
  }

  // // 群组应用列表
  // @Post('list')
  // async list (@Req() req: Request, @Body() param: GroupAppListReq): Promise<BaseArrayResp<GroupAppItem>> {

  // }

  // // 添加群组应用
  // @Post('install')
  // async install (@Req() req: Request, @Body() param: GroupAppReq): Promise<void> {

  // }

  // // 添加群组应用
  // @Post('uninstall')
  // async uninstall (@Req() req: Request, @Body() param: GroupAppReq): Promise<void> {

  // }
}
