import { buildWallet } from '@/utils/web3'
import { Wallet } from 'ethers'
import * as Crypto from 'crypto'
export class SystemWalletService {
  protected wallet: Wallet
  protected static instance: SystemWalletService | undefined
  constructor (privateKey: string) {
    this.wallet = buildWallet(privateKey)
  }

  static getInstance (): SystemWalletService {
    if (SystemWalletService.instance === undefined) {
      throw new Error('SystemWalletService not initialized')
    }
    return SystemWalletService.instance
  }

  static init (privateKey: string): SystemWalletService {
    if (SystemWalletService.instance === undefined) {
      SystemWalletService.instance = new SystemWalletService(privateKey)
    }
    return SystemWalletService.instance
  }

  sign (data: any, time: string): string {
    let content = ''
    if (typeof data !== 'string') {
      content = JSON.stringify(data ?? {})
    } else {
      content = data
    }
    const hash = Crypto.createHash('sha256').update(content).digest('hex')
    return this.wallet.signMessageSync(hash + ':' + time)
  }

  public sharedSecret (publicKey: string): string {
    return this.wallet.signingKey.computeSharedSecret(publicKey)
  }
}
