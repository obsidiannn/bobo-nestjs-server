import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
@Injectable()
export class CommonHttpMiddleware implements NestMiddleware {
  async use (req: Request, resp: Response, next: () => void): Promise<void> {
    const originalJson = resp.json
    resp.status(HttpStatus.OK)
    resp.json = (data: any): any => {
      console.log('====================================')
      console.log(JSON.stringify(data))
      console.log('====================================')
      originalJson.call(resp, {
        code: 200,
        msg: 'Success',
        data
      })
    }
    next()
  }
}
