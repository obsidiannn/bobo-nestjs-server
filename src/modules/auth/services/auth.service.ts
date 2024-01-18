import { recoverAddress } from '@/utils/web3'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  recoverUid (dataHash: string, sign: string): string {
    return recoverAddress(dataHash, sign)
  }
}
