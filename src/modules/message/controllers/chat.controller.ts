import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { AddChatDto, ChatDetailItem, ChatListItem, ChatTypeEnum } from '../controllers/chat.dto'
import { BaseArrayResp, BaseIdsArrayReq, CommonEnum } from '@/modules/common/dto/common.dto'
import { ChatService } from '../services/chat.service'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Request } from 'express'

@Controller('chat')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class ChatController {
  constructor (
    private readonly chatService: ChatService
  ) { }

  // 初始化会话
  @Post('init')
  async initChat (@Req() req: Request): Promist<void> {

  }

  // 获取我的会话列表
  @Post('mine-list')
  async mineChatList (@Req() req: Request): Promise<BaseArrayResp<ChatListItem>> {
    return { items: await this.chatService.mineChatList(req.uid) }
  }

  // 会话详情
  @Post('detail')
  async chatDetail (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<BaseArrayResp<ChatDetailItem>> {
    return { items: await this.chatService.chatDetail(req.uid, param) }
  }

  // 删除会话
  @Post('delete')
  async deleteChat (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<any> {
    await this.chatService.deleteChat(req.uid, param)
  }
}
