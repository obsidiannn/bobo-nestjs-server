import { AuthService } from '@/services/auth.service'
import { Body, Controller, Post } from '@nestjs/common'
import { IAuthController } from './types'
import { IsNotEmpty, Matches } from 'class-validator'

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

  // @Post('register')
  // async register (req: Request, res: Response) {
  // }

  // @Post('login')
  // async login (req: Request, res: Response) {
  // }

  // @Post('update-name')
  // async updateName (req: Request, res: Response) {
  // }

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
