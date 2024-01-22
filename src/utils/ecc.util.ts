import * as Crypto from 'crypto'

const generateSharedSecret = (secret: string, targetPublicKey: string): string => {
  const ecdh = getECDH()
  ecdh.setPrivateKey(secret, 'hex')
  return ecdh.computeSecret(targetPublicKey, 'hex', 'hex')
}

const getECDH = (): Crypto.ECDH => {
  return Crypto.createECDH('secp256k1')
}

export default { generateSharedSecret, getECDH }
