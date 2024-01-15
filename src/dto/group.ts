import { IsNotEmpty, ArrayNotEmpty } from 'class-validator'
import { BasePageResp, CommonEnum, GroupTypeEnum } from './common'

export class GroupCreateReq {
  id: string
  pub_key: string
  avatar: string
  name: string
  is_enc: CommonEnum
  type: number
  ban_type: number
  search_type: number
};

export class GroupMemberItem {
  id: string
  uid: string
  gid: string
  role: number
  my_alias: string
  admin_at: number
  created_at: number
};

export class GroupMemberResp extends BasePageResp<GroupMemberItem> {

}

export class GroupApplyJoinReq {
  id: string
  uids: string[]
}

export class GroupIdsReq {
  gids?: string[]
}

export class GroupListIdResp {
  gids: string[]
}

export class GroupInviteJoinItem {
  uid: string
  enc_key?: string
}

export class GroupInviteJoinReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @ArrayNotEmpty({ message: 'not empty' })
    items: GroupInviteJoinItem[]
}

// 踢出群聊 req
export class GroupKickOutReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @ArrayNotEmpty({ message: 'not empty' })
    uids: string[]
}

export class GroupChangeNameReq {
  id: string
  name: string
}
export class GroupChangeAvatarReq {
  id: string
  avatar: string
}

export class GroupChangeAliasReq {
  id: string
  alias: string
}

export class GroupChangeNoticeReq {
  id: string
  notice: string
  notice_md5: string
}
export class GroupChangeDescReq {
  id: string
  desc: string
  desc_md5: string
}

export class GroupTransferReq {
  id: string
  uid: string
}

export class GroupInfoItem {
  id: string
  gid: string
  uid: string
  enc_key: string
  role: number
  status: number
  created_at: number
}
export class MineGroupInfoItem {
  id: string
  gid: string
  status: number
  created_at: number
}

export class GroupDetailItem {
  id: string
  gid: string
  name: string
  avatar: string
  created_at: number
  member_limit: number
  total: number
  pub_key: string
  owner_id: string
  creator_id: string
  notice: string
  notice_md5: string
  desc: string
  desc_md5: string
  cover: string
  is_enc: CommonEnum
  type: GroupTypeEnum
  ban_type: number
  search_type: number
  status: number
};

export class GroupDetailResp {
  items: GroupDetailItem[]
  status: number
}
