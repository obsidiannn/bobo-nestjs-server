import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { ChatDetailItem, ChatListItem, ChatUserTopUpdateDto } from '../controllers/chat.dto'
import { BaseArrayResp, BaseIdReq, BaseIdsArrayReq } from '@/modules/common/dto/common.dto'
import { ChatService } from '../services/chat.service'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Request } from 'express'
import { MessageService } from '../services/message.service'
import { ChatUserService } from '../services/chat-user.service'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'

@Controller('chat')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class ChatController {
  constructor (
    private readonly chatService: ChatService,
    private readonly chatUserService: ChatUserService,
    private readonly messageService: MessageService
  ) { }

  // 获取我的会话列表
  @Post('mine-list')
  async mineChatList (@Req() req: Request): Promise<BaseArrayResp<ChatListItem>> {
    return { items: await this.chatService.mineChatList(req.uid) }
  }

  // 会话详情
  @Post('detail')
  async chatDetail (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<BaseArrayResp<ChatDetailItem>> {
    return { items: await this.chatService.chatDetail(req.uid, param.ids) }
  }

  // 删除(隐藏)会话
  @Post('delete')
  async deleteChat (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<any> {
    // 消息要单向删除
    const chatIds = await this.chatUserService.userChatHide(req.uid, param, true)
    await this.messageService.clearMemberMessageByChatIds([req.uid], chatIds)
  }

  /**
   * 置顶
   */
  @Post('raise-top')
  async raiseChat (@Req() req: Request, @Body() param: ChatUserTopUpdateDto): Promise<{ isTop: number }> {
    return { isTop: await this.chatUserService.raiseTop(param.chatUserId, req.uid, param.top) }
  }
}
