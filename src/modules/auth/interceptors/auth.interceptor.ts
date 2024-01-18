import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { UserService } from '@/modules/user/services/user.service'

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor (private readonly authService: AuthService, private readonly userService: UserService) {}
  async intercept (ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest<Request>()
    const user = await this.userService.findById(req.uid)
    if (user == null) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND)
    }
    req.user = user
    return next.handle().pipe()
  }
}
