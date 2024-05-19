import { AppModule } from '@/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { SystemService } from '@/modules/common/services/system.service'
import { FirebaseService } from './firebase.service'
import { Message } from 'firebase-admin/messaging'
import { randomInt } from 'crypto'
describe('firebase test', () => {
  let app: NestExpressApplication
  let firebaseService: FirebaseService
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleRef.createNestApplication<NestExpressApplication>()
    await app.init()

    const systemService = app.get<SystemService>(SystemService)
    const sysPubKeyResponse = systemService.getPubKey()
    if (sysPubKeyResponse === '' || sysPubKeyResponse === undefined) {
      throw new Error('pubKey is empty')
    }
    firebaseService = app.get<FirebaseService>(FirebaseService)
  })

  describe('firebase 消息', () => {
    // const token = 'dVZQjSwQQceR0uD9wOVQvH:APA91bE_MXlW-55fo4CHsTaGht0Slhf0kMGyMgvvEJQclRDRGX7bI212J4V4uOIjwtBcoBgTNwwquxLfiUQA6a_vCnNbxrBdQKuBtmK3R0qKZbUqkuhycNBz49_cFdEx1HqSrKICEn9l'
    const token = 'ekZ1JAaZQomllu8C9dQY7K:APA91bG7J78EFSytcpw8Mz4-OlrKTHkPwNFTJ87Z7ALlHmG70uk4T5FPKEISKb8JXyC-70Hpjc2QnsXKYRyJc8tcLDFAbgrcQ0UAD79hSGTsR-tQqOnLatwPWSxmmrH6vG-bg6KuQb0Y'

    const message: Message = {
      notification: {
        title: '',
        body: '您收到了一条聊天消息'
      },
      android: {
        // priority: 'high',
        notification: {
          imageUrl: 'https://foo.bar.pizza-monster.png'
        }
      },
      webpush: {
        headers: {
          image: 'https://foo.bar.pizza-monster.png'
        }
      },
      data: {
        sourceType: 'chat_user',
        sourceId: ''
      },
      token
    }
    it('发送单个消息', async () => {
      const result = await firebaseService.sendDeviceMessage(token, message)
      console.log(result)
    }, 60000)
  })
})
