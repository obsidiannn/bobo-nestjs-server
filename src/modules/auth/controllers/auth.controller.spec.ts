import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AuthEnumIsRegister } from '@/enums'
import * as request from 'supertest'
import { builWallet, generatePrivateKey } from '@/utils/web3'
import * as Crypto from 'crypto'
import { SystemController } from '@/modules/common/controllers/system.controller'
import aes from '@/utils/aes'
describe('auth module AuthController', () => {
  let app: NestExpressApplication

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    await app.init()
  })
  const wallet = builWallet(generatePrivateKey())
  describe('is-register', () => {
    it('/POST is-register', async () => {
      const content = JSON.stringify({})
      const time = String(Math.floor(new Date().getTime() / 1000))
      const dataHash = Crypto.createHash('sha256').update(content).digest('hex')
      const sign = wallet.signMessageSync(dataHash + ':' + time)
      const systemController = app.get<SystemController>(SystemController)
      const sysPubKeyResponse = await systemController.getPubKey()
      if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
        throw new Error('pubKey is empty')
      }
      const sharedSecret = wallet.signingKey.computeSharedSecret('0x' + sysPubKeyResponse.pubKey)
      const encData = aes.En(content, sharedSecret)
      return await request(app.getHttpServer())
        .post('/auth/is-register')
        .send({
          data: encData
        })
        .set({
          'Content-Type': 'application/json',
          'X-pub-key': wallet.signingKey.compressedPublicKey,
          'X-Sign': sign,
          'X-time': time,
          'X-data-hash': dataHash
        })
        .expect(200)
        .expect({
          isRegister: AuthEnumIsRegister.NO
        })
    })
  })
  describe('register', () => {
    it('/POST register', async () => {
      const content = JSON.stringify({})
      const time = String(Math.floor(new Date().getTime() / 1000))
      const dataHash = Crypto.createHash('sha256').update(content).digest('hex')
      const sign = wallet.signMessageSync(dataHash + ':' + time)
      const systemController = app.get<SystemController>(SystemController)
      const sysPubKeyResponse = await systemController.getPubKey()
      if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
        throw new Error('pubKey is empty')
      }
      const sharedSecret = wallet.signingKey.computeSharedSecret('0x' + sysPubKeyResponse.pubKey)
      const encData = aes.En(content, sharedSecret)
      return await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          data: encData
        })
        .set({
          'Content-Type': 'application/json',
          'X-pub-key': wallet.signingKey.compressedPublicKey,
          'X-Sign': sign,
          'X-time': time,
          'X-data-hash': dataHash
        })
        .expect(200)
    })
  })
  describe('login', () => {
    it('/POST login', async () => {
      const content = JSON.stringify({})
      const time = String(Math.floor(new Date().getTime() / 1000))
      const dataHash = Crypto.createHash('sha256').update(content).digest('hex')
      const sign = wallet.signMessageSync(dataHash + ':' + time)
      const systemController = app.get<SystemController>(SystemController)
      const sysPubKeyResponse = await systemController.getPubKey()
      if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
        throw new Error('pubKey is empty')
      }
      const sharedSecret = wallet.signingKey.computeSharedSecret('0x' + sysPubKeyResponse.pubKey)
      const encData = aes.En(content, sharedSecret)
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          data: encData
        })
        .set({
          'Content-Type': 'application/json',
          'X-pub-key': wallet.signingKey.compressedPublicKey,
          'X-Sign': sign,
          'X-time': time,
          'X-data-hash': dataHash
        })
        .expect(200)
    })
  })

  describe('update username', () => {
    it('/POST update username', async () => {
      const content = JSON.stringify({
        username: 'test'
      })
      const time = String(Math.floor(new Date().getTime() / 1000))
      const dataHash = Crypto.createHash('sha256').update(content).digest('hex')
      const sign = wallet.signMessageSync(dataHash + ':' + time)
      const systemController = app.get<SystemController>(SystemController)
      const sysPubKeyResponse = await systemController.getPubKey()
      if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
        throw new Error('pubKey is empty')
      }
      const sharedSecret = wallet.signingKey.computeSharedSecret('0x' + sysPubKeyResponse.pubKey)
      const encData = aes.En(content, sharedSecret)
      return await request(app.getHttpServer())
        .post('/auth/update-name')
        .send({
          data: encData
        })
        .set({
          'Content-Type': 'application/json',
          'X-pub-key': wallet.signingKey.compressedPublicKey,
          'X-Sign': sign,
          'X-time': time,
          'X-data-hash': dataHash
        })
        .expect(200)
    })
  })
})
