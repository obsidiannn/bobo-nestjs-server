import { GroupAppItem, GroupAppListReq, GroupAppReq } from '@/modules/apps/controllers/apps.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { BaseArrayResp } from '@/modules/common/dto/common.dto'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { GroupAppService } from '../services/group-app.service'
import { AppsService } from '@/modules/apps/services/apps.service'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'

@Controller('groups/app')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class GroupAppController {
  constructor (
    private readonly groupAppService: GroupAppService,
    private readonly appsService: AppsService
  ) {
  }

  // 群组应用列表
  @Post('list')
  async list (@Req() req: Request, @Body() param: GroupAppListReq): Promise<BaseArrayResp<GroupAppItem>> {
    const groupApps = await this.groupAppService.findByGroupId(param.groupId)
    if (groupApps.length > 0) {
      const appIds = groupApps.map(g => g.appId)
      const apps = await this.appsService.findByIdIn(appIds, { name: true, icon: true, id: true })
      const data = apps.map(a => {
        const item: GroupAppItem = {
          id: a.id,
          name: a.name,
          icon: a.icon
        }
        return item
      })
      return { items: data }
    }
    return { items: [] }
  }

  // 添加群组应用
  @Post('install')
  async install (@Req() req: Request, @Body() param: GroupAppReq): Promise<void> {
    await this.groupAppService.addApp(param.groupId, param.appId)
  }

  // 添加群组应用
  @Post('uninstall')
  async uninstall (@Req() req: Request, @Body() param: GroupAppReq): Promise<void> {
    await this.groupAppService.removeApp(param.groupId, param.appId)
  }
}
