import { BasePageReq, BasePageResp, CommonEnum, GroupTypeEnum } from '../../common/dto/common.dto'

export class FriendRelationItem {
  uid: string
  isFriend: number
};

export class FriendInviteApplyReq {
  uid: string
  remark: string
};

export class FriendInviteApplyItem {
  id: string
  uid: string
  remark: string
  rejectReason: string
  status: number
};

export class FriendInviteAgreeReq {
  id: string
  alias: string
};

export class FriendInviteRejectReq {
  id: string
  alias: string
};

export class FriendInfoItem {
  uid: string
  chatId: string
  alias: string
};

export class FriendChangeAliasReq {
  id: string
  alias: string
};
