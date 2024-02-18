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
  createdAt: string
  medias: MediaItem[]
  commentLevel: CommentLevelEnum
  longitude: number
  latitude: number
  address: string
  content: string
  voteCount: number
  voteFlag: boolean
  transFlag: boolean
  transCount: number
  commentCount: number
  readCount: number
  score: number
  parentId: string
  retweetId: string
  retweetLabel: string
};

export class TweetCreateReq {
  visibleType: VisibleTypeEnum
  retweetId: string
  parentId: string
  medias: MediaItem[]
  content: string
  longitude: number
  latitude: number
  commentLevel: CommentLevelEnum
};

export class TweetCommentPageReq extends BasePageReq {
  tweetId: string
}

export class TweetTransPostReq {
  tweetId: string
}

export class TweetTransPostResp {
  transFlag: boolean
}

export class TweetVoteReq {
  tweetId: string
}

export class TweetVoteResp {
  voteFlag: boolean
}
