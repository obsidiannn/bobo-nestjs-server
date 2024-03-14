import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { AppCommentItem, AppCommentPageReq, AppCommentReq, AppCommentVoteReq, AppCommentVoteResp, AppDetailReq, AppDetailResp, AppItem, AppPageReq, AppTagItem } from './apps.dto'
import { BasePageResp } from '@/modules/common/dto/common.dto'
import { AppsService } from '../services/apps.service'
import { AppCommentService } from '../services/apps-comment.service'
import { UserService } from '@/modules/user/services/user.service'
import { AppsCommentVoteService } from '../services/apps-comment-vote.service'
import { Prisma } from '@prisma/client'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'

@Controller('apps')
@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
export class AppsController {
  constructor (
    private readonly appService: AppsService,
    private readonly appCommentService: AppCommentService,
    private readonly appCommentVoteService: AppsCommentVoteService,
    private readonly userService: UserService
  ) {
  }

  // 应用列表
  @Post('page')
  async page (@Req() req: Request, @Body() param: AppPageReq): Promise<BasePageResp<AppItem>> {
    const page = await this.appService.findActiveApps(param)
    const appIds: string[] = []
    const data = page.items.map(i => {
      appIds.push(i.id)
      const dto: AppItem = {
        id: i.id,
        icon: i.icon,
        name: i.name,
        desc: i.desc,
        avgStar: i.avgStar,
        installCount: i.installCount,
        groupInstallFlag: false
      }
      return dto
    })
    if (param.groupId !== null && param.groupId !== undefined) {
      const installedHash = await this.appService.groupInstalledHash(appIds, param.groupId)
      data.forEach(d => {
        d.groupInstallFlag = installedHash.get(d.id)
      })
    }
    return page.transfer(data)
  }

  // 应用详情
  @Post('detail')
  async detail (@Req() req: Request, @Body() param: AppDetailReq): Promise<AppDetailResp> {
    const app = await this.appService.findById(param.appId)
    const result: AppDetailResp = {
      id: app.id,
      icon: app.icon,
      name: app.name,
      desc: app.desc,
      tags: [],
      author: app.author,
      activeAt: app.activeAt,
      avgStar: app.avgStar,
      installCount: app.installCount,
      detailImages: app.detailImages,
      groupInstallFlag: false
    }
    if (app.tags !== null && app.tags.length > 0) {
      result.tags = app.tags
        .filter(i => { return i !== undefined })
        .map(i => {
          const item: AppTagItem = JSON.parse(JSON.stringify(i))
          return item
        })
    }
    if (param.groupId !== undefined && param.groupId !== null) {
      result.groupInstallFlag = await this.appService.hasInstalled(param.groupId, param.appId)
    }
    return result
  }

  // 应用评论列表
  @Post('comments/page')
  async commentPage (@Req() req: Request, @Body() param: AppCommentPageReq): Promise<BasePageResp<AppCommentItem>> {
    const page = await this.appCommentService.findPage(param)

    const userIds: string[] = []
    const commentIds: string[] = []
    page.items.forEach(i => {
      userIds.push(i.uid)
      commentIds.push(i.id)
    })
    const userHash = await this.userService.userHash(userIds)
    const commentVoteIdSet = await this.appCommentVoteService.findVoteByCommentIds(commentIds, req.uid)
    const data = page.items.map(i => {
      const user = userHash.get(i.uid)
      const dto: AppCommentItem = {
        id: i.id,
        uid: i.uid,
        star: i.star,
        score: i.score,
        createdAt: i.createdAt,
        content: i.content,
        voteFlag: commentVoteIdSet.has(i.id)
      }
      if ((user != null) && user !== null) {
        dto.username = user.name
        dto.avatar = user.avatar
      }

      return dto
    })
    return page.transfer(data)
  }

  // 应用打分（评论）
  @Post('comments/create')
  async doComment (@Req() req: Request, @Body() param: AppCommentReq): Promise<void> {
    const input: Prisma.AppCommentCreateInput = {
      uid: req.uid,
      star: 0,
      appId: param.appId,
      score: param.score,
      content: param.content
    }
    await this.appCommentService.create(input)
  }

  // 应用内评论点赞
  @Post('comments/vote')
  async doCommentVote (@Req() req: Request, @Body() param: AppCommentVoteReq): Promise<AppCommentVoteResp> {
    return await this.appCommentVoteService.doVote(req.uid, param.commentId)
  }
}
