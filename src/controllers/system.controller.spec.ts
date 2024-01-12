import { Test, TestingModule } from '@nestjs/testing'
import { SystemController } from './system.controller'
import { SystemService } from '@/services/system.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
describe('SystemController', () => {
  let systemController: SystemController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot()
      ],
      controllers: [SystemController],
      providers: [
        SystemService,
        ConfigService
      ]
    }).compile()

    systemController = app.get<SystemController>(SystemController)
  })

  describe('info', () => {
    it("should return {static_url: '(string)', pub_key: 'string'}", async () => {
      expect(await systemController.info()).toEqual(expect.objectContaining({
        static_url: expect.any(String),
        pub_key: expect.any(String)
      }))
    })
  })
})
