import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
@Injectable()
export class CommonHttpMiddleware implements NestMiddleware {
  async use (req: Request, resp: Response, next: () => void): Promise<void> {
    const originalJson = resp.json
    resp.json = (data: any): any => {
      originalJson.call(resp, {
        code: 200,
        msg: 'Success',
        data
      })
    }
    next()
  }
}
