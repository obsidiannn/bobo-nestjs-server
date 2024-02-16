
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { MessageController } from './controllers/message.controller'
import { MessageService } from './services/message.service'
import { ChatController } from './controllers/chat.controller'
import { ChatService } from './services/chat.service'
import { AuthModule } from '../auth/auth.module'
import { ChatUserService } from './services/chat-user.service'
import { UserMessageService } from './services/user-message.service'

@Module({
  imports: [UserModule, AuthModule],
  controllers: [
    MessageController,
    ChatController
  ],
  providers: [
    MessageService,
    UserMessageService,
    ChatService,
    ChatUserService
  ],
  exports: [
    MessageService,
    ChatService
  ]
})
export class MessageModule {
}
