import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AuthEnumIsRegister, UserGenderEnum } from '@/enums'
import * as request from 'supertest'
import { generatePrivateKey } from '@/utils/web3'
import { SystemController } from '@/modules/common/controllers/system.controller'
import testUtil from '@/utils/test-util'
import { ConfigService } from '@nestjs/config'
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
    const configService = app.get<ConfigService>(ConfigService)
    systemPublicKey = sysPubKeyResponse.pubKey
    privateKey = configService.get<string>('TEST_USER_ID') ?? ''
  })
  describe('register', () => {
    it('/POST register', async () => {
      // 获取用户是否注册
      const isRegisterParams = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
      const isRegisterResponse = await request(app.getHttpServer())
        .post('/auth/is-register')
        .send({
          data: isRegisterParams.encData
        })
        .set(isRegisterParams.headers)
        .expect(200)
      // 如果没有注册，则注册
      if (isRegisterResponse.body.isRegister === AuthEnumIsRegister.NO) {
        const registerParams = testUtil.buildAuthParams(privateKey, systemPublicKey, {})
        return await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            data: registerParams.encData
          })
          .set(registerParams.headers)
          .expect(200)
      }
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
  describe('update avatar', () => {
    it('/POST update avatar', async () => {
      const params = testUtil.buildAuthParams(privateKey, systemPublicKey, {
        avatar: 'https://api.multiavatar.com/1.webp'
      })
      return await request(app.getHttpServer())
        .post('/auth/update-avatar')
        .send({
          data: params.encData
        })
        .set(params.headers)
        .expect(200)
    })
  })
})
