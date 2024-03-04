import { buildWallet, buildWalletByProvider, generatePrivateKey } from '@/utils/web3'

import { TransactionRequest, ethers } from 'ethers'

describe('web3 test', () => {
  it('web3 generate key', () => {
    const privateKey = generatePrivateKey()
    expect(privateKey).toEqual(expect.any(String))
  })
  it('web3 build wallet', () => {
    const privateKey = generatePrivateKey()
    const wallet = buildWallet(privateKey)
    expect(wallet).toEqual(expect.any(Object))
  })

  /**
   * 0x6E37E893F2E9cD629e0A65Ee5364e96E26f2B0EC
   * 0xbb743f10829fda297ae1cb548e8913d198dc60ee85abc345033e45712cba26f7
   *
   * 0x963a01E21B4195b60ED1537959e87183CD5eb898
   * 0xb0797b2cb11974969d3cf9fd27c36b60d934f6b1bc3f33ef63e4902e45d8b39f
   */
  it('私链钱包', async () => {
    const privateKey = '0xbb743f10829fda297ae1cb548e8913d198dc60ee85abc345033e45712cba26f7'

    const rpcUrl = 'http://127.0.0.1:7545' // 替换为您私链的 RPC 地址
    // 创建一个以太坊 provider
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    const wallet = new ethers.Wallet(privateKey, provider)

    const balance = await provider.getBalance('0x6E37E893F2E9cD629e0A65Ee5364e96E26f2B0EC')
    console.log(balance)

    // 构建交易对象
    const transaction: TransactionRequest = {
      from: '0x6E37E893F2E9cD629e0A65Ee5364e96E26f2B0EC',
      to: '0x963a01E21B4195b60ED1537959e87183CD5eb898',
      value: ethers.parseEther('5.0')
    }
    // 发送交易
    const sendTransactionResponse = await wallet.sendTransaction(transaction)
    console.log('Transaction Hash:', sendTransactionResponse.hash)

    // 等待交易被确认
    const receipt = await sendTransactionResponse.wait()
    if (receipt !== null) {
      console.log('Transaction confirmed in block:', receipt.blockNumber)
    }
  })
})
