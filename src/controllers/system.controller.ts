import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AuthEnumIsRegister } from '@/enums'
import * as request from 'supertest'
describe('common module SystemController', () => {
  let app: NestExpressApplication

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    await app.init()
  })

  describe('get pub key', () => {
    it('/GET cats', () => {
      return request(app.getHttpServer(), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .post('/auth/is-register')
        .expect(200)
        .expect({
          data: catsService.findAll()
        })
    })
  })
  describe('get static url', () => {
    it("should return {staticUrl: '(string)'}", async () => {
      expect(await systemController.getStaticUrl()).toEqual(expect.objectContaining({
        staticUrl: expect.any(String)
      }))
    })
  })
  describe('get nodes', () => {
    it("should return {nodes: '(string[])'}", async () => {
      expect(await systemController.getNodes()).toEqual(expect.objectContaining({
        nodes: expect.any(Array<String>)
      }))
    })
  })
})
