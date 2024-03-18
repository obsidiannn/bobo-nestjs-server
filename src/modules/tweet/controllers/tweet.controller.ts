import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { SearchReq, SearchResultItem, TweetCommentPageReq, TweetCreateReq, TweetItem, TweetPageReq, TweetRetweetReq, TweetRetweetResp, TweetVoteReq, TweetVoteResp } from './tweet.dto'
import { BasePageResp } from '@/modules/common/dto/common.dto'
import { TweetService } from '../services/tweet.service'
import { Prisma } from '@prisma/client'
import { CommentLevelEnum, TweetRetweetTypeEnum, TweetStatusEnum, WalletTypeEnum } from '@/enums'
import { Request } from 'express'
import commonUtil from '@/utils/common.util'
import { SearchService } from '../services/search.service'
import { ResponseInterceptor } from '@/modules/common/interceptors/response.interceptor'

@UseInterceptors(CryptInterceptor, ResponseInterceptor, BaseInterceptor)
@Controller('tweet')
export class TweetController {
  constructor (
    private readonly tweetService: TweetService,
    private readonly searchService: SearchService
  ) {}

  // 搜索（群组）
  @Post('search')
  async search (@Req() req: Request, @Body() param: SearchReq): Promise<BasePageResp<SearchResultItem>> {
    return await this.searchService.searchGroup(param)
  }

  // 推文分页列表（推荐）
  @Post('recommend/page')
  async recommendPage (@Req() req: Request, @Body() param: TweetPageReq): Promise<BasePageResp<TweetItem>> {
    const page = await this.tweetService.queryByIndex(req.uid, param)
    const items = await this.tweetService.tweetItemChange(req.uid, page.items)
    return page.transfer(items)
  }

  // 推文分页列表（好友）
  @Post('friend/page')
  async friendPage (@Req() req: Request, @Body() param: TweetPageReq): Promise<BasePageResp<TweetItem>> {
    const page = await this.tweetService.queryByFriend(req.uid, param)
    const items = await this.tweetService.tweetItemChange(req.uid, page.items)
    return page.transfer(items)
  }

  // 推文分页列表（我的）
  @Post('mine/page')
  async minePage (@Req() req: Request, @Body() param: TweetPageReq): Promise<BasePageResp<TweetItem>> {
    const page = await this.tweetService.queryByMine(req.uid, param)
    const items = await this.tweetService.tweetItemChange(req.uid, page.items)
    return page.transfer(items)
  }

  // // 搜索（群组）
  // @Post('detail')
  // async detail (@Req() req: Request, @Body() param: SearchReq): Promise<TweetItem> {

  // }

  // 发推/发评论
  @Post('post')
  async post (@Req() req: Request, @Body() param: TweetCreateReq): Promise<void> {
    const medias = JSON.parse(JSON.stringify(param.medias))
    // 判断帖子类型
    let retweetType: TweetRetweetTypeEnum
    let retweetId: string | null
    if (commonUtil.notNull(param.retweetId)) {
      retweetType = TweetRetweetTypeEnum.RETWEET
      retweetId = param.retweetId
    } else {
      if (commonUtil.notNull(param.parentId)) {
        retweetType = TweetRetweetTypeEnum.COMMENT
        retweetId = param.parentId
        await this.tweetService.checkCommentLevelById(req.uid, param.parentId)
      } else {
        retweetType = TweetRetweetTypeEnum.NONE
        retweetId = null
      }
    }
    const input: Prisma.PostCreateInput = {
      authorId: req.uid,
      authorType: WalletTypeEnum.NORMAL,
      medias,
      content: param.content,
      status: TweetStatusEnum.NORMAL,
      commentLevel: param.commentLevel,
      visibleType: param.visibleType,
      longitude: param.longitude,
      latitude: param.latitude,
      address: param.address,
      retweetId,
      retweetType
    }
    await this.tweetService.create(input)
  }

  // 评论列表
  @Post('comment/page')
  async commentPage (@Req() req: Request, @Body() param: TweetCommentPageReq): Promise<BasePageResp<TweetItem>> {
    const page = await this.tweetService.findCommentsPage(param.tweetId, param)
    const items = await this.tweetService.tweetItemChange(req.uid, page.items)
    return page.transfer(items)
  }

  // 转发/取消转发
  @Post('retweet')
  async retweetCreate (@Req() req: Request, @Body() param: TweetRetweetReq): Promise<TweetRetweetResp> {
    return await this.tweetService.doRetweet(req.uid, param.tweetId)
  }

  // 点赞/取消点赞
  @Post('vote')
  async vote (@Req() req: Request, @Body() param: TweetVoteReq): Promise<TweetVoteResp> {
    return await this.tweetService.doVote(req.uid, param.tweetId)
  }
}
