import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { UserService } from '@/modules/user/services/user.service'
import { hashMessage } from 'ethers'

@Injectable()
export class BaseInterceptor implements NestInterceptor {
  constructor (private readonly authService: AuthService, private readonly userService: UserService) {}
  async intercept (ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest<Request>()
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
    const uid = this.authService.recoverUid(hashMessage(dataHash + ':' + time), sign)
    req.uid = uid
    return next.handle().pipe()
  }
}
