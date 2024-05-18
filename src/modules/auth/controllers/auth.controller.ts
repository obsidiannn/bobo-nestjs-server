import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseInterceptors
} from '@nestjs/common'
import { IAuthController } from './types'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '@/modules/user/services/user.service'
import { Prisma, User } from '@prisma/client'
import { AuthEnumIsRegister, UserGenderEnum } from '@/enums'
import { Request } from 'express'
import { BaseInterceptor } from '../interceptors/base.interceptor'
import {
  UpdateAvatarParams,
  UpdateGenderParams,
  UpdateMessageTokenReq,
  UpdateNameParams,
  UpdateSignParams
} from './auth.dto'
import { AuthInterceptor } from '../interceptors/auth.interceptor'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'
import {
  UserDetailDto,
  UserInfoItem
} from '@/modules/user/controllers/user.dto'
import commonUtil from '@/utils/common.util'
@Controller('auth')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class AuthController {
  constructor (private readonly userService: UserService) {}
  @Post('is-register')
  async isRegister (
    @Req() req: Request
  ): Promise<IAuthController.IsRegisterResponse> {
    const user = await this.userService.findById(req.uid)
    const isRegister =
      user != null ? AuthEnumIsRegister.YES : AuthEnumIsRegister.NO
    return {
      isRegister
    }
  }

  @Post('register')
  async register (
    @Req() req: Request
  ): Promise<IAuthController.RegisterResponse> {
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
      gender: UserGenderEnum.UNKNOWN,
      userSequence: -1
    }
    const user = await this.userService.create(data)
    return { user }
  }

  @Post('login')
  @UseInterceptors(AuthInterceptor)
  async login (@Req() req: Request): Promise<IAuthController.LoginResponse> {
    const user = await this.userService.findById(req.uid)

    if (user == null) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND)
    }
    return { user }
  }

  @Post('update-name')
  @UseInterceptors(AuthInterceptor)
  async updateName (
    @Req() req: Request,
      @Body() params: UpdateNameParams
  ): Promise<User> {
    return await this.userService.update(req.uid, {
      name: params.name,
      nameIdx: commonUtil.getFirstLetterOfPinyin(params.name)
    })
  }

  @Post('update-sign')
  async updateSign (
    @Req() req: Request,
      @Body() params: UpdateSignParams
  ): Promise<User> {
    return await this.userService.update(req.uid, {
      sign: params.sign
    })
  }

  @Post('update-gender')
  @UseInterceptors(AuthInterceptor)
  async updateAvatar (
    @Req() req: Request,
      @Body() params: UpdateGenderParams
  ): Promise<User> {
    return await this.userService.update(req.uid, {
      gender: params.gender
    })
  }

  @Post('update-avatar')
  @UseInterceptors(AuthInterceptor)
  async updateGender (
    @Req() req: Request,
      @Body() params: UpdateAvatarParams
  ): Promise<User> {
    return await this.userService.update(req.uid, {
      avatar: params.avatar
    })
  }

  @Post('user-info')
  async currentUserInfo (@Req() req: Request): Promise<UserDetailDto> {
    const user = await this.userService.findById(req.uid)
    if (user === null) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }
    return {
      id: user?.id,
      avatar: user?.avatar,
      name: user?.name,
      nameIndex: user?.nameIdx,
      gender: user?.gender,
      pubKey: user?.pubKey,
      sign: user.sign ?? '',
      userSequence: user.userSequence
    }
  }

  /**
   * 注册推送的设备token
   */
  @Post('register-token')
  async registerPushToken (
    @Req() req: Request,
      @Body() param: UpdateMessageTokenReq
  ): Promise<void> {
    if (commonUtil.notBlank(param.token)) {
      await this.userService.update(req.uid, {
        msgToken: param.token
      })
    }
  }
}
