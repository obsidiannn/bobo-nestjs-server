import { IsNotEmpty, ArrayNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator'
import { BaseIdReq, BasePageReq, BasePageResp, CommonEnum, GroupTypeEnum } from '../../common/dto/common.dto'
import { GroupMemberStatus } from '@/enums'

export interface GroupCreateReq {
  id: string
  pubKey: string
  avatar: string
  name: string
  isEnc: number
  type: number // 群类型 1-普通 2-付费 3-私密 默认1
  banType: number // 禁言类型 1-不禁言 2-全员禁言 3-仅管理员可发言 4-仅群主可发言 默认1
  searchType: number
  encPri: string
  encKey: string
};

export class GroupMemberReq extends BasePageReq {
  @IsNotEmpty({ message: 'not empty' })
  @IsString()
    id: string
}

export class GroupMemberListReq extends BaseIdReq {
  @IsOptional()
  @IsBoolean()
    isAdmin?: boolean

  @IsOptional()
  @IsString({ each: true })
    uids?: string[]
}

export class GroupMemberItem {
  id: string
  uid: string
  gid: string
  role: number
  myAlias: string | null
  aliasIdx: string | null
  // nameIdx: string
  adminAt: Date | null
  createdAt: Date | null
};

export class GroupMemberResp extends BasePageResp<GroupMemberItem> {

}

export class GroupRequireJoinReq extends BaseIdReq {
  @IsString()
  @IsOptional()
    remark?: string

  @IsOptional()
    encKey: string

  @IsOptional()
    encPri: string
}

export interface GroupRequireJoinResp {
  gid: string
  status: GroupMemberStatus
  err?: string
}

export class GroupApplyJoinReq {
  @IsNotEmpty({ message: 'not empty' })
  @IsString()
    id: string

  @ArrayNotEmpty({ message: 'not empty' })
  @IsString({ each: true })
    uids: string[]
}

export class GroupIdsReq {
  gids: string[]
}

export class GroupListIdResp {
  gids: string[]
}

export class GroupInfoItem {
  id: string
  name: string
  avatar: string
  memberLimit: number
  total: number
  pubKey: string
  desc: string
  isEnc: number
}

export class GroupInviteJoinItem {
  uid: string
  encKey: string
  encPri: string
}

export class GroupInviteJoinReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @ArrayNotEmpty({ message: 'not empty' })
    items: GroupInviteJoinItem[]
}

// 踢出群聊 req
export class GroupKickOutReq {
  @IsNotEmpty({ message: 'id not empty' })
    id: string

  @ArrayNotEmpty({ message: 'uids not empty' })
    uids: string[]
}

export class GroupChangeNameReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    name: string
}
export class GroupChangeAvatarReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    avatar: string
}

export class GroupChangeAliasReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    alias: string
}

export class GroupChangeNoticeReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    notice: string

  @IsNotEmpty({ message: 'not empty' })
    noticeMd5: string
}
export class GroupChangeDescReq {
  @IsNotEmpty({ message: 'not empty' })
    id: string

  @IsNotEmpty({ message: 'not empty' })
    desc: string

  @IsNotEmpty({ message: 'not empty' })
    descMd5: string
}

export class GroupTransferReq {
  @IsNotEmpty({ message: 'not empty' })
  @IsString()
    id: string

  @IsNotEmpty({ message: 'not empty' })
  @IsString({ each: true })
    uid: string

  encPri: string
  encKey: string
}

export class GroupManagerUpdateReq {
  @IsNotEmpty({ message: 'not empty' })
  @IsString()
    id: string

  @IsNotEmpty({ message: 'not empty' })
  @IsString({ each: true })
    uids: string[]

  encPri: string
  encKey: string
}

export class GroupApplyItem {
  id: string
  gid: string
  uid: string
  encKey: string
  role: number
  status: number
  createdAt: number
  remark: string
}

export class GroupNoticeResp {
  id: string
  notice: string | null
  noticeMd5: string | null
}

export class GroupDescResp {
  id: string
  desc: string | null
  descMd5: string | null
}

export class MineGroupInfoItem {
  id: string
  gid: string
  status: number
  createdAt: Date
}

export class GroupDetailItem {
  id: string
  gid: string
  name: string
  avatar: string
  createdAt: number
  memberLimit: number
  total: number
  pubKey: string
  ownerId: string
  creatorId: string
  notice: string
  noticeMd5: string
  desc: string
  descMd5: string
  cover: string
  isEnc: CommonEnum
  type: GroupTypeEnum
  banType: number
  searchType: number
  status: number
  role?: number
  tags?: string[]
};

export class GroupDetailResp {
  items: GroupDetailItem[]
  status: number
}

export class GroupTagsReq {
  @IsString()
  @IsNotEmpty({ message: 'not empty' })
    gid: string

  @IsString({ each: true })
  @IsNotEmpty({ message: 'not empty' })
    tags: string[]
}
