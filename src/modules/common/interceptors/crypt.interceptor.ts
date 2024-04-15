import aes from '@/utils/aes'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SystemWalletService } from '../services/system-wallet.service'

// 解密interceptor
@Injectable()
export class CryptInterceptor implements NestInterceptor {
  intercept (ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const request = ctx.switchToHttp().getRequest<Request>()
    const pubKey = (request.headers['x-pub-key'] ?? '') as string
    if (pubKey === '') {
      throw new HttpException('x-pub-key is empty', HttpStatus.BAD_REQUEST)
    }
    const sharedSecret = SystemWalletService.getInstance().sharedSecret(pubKey)
    const body = request.body?.data ?? ''
    if (body !== '') {
      const decData = aes.De(body, sharedSecret)
      const reqBody = JSON.parse(decData)
      console.log('[request body] ', reqBody)
      request.body = reqBody ?? {}
    }

    return next.handle().pipe(
      map((data) => {
        const resp = ctx.switchToHttp().getResponse<Response>()
        resp.status(HttpStatus.OK)
        return aes.En(JSON.stringify(data), sharedSecret)
      })
    )
  }
}
