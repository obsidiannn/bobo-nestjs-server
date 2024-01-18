import { Body, Controller, HttpException, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common'
import { IAuthController } from './types'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '@/modules/user/services/user.service'
import { Prisma, User } from '@prisma/client'
import { AuthEnumIsRegister, UserGenderEnum } from '@/enums'
import { Request } from 'express'
import { BaseInterceptor } from '../interceptors/base.interceptor'
import { UpdateGenderParams, UpdateNameParams } from './auth.dto'
import { AuthInterceptor } from '../interceptors/auth.interceptor'
@Controller('auth')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class AuthController {
  constructor (private readonly userService: UserService) {}
  @Post('is-register')
  async isRegister (@Req() req: Request): Promise<IAuthController.IsRegisterResponse> {
    const user = await this.userService.findById(req.uid)
    const isRegister = user != null ? AuthEnumIsRegister.YES : AuthEnumIsRegister.NO
    return {
      isRegister
    }
  }

  @Post('register')
  async register (@Req() req: Request): Promise<IAuthController.RegisterResponse> {
    const avatar = `https://api.multiavatar.com/${req.uid}.svg`
    const pubKey = req.headers['x-pub-key'] as string
    const data: Prisma.UserCreateInput = {
      id: req.uid,
      pubKey,
      dbIdx: 0,
      unionId: '',
      avatar,
      name: '',
      nameIdx: '',
      gender: UserGenderEnum.UNKNOWN
    }
    const user = await this.userService.create(data)
    return { user }
  }

  @Post('login')
  async login (@Req() req: Request): Promise<IAuthController.LoginResponse> {
    const user = await this.userService.findById(req.uid)
    if (user == null) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND)
    }
    return { user }
  }

  @Post('update-name')
  @UseInterceptors(AuthInterceptor)
  async updateName (@Req() req: Request, @Body() params: UpdateNameParams): Promise<User> {
    return await this.userService.update(req.uid, {
      name: params.username
    })
  }

  @Post('update-gender')
  async updateAvatar (@Req() req: Request, @Body() params: UpdateGenderParams): Promise<User> {
    return await this.userService.update(req.uid, {
      gender: params.gender
    })
  }

  // @Post('update-avatar')
  // async updateGender (req: Request, res: Response) {
  // }

  // @Post('destroy')
  // async destroy (req: Request, res: Response) {
  // }
}
