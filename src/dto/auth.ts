import { BasePageReq, BasePageResp, CommonEnum, GroupTypeEnum } from './common'
import { IsNotEmpty, Matches } from 'class-validator'
import { Prisma, User } from '@prisma/client'

export class RegisterReq {
  @IsNotEmpty({ message: 'valid error' })
    id: string

  @IsNotEmpty({ message: '昵称不可为空' })
    name: string

  @IsNotEmpty({ message: 'valid error' })
    pubKey: string

  avatar: string
  gender: number
}

export class RegisterResp {
  constructor (entity: User) {
    this.uid = entity.unionId
    this.status = entity.status
    this.address = entity.id
    this.name = entity.name
    this.pub_key = entity.pubKey
    this.create_time = entity.createdAt.getTime()
  }

  uid: string
  status: number
  address: string
  avatar: string
  name: string
  pub_key: string
  create_time: number
}

export interface AuthCheckRegisterResp {
  is_register: number
};

export interface AuthChangeNameReq {
  name: string
};
export interface AuthChangeAvatarReq {
  avatar: string
};
export interface AuthChangeGenderReq {
  gender: number
};
export interface AuthChangeSignReq {
  sign: string
};

export interface AuthBlackListItem {
  uid: string
  created_at: number
};

export interface AuthBlackReq {
  uid: string
};
