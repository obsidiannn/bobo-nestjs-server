import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { BaseIdsArrayReq, CommonEnum, BaseArrayResp } from '@/modules/common/dto/common.dto'
import {
  MessageSendReq,
  MessageListItem,
  MessageDetailItem,
  MessageDeleteByIdReq,
  MessageDeleteByMsgIdReq
} from '../controllers/message.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { MessageService } from '../services/message.service'
import { Request } from 'express'

@Controller('messages')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class MessageController {
  constructor (
    private readonly messageService: MessageService
  ) { }

  // 发送消息
  @Post('send')
  async sendMessage (@Req() req: Request, @Body() param: MessageSendReq): Promise<any> {
    await this.messageService.sendMessage(req.uid, param)
  }

  // 消息列表
  @Post('list')
  async mineMessageList (@Req() req: Request): Promise<BaseArrayResp<MessageListItem>> {
    return { items: await this.messageService.mineMessageList(req.uid) }
  }

  // 消息详情列表
  @Post('detail')
  async getMessageDetail (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<BaseArrayResp<MessageDetailItem>> {
    return { items: await this.messageService.getMessageDetail(req.uid, param) }
  }

  // 撤回消息
  @Post('delete-batch')
  async pullBack (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    await this.messageService.pullBack(req.uid, param)
  }

  // （单向）删除消息-按消息Id
  @Post('delete-self-all')
  async deleteSelfMsg (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<any> {
    await this.messageService.deleteSelfMsg(req.uid, param)
  }

  // （双向）删除所有消息-根据会话IDs
  @Post('delete-chat-ids')
  async deleteChatByIds (@Req() req: Request, @Body() param: MessageDeleteByIdReq): Promise<any> {
    await this.messageService.deleteChatByIds(req.uid, param)
  }

  // （单向）删除所有消息-根据会话IDs 解除自己与会话消息的关系
  @Post('delete-self-chat-ids')
  async deleteSelfChatByIds (@Req() req: Request, @Body()param: MessageDeleteByIdReq): Promise<any> {
    await this.messageService.deleteSelfChatByIds(req.uid, param)
  }

  // 撤回消息 根据会话IDs 所有发送者的消息物理删除
  @Post('revoke-chat-ids')
  async pullBackByChatIds (@Req() req: Request, @Body()param: MessageDeleteByMsgIdReq): Promise<any> {
    await this.messageService.pullBackByChatIds(req.uid, param)
  }

  // 清空所有端消息 物理删除 (不可恢复,只有拥有管理员权限的用户才能调用)
  @Post('clear-chat-ids')
  async clearChatByChatIds (@Req() req: Request, @Body()param: MessageDeleteByIdReq): Promise<any> {
    await this.messageService.clearChatByChatIds(req.uid, param)
  }
}
