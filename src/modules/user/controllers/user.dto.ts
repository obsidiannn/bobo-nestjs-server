import { GenderEnum } from '@/enums'

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
}

export class UserInfoDto extends UserInfoItem {
  sign: string
}
