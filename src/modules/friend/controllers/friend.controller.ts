
import { Controller, Post, Req, Body, UseInterceptors } from '@nestjs/common'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { UserService } from '@/modules/user/services/user.service'
import { FriendService } from '../services/friend.service'
import { Request } from 'express'
import { BasePageReq, BaseIdsArrayReq, BaseUIdArrayReq, BaseArrayResp, BasePageResp, CommonEnum } from '../../common/dto/common.dto'
import {
  FriendRelationItem, FriendInviteApplyReq, FriendInviteApplyItem
  , FriendInviteAgreeReq, FriendInviteRejectReq, FriendInfoItem, FriendChangeAliasReq, FriendListPageReq
} from './friend.dto'
import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { FriendApplyService } from '../services/friend-apply.service'
import { FriendApply, Prisma } from '@prisma/client'
import { FriendApplyStatusEnum } from '@/enums'
import { id } from 'ethers'
import { ChatService } from '@/modules/message/services/chat.service'
import { ChatStatusEnum, ChatTypeEnum } from '@/modules/message/controllers/chat.dto'
import commonUtil from '@/utils/common.util'
import { MessageService } from '@/modules/message/services/message.service'
// import { AuthInterceptor } from '@/modules/auth/interceptors/auth.interceptor'

@Controller('friends')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class FriendController {
  constructor (
    private readonly userService: UserService,
    private readonly friendService: FriendService,
    private readonly friendApplyService: FriendApplyService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService

  ) { }

  // 获取用户关系
  @Post('relation-list')
  async getRelationList (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<BaseArrayResp<FriendRelationItem>> {
    return { items: await this.friendService.getRelationList(req.uid, param) }
  }

  // 申请好友
  @Post('invite-apply')
  async inviteApply (@Req() req: Request, @Body() param: FriendInviteApplyReq): Promise<void> {
    const currentUserId = req.uid
    if (await this.friendService.isFriend(currentUserId, [param.uid])) {
      return
    }
    // 是否拉黑
    if (await this.friendService.isDenied(currentUserId, [param.uid])) {
      return
    }

    const input: Prisma.FriendApplyCreateInput = {
      uid: currentUserId,
      objUid: param.uid,
      status: FriendApplyStatusEnum.PENDING,
      isRead: CommonEnum.OFF,
      remark: param.remark,
      createdAt: new Date(),
      expiredAt: new Date()
    }
    const result: FriendApply = await this.friendApplyService.create(input)
    console.log(result.id)
  }

  // 我的申请列表
  @Post('invite-list')
  async getInviteList (@Req() req: Request, @Body() param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
    const result = await this.friendApplyService.getFriendInviteApplyPage(req.uid, param)
    const data: FriendInviteApplyItem[] = result.items.map(d => {
      const dto: FriendInviteApplyItem = {
        id: d.id,
        uid: d.uid,
        remark: d.remark,
        status: d.status,
        createdAt: d.createdAt
      }
      return dto
    })
    return new BasePageResp(param, data, result.total)
  }

  // 我的审批列表
  @Post('invite-apply-list')
  async getApplyList (@Req() req: Request, @Body() param: BasePageReq): Promise<BasePageResp<FriendInviteApplyItem>> {
    const data = await this.friendApplyService.getFriendApplyPage(req.uid, param)
    const dtos: FriendInviteApplyItem[] = data.items.map(d => {
      const dto: FriendInviteApplyItem = {
        id: d.id,
        uid: d.objUid,
        remark: d.remark,
        status: d.status,
        createdAt: d.createdAt
      }
      return dto
    })
    return new BasePageResp(param, dtos, data.total)
  }

  // 申请同意
  @Post('invite-agree')
  async inviteAgree (@Req() req: Request, @Body() param: FriendInviteAgreeReq): Promise<void> {
    const currentUserId: string = req.uid
    const apply: FriendApply = await this.friendApplyService.agreeApply(currentUserId, param.id)
    const inputs: Prisma.FriendCreateInput[] = [
      {
        uid: currentUserId,
        objUid: apply.uid,
        agreeAt: new Date(),
        remark: param.alias,
        remarkIndex: '',
        createdAt: new Date()
      },
      {
        uid: apply.uid,
        objUid: currentUserId,
        agreeAt: new Date(),
        remark: '',
        remarkIndex: '',
        createdAt: new Date()
      }
    ]
    await this.friendService.createBatch(inputs)
    await this.chatService.addSimpleChat(currentUserId, {
      groupId: null,
      type: ChatTypeEnum.NORMAL,
      status: ChatStatusEnum.ENABLE,
      isEnc: CommonEnum.ON,
      receiver: apply.uid
    })
  }

  // 申请拒绝
  @Post('invite-reject')
  async inviteReject (@Req() req: Request, @Body() param: FriendInviteRejectReq): Promise<void> {
    await this.friendApplyService.rejectApply(req.uid, param.id, param.reason)
  }

  // 申请已读
  @Post('invite-read')
  async inviteRead (@Req() req: Request, @Body() param: BaseIdsArrayReq): Promise<void> {
    await this.friendApplyService.applyRead(req.uid, param.ids)
  }

  // 好友列表
  @Post('list')
  async getFriendList (@Req() req: Request, @Body() param: FriendListPageReq): Promise<BasePageResp<FriendInfoItem>> {
    if (param.uids != null && param.uids.length > 0) {
      param.limit = param.uids.length
      param.page = 1
    }
    const data = await this.friendService.getFriendList(req.uid, param)
    if (data.items.length <= 0) {
      return new BasePageResp(param, [], data.total)
    }
    const chatHash = await this.chatService.getChatHashByUserIds(req.uid, data.items.map(i => i.objUid))
    const dtos = data.items.map(f => {
      const dto: FriendInfoItem = {
        uid: f.objUid,
        alias: f.remark,
        chatId: chatHash.get(f.objUid)
      }
      return dto
    })
    return new BasePageResp(param, dtos, data.total)
  }

  // 变更好友备注
  @Post('update-alias')
  async changeAlias (@Req() req: Request, @Body() param: FriendChangeAliasReq): Promise<void> {
    await this.friendService.changeAlias(req.uid, param)
  }

  // 删除好友（单向）// todo
  @Post('delete-unilateral')
  async dropRelationSingle (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<void> {
    await this.friendApplyService.deleteMany([req.uid], param.uids)
    await this.friendService.deleteMany([req.uid], param.uids)
    // 删除会话
    const result = await this.chatService.deleteSimpleChat(req.uid, param.uids, true, ChatTypeEnum.NORMAL)
    // 删除消息
    await this.messageService.clearMessageByChatIds(req.uid, result)
  }

  // 删除所有好友（双向）
  @Post('delete-bilateral')
  async dropRelationMulti (@Req() req: Request, @Body() param: BaseUIdArrayReq): Promise<void> {
    await this.friendApplyService.deleteMany([req.uid], param.uids)
    await this.friendService.deleteMany([req.uid], param.uids)

    await this.friendApplyService.deleteMany(param.uids, [req.uid])
    await this.friendService.deleteMany(param.uids, [req.uid])

    // 删除会话
    const result = await this.chatService.deleteSimpleChat(req.uid, param.uids, false, ChatTypeEnum.NORMAL)
    // 删除消息
    await this.messageService.clearMessageByChatIds(req.uid, result)
  }
}
