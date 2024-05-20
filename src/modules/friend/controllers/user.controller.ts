import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '../../user/services/user.service'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { BaseArrayResp, BaseUIdArrayReq } from '@/modules/common/dto/common.dto'
import { UserInfoDto, UserInfoItem, UserInfoQueryReq } from '@/modules/user/controllers/user.dto'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'
import { GenderEnum } from '@/enums'

@Controller('user')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class UserController {
  constructor (
    private readonly userService: UserService
  ) { }

  @Post('get-batch-info')
  async getBatchInfo (@Req() req: Request, @Body() param: UserInfoQueryReq): Promise<BaseArrayResp<UserInfoDto>> {
    if (param.official !== undefined && param.official) {
      const users = await this.userService.findOfficialUserByIds(param.uids)
      const data = users.map(u => {
        const item: UserInfoDto = {
          id: u.id,
          avatar: u.avatar,
          name: u.name,
          nameIndex: u.nameIdx,
          gender: GenderEnum.UNKNOWN,
          pubKey: '',
          sign: u.desc ?? ''
        }
        return item
      })
      return { items: data }
    } else {
      const users = await this.userService.findByIds(param.uids)
      const data = users.map(u => {
        const item: UserInfoDto = {
          id: u.id,
          avatar: u.avatar,
          name: u.name,
          nameIndex: u.nameIdx,
          gender: u.gender,
          pubKey: u.pubKey,
          sign: u.sign ?? ''
        }
        return item
      })
      return { items: data }
    }
  }
}
