import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { AppCommentItem, AppCommentPageReq, AppCommentReq, AppCommentVoteResp, AppDetailReq, AppDetailResp, AppItem, AppPageReq } from './apps.dto'
import { BasePageResp } from '@/modules/common/dto/common.dto'
import { AppsService } from '../services/apps.service'

@Controller('apps')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class AppsController {
  constructor (private readonly appService: AppsService) {
  }

  // // 应用列表
  // @Post('page')
  // async page (@Req() req: Request, @Body() param: AppPageReq): Promise<BasePageResp<AppItem>> {
  // }

  // // 应用详情
  // @Post('detail')
  // async detail (@Req() req: Request, @Body() param: AppDetailReq): Promise<AppDetailResp> {

  // }

  // // 应用评论列表
  // @Post('comments/page')
  // async commentPage (@Req() req: Request, @Body() param: AppCommentPageReq): Promise<BasePageResp<AppCommentItem>> {

  // }

  // // 应用打分（评论）
  // @Post('comments/create')
  // async doComment (@Req() req: Request, @Body() param: AppCommentReq): Promise<void> {

  // }

  // // 应用内评论点赞
  // @Post('comments/vote')
  // async doCommentVote (@Req() req: Request, @Body() param: AppDetailReq): Promise<AppCommentVoteResp> {

  // }
}
