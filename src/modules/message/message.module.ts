
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { MessageController } from './controllers/message.controller'
import { MessageService } from './services/message.service'
import { ChatController } from './controllers/chat.controller'
import { ChatService } from './services/chat.service'

@Module({
  imports: [UserModule],
  controllers: [
    MessageController,
    ChatController
  ],
  providers: [
    MessageService,
    ChatService
  ]
})
export class MessageModule {
}
