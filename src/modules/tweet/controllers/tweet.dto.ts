import { BusinessTypeEnum, CommentLevelEnum, MediaTypeEnum, TweetRetweetTypeEnum, VisibleTypeEnum } from '@/enums'
import { AppTagItem } from '@/modules/apps/controllers/apps.dto'
import { BasePageReq } from '@/modules/common/dto/common.dto'

export class SearchReq extends BasePageReq {
  keyword: string
}

export class SearchResultItem {
  sourceId: string
  sourceType: BusinessTypeEnum
  label: string
  desc: string | null
  memberCount: number
  tags: AppTagItem[]
};

export class TweetPageReq extends BasePageReq {
  keyword?: string
}

export class MediaItem {
  url: string
  type: MediaTypeEnum
  sort: number
}

export class TweetItem {
  authorId: string
  authorName: string
  authorAvatar: string
  createdAt: Date
  medias: MediaItem[]
  commentLevel: CommentLevelEnum
  longitude: number | null
  latitude: number | null
  address: string | null
  content: string
  voteCount: number
  voteFlag: boolean
  retweetFlag: boolean
  retweetCount: number
  commentCount: number
  readCount: number
  score: number
  retweetId: string | null
  parentId?: string
  tweetType?: TweetRetweetTypeEnum
};

export class TweetCreateReq {
  visibleType: VisibleTypeEnum
  retweetId: string | null
  parentId: string | null
  medias: MediaItem[]
  content: string
  longitude: number
  latitude: number
  address: string
  commentLevel: CommentLevelEnum
};

export class TweetCommentPageReq extends BasePageReq {
  tweetId: string
}

export class TweetRetweetReq {
  tweetId: string
}

export class TweetRetweetResp {
  retweetFlag: boolean
}

export class TweetVoteReq {
  tweetId: string
}

export class TweetVoteResp {
  voteFlag: boolean
}
