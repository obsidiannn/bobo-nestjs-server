import { AuthService } from '@/services/auth.service'
import { Body, Controller, Post } from '@nestjs/common'
import { IAuthController } from './types'
import { IsNotEmpty, Matches } from 'class-validator'
import { RegisterReq, RegisterResp } from '@/dto/auth'
import { okResp, BaseResp } from '@/dto/common'

export class IsRegisterDto {
  @IsNotEmpty({ message: 'uid不能为空' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'uid格式不正确' })
    uid: string
}
@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) { }
  @Post('is-register')
  async isRegister (@Body() isRegisterDto: IsRegisterDto): Promise<IAuthController.IsRegisterResponse> {
    const isRegister = await this.authService.isRegister(isRegisterDto.uid)
    return { is_register: isRegister }
  }

  @Post('register')
  async register (@Body() param: RegisterReq): Promise<BaseResp<any>> {
    return okResp(await this.authService.register(param))
  }

  // @Post('login')
  // async login (req: Request, res: Response) {
  // }

  @Post('update-name')
  async updateName (@Body() param: RegisterReq): Promise<RegisterResp> {
    return await this.authService.register(param)
  }

  // @Post('update-avatar')
  // async updateAvatar (req: Request, res: Response) {
  // }

  // @Post('update-avatar')
  // async updateGender (req: Request, res: Response) {
  // }

  // @Post('destroy')
  // async destroy (req: Request, res: Response) {
  // }
}
