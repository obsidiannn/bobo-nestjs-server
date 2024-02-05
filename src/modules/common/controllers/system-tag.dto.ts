import { SysTagTypeEnum } from '@/enums'
import { IsNotEmpty } from 'class-validator'

export class SysTagReq {
  @IsNotEmpty({ message: 'not null' })
    type: SysTagTypeEnum
}

export class SysTagConfig {
  color?: string
}

export class SysTagItem {
  id: string
  name: string
  sort: number
  tagType: number
  config?: SysTagConfig
};
