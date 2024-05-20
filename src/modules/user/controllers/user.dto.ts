import { GenderEnum } from '@/enums'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UserInfoItem {
  id: string
  avatar: string
  name: string
  nameIndex: string
  gender: GenderEnum
  pubKey: string
}

export class UserDetailDto {
  id: string
  avatar: string
  name: string
  nameIndex: string
  gender: GenderEnum
  pubKey: string
  sign: string
  userSequence: number | null
}

export class UserInfoDto extends UserInfoItem {
  sign: string
}

export class UserInfoQueryReq {
  @IsString({ each: true })
    uids: string[]

  @IsBoolean()
  @IsOptional()
    official?: boolean
}
