import { Test, TestingModule } from '@nestjs/testing'
import { SystemController } from './system.controller'
import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
describe('common module SystemController', () => {
  let systemController: SystemController

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    const app = moduleRef.createNestApplication<NestExpressApplication>()
    systemController = app.get<SystemController>(SystemController)
  })

  describe('get pub key', () => {
    it("should return {pubKey: '(string)'}", async () => {
      expect(await systemController.getPubKey()).toEqual(expect.objectContaining({
        pubKey: expect.any(String)
      }))
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
