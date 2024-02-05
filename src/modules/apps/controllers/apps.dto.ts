import { BasePageReq } from '@/modules/common/dto/common.dto'
// 获取tag 列表
export class AppTagItem {
  id: number
  name: string
  sort: number
  color: string
}
// 应用列表
export class AppPageReq extends BasePageReq {
  tag?: string
  sort?: string
  groupId?: string
}
export class AppItem {
  id: string
  icon: string
  name: string
  desc: string
  avgStar: number
  installCount: string
  groupInstallFlag: string
}
// 应用详情
export class AppDetailReq {
  appId: string
  groupId: string
}

export class AppDetailResp {
  id: string
  icon: string
  name: string
  desc: string
  tags: AppTagItem[]
  author: string
  activeAt: string
  avgStar: number
  installCount: string
  detailImages: string[]
  groupInstallFlag: string
}
// 应用评论列表
export class AppCommentPageReq extends BasePageReq {
  appId: string
}

export class AppCommentItem {
  id: string
  uid: string
  username: string
  avatar: string
  star: string
  score: string
  createdAt: string
  content: string
  voteFlag: boolean
}

// 应用打分（评论）
export class AppCommentReq {
  appId: string
  score: number
  content: string
};
// 应用内评论点赞
export class AppCommentVoteReq {
  appId: string
  commentId: string
};
export class AppCommentVoteResp {
  commentId: string
  voteFlag: string
};

// 我的群组应用列表
export class GroupAppListReq {
  groupId: string
}

export class GroupAppItem {
  id: string
  name: string
  icon: string
};

// 群组应用
export class GroupAppReq {
  groupId: string
  appId: string
};
