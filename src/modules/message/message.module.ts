
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { MessageController } from './controllers/message.controller'
import { MessageService } from './services/message.service'
import { ChatController } from './controllers/chat.controller'
import { ChatService } from './services/chat.service'
import { AuthModule } from '../auth/auth.module'
import { ChatUserService } from './services/chat-user.service'
import { UserMessageService } from './services/user-message.service'
import { SocketModule } from '../socket/socket.module'
import { SenderService } from './services/sender.service'
import { OfficialMessageService } from './services/official-message.service'

@Module({
  imports: [UserModule, AuthModule, SocketModule],
  controllers: [
    MessageController,
    ChatController
  ],
  providers: [
    MessageService,
    UserMessageService,
    ChatService,
    ChatUserService,
    SenderService,
    OfficialMessageService
  ],
  exports: [
    MessageService,
    ChatService,
    SenderService,
    OfficialMessageService
  ]
})
export class MessageModule {
}
