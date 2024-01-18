import aes from './aes'
import { builWallet } from './web3'
import * as Crypto from 'crypto'
export default {
  buildAuthParams (privateKey: string, systemPublicKey: string, data: any): {
    headers: Record<string, string>
    encData: string
  } {
    if (!systemPublicKey.startsWith('0x')) {
      systemPublicKey = '0x' + systemPublicKey
    }
    const wallet = builWallet(privateKey)
    const content = typeof data === 'string' ? data : JSON.stringify(data)
    const time = String(Math.floor(new Date().getTime() / 1000))
    const dataHash = Crypto.createHash('sha256').update(content).digest('hex')
    const sign = wallet.signMessageSync(dataHash + ':' + time)
    const sharedSecret = wallet.signingKey.computeSharedSecret(systemPublicKey)
    const encData = aes.En(content, sharedSecret)
    return {
      headers: {
        'Content-Type': 'application/json',
        'X-Pub-Key': wallet.signingKey.compressedPublicKey,
        'X-Sign': sign,
        'X-Time': time,
        'X-Data-Hash': dataHash
      },
      encData
    }
  }
}
