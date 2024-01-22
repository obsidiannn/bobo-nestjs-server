import * as Crypto from 'crypto'
import ecc from './ecc.util'
import aes from './aes'

describe('ecc test', () => {
  const apk = '01ea956740c440295e8d63454e7b1ccdb3d453c138a0c3c6961e6784c0ad9212'
  const bpk = 'd11f186e0e765e16334e35e9534e7cd283a4ea30194a93826feca6b2e8ffa285'
  // const apk = Crypto.randomBytes(32).toString('hex')
  // const bpk = Crypto.randomBytes(32).toString('hex')

  it('检查秘钥是否一致', () => {
    const a = Crypto.createECDH('secp256k1')
    const b = Crypto.createECDH('secp256k1')
    a.setPrivateKey(apk, 'hex')
    b.setPrivateKey(bpk, 'hex')

    const ak = a.getPublicKey()
    const bk = b.getPublicKey()

    const ask = a.computeSecret(bk)
    const bsk = b.computeSecret(ak)
    expect(ask.toString('hex')).toEqual(bsk.toString('hex'))
  })
  it('函数检查', () => {
    const a = Crypto.createECDH('secp256k1')
    const b = Crypto.createECDH('secp256k1')
    a.setPrivateKey(apk, 'hex')
    b.setPrivateKey(bpk, 'hex')

    const ak = a.getPublicKey()
    const bk = b.getPublicKey()

    const ask = ecc.generateSharedSecret(apk, bk.toString('hex'))
    const bsk = ecc.generateSharedSecret(bpk, ak.toString('hex'))
    expect(ask).toEqual(bsk)
  })

  it('加解密', () => {
    const a = Crypto.createECDH('secp256k1')
    const b = Crypto.createECDH('secp256k1')
    a.setPrivateKey(apk, 'hex')
    b.setPrivateKey(bpk, 'hex')

    const ak = a.getPublicKey()
    const bk = b.getPublicKey()

    const ask = ecc.generateSharedSecret(apk, bk.toString('hex'))
    const bsk = ecc.generateSharedSecret(bpk, ak.toString('hex'))
    expect(ask).toEqual(bsk)

    const originData = '这是原始数据'
    const encodeData = aes.En(originData, ask)
    const decodeData = aes.De(encodeData, ask)
    expect(originData).toEqual(decodeData)
  })
})
