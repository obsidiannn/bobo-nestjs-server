import aes from '@/utils/aes'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { SystemWalletService } from '../services/system-wallet.service'

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
      request.body = JSON.parse(decData) ?? {}
    }
    return next.handle().pipe(
      tap((data) => {
        const resp = ctx.switchToHttp().getResponse<Response>()
        resp.status(HttpStatus.OK)
        return data
      })
    )
  }
}
