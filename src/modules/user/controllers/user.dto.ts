import { GenderEnum } from '@/enums'

export class UserInfoItem {
  id: string
  avatar: string
  name: string
  nameIndex: string
  gender: GenderEnum
  pubKey: string
}

export class UserInfoDto extends UserInfoItem {
  pubKey: string
  sign: string
}
