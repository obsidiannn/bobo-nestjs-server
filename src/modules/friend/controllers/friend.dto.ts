import { IsNotEmpty, ArrayMaxSize, IsString } from 'class-validator'
import { BasePageReq, BasePageResp, CommonEnum, GroupTypeEnum } from '../../common/dto/common.dto'

export class FriendRelationItem {
  uid: string
  // 是否是好友 0-互为陌生人 1-互为好友 2-对方是我的好友/我是对方的陌生人 3-对方是我的陌生人/我是对方的好友
  isFriend: number
};

export class FriendInviteApplyReq {
  uid: string
  remark: string
};

export class FriendInviteApplyItem {
  id: string
  uid: string
  remark: string | null
  rejectReason?: string
  status: number
  createdAt: Date
};

export class FriendInviteAgreeReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    alias: string
};

export class FriendInviteRejectReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    reason: string
};

export class FriendListPageReq extends BasePageReq {
  @ArrayMaxSize(100)
  @IsString({ each: true })
    uids: string[]
};

export class FriendInfoItem {
  uid: string
  chatId?: string
  alias: string | null
};

export class FriendChangeAliasReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    alias: string
};
