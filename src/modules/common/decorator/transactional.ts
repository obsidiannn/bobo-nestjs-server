// transaction.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const TRANSACTION_KEY = 'transaction'

export const Transaction = (): any => SetMetadata(TRANSACTION_KEY, true)
