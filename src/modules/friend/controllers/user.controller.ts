import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '../../user/services/user.service'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { BaseArrayResp, BaseUIdArrayReq } from '@/modules/common/dto/common.dto'
import { UserInfoItem } from '@/modules/user/controllers/user.dto'

@Controller('user')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class UserController {
  constructor (
    private readonly userService: UserService
  ) { }

  @Post('get-batch-info')
  async getBatchInfo (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<BaseArrayResp<UserInfoItem>> {
    const users = await this.userService.findByIds(param.uids)
    const data = users.map(u => {
      const item: UserInfoItem = {
        id: u.id,
        avatar: u.avatar,
        name: u.name,
        gender: u.gender
      }
      return item
    })
    return { items: data }
  }
}
