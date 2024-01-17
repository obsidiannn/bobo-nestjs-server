import { AppModule } from '@/app.module'
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { RegisterReq, RegisterResp } from '@/dto/auth'
import { randomUUID } from 'crypto'
describe('SystemController', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })
  it('/POST is-register err addr', async () => {
    return await app
      .inject({
        method: 'POST',
        url: '/auth/is-register',
        payload: {
          uid: '0x2ebbcafc49c57b848'
        }
      })
      .then((result) => {
        expect(result.statusCode).toEqual(400)
        expect(result.json()).toEqual(
          expect.objectContaining({
            message: ['uid格式不正确'],
            error: 'Bad Request',
            statusCode: 400
          })
        )
      })
  })
  it('/POST is-register success addr', async () => {
    return await app
      .inject({
        method: 'POST',
        url: '/auth/is-register',
        payload: {
          uid: '0x2ebbcafc49c57b8487b59d1973fa18620a3f6bab'
        }
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
        expect(result.json()).toEqual(
          expect.objectContaining({
            is_register: 0
          })
        )
      })
  })
  // 测试注册
  it('POST /register success', async () => {
    const req: RegisterReq = new RegisterReq()
    req.avatar = 'https://avatars.githubusercontent.com/u/122279700?v=4'
    req.gender = 1
    req.id = randomUUID()
    req.pubKey = randomUUID()
    req.name = 'test_' + req.id
    return await app
      .inject({
        method: 'POST',
        url: '/auth/register',
        payload: req
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
        // expect(result.json()).toEqual(
        //   expect.objectContaining({
        //     code: 200
        //   })
        // )
      })
  })
  // 测试注册
  it('POST /register error', async () => {
    const req: RegisterReq = new RegisterReq()
    req.avatar = 'https://avatars.githubusercontent.com/u/122279700?v=4'
    req.gender = 1
    req.id = '123456'
    req.pubKey = '123'
    req.name = 'test_' + req.id
    return await app
      .inject({
        method: 'POST',
        url: '/auth/register',
        payload: req
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201)
        expect(result.json()).toEqual(
          expect.objectContaining({
            message: ['已注册'],
            error: 'Bad Request',
            statusCode: 400
          })
        )
      })
  })
  // 测试登录
  // 测试更新昵称
  // 测试更新头像
  // 测试更新性别

  afterAll(async () => {
    await app.close()
  })
})
