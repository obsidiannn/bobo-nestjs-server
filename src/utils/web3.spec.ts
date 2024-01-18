import { builWallet, generatePrivateKey } from '@/utils/web3'
describe('web3 test', () => {
  it('web3 generate key', () => {
    const privateKey = generatePrivateKey()
    expect(privateKey).toEqual(expect.any(String))
  })
  it('web3 build wallet', () => {
    const privateKey = generatePrivateKey()
    const wallet = builWallet(privateKey)
    expect(wallet).toEqual(expect.any(Object))
  })
})
