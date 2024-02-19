import { CommentLevelEnum, MediaTypeEnum, VisibleTypeEnum } from '@/enums'
import { AppTagItem } from '@/modules/apps/controllers/apps.dto'
import { BasePageReq } from '@/modules/common/dto/common.dto'

export class SearchReq {
  keyword: string
}

export class SearchResultItem {
  sourceId: string
  sourceType: string
  label: string
  desc: string
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
  retweetLabel?: string
};

export class TweetCreateReq {
  visibleType: VisibleTypeEnum
  retweetId: string
  parentId: string
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
