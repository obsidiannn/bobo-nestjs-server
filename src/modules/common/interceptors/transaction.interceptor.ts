// transaction.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { PrismaService } from '../services/prisma.service'
import { TRANSACTION_KEY } from '../decorator/transactional'

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor (private readonly prisma: PrismaService) {}
  async intercept (context: ExecutionContext, next: CallHandler): Promise<any> {
    const isTransaction: boolean = Reflect.getMetadata(
      TRANSACTION_KEY,
      context.getHandler()
    )
    if (!isTransaction) {
      return next.handle()
    }
    console.log('transaction')

    return await this.prisma.$transaction(async (tx) => {
      return next.handle().pipe()
    })

    // return await this.prisma.$transaction(async (tx) => {
    //   return new Observable((observer) => {
    //     try {
    //       observer.next(next.handle())
    //       observer.complete()
    //     } catch (error) {
    //       observer.error(error)
    //     }
    //   })
    // })
  }
}
