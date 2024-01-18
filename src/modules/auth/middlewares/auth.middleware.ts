import { UserService } from '@/modules/user/services/user.service'
import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { Request, Response } from 'express'
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor (
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  async use (req: Request, _: Response, next: () => void): Promise<void> {
    const sign = (req.headers['x-sign'] ?? '') as string
    if (sign === '') {
      throw new HttpException('x-sign is empty', HttpStatus.BAD_REQUEST)
    }
    const time = (req.headers['x-time'] ?? '') as string
    if (time === '') {
      throw new HttpException('x-time is empty', HttpStatus.BAD_REQUEST)
    }
    const dataHash = (req.headers['x-data-hash'] ?? '') as string
    if (dataHash === '') {
      throw new HttpException('x-data-hash is empty', HttpStatus.BAD_REQUEST)
    }
    const uid = this.authService.recoverUid(dataHash + ':' + time, sign)
    const user = await this.userService.findById(uid)
    if (user == null) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND)
    }
    req.uid = uid
    req.user = user
    next()
  }
}
