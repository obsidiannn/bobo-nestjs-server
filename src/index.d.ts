import { User } from '@prisma/client'
import { SystemWalletService } from '@/modules/common/services/system-wallet.service'
export namespace IModel {
  export interface SystemInfo {
    static_url: string | undefined
    pub_key: string | undefined
  }
}

declare module 'express' {
  interface Request {
    uid: string
    user?: User
  }
}
