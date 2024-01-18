import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AuthEnumIsRegister, UserGenderEnum } from '@/enums'
import * as request from 'supertest'
import { generatePrivateKey } from '@/utils/web3'
import { SystemController } from '@/modules/common/controllers/system.controller'
import testUtil from '@/utils/test-util'
describe('auth module AuthController', () => {
  let app: NestExpressApplication
  let systemPublicKey: string
  let privateKey: string
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    await app.init()
    const systemController = app.get<SystemController>(SystemController)
    const sysPubKeyResponse = await systemController.getPubKey()
    if (sysPubKeyResponse.pubKey === '' || sysPubKeyResponse.pubKey === undefined) {
      throw new Error('pubKey is empty')
    }
    systemPublicKey = sysPubKeyResponse.pubKey
    privateKey = generatePrivateKey()
  })
  describe('is-register', () => {
    it('/POST is-register', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
      return await request(app.getHttpServer())
        .post('/auth/is-register')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
        .expect({
          isRegister: AuthEnumIsRegister.NO
        })
    })
  })
  describe('register', () => {
    it('/POST register', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
      return await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })
  describe('login', () => {
    it('/POST login', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })

  describe('update username', () => {
    it('/POST update username', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {
        username: 'test'
      })
      return await request(app.getHttpServer())
        .post('/auth/update-name')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })
  describe('update gender', () => {
    it('/POST update gender', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {
        gender: UserGenderEnum.MAN
      })
      return await request(app.getHttpServer())
        .post('/auth/update-gender')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })
})
