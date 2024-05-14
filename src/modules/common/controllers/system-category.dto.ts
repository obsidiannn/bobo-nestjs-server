import { SysCategoryTypeEnum } from '@/enums'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class SysCategoryReq {
  @IsNotEmpty({ message: 'not null' })
  @IsNumber()
    type: SysCategoryTypeEnum
}

export class SysCategoryConfig {
  color?: string
}

export class SysCategoryItem {
  id: string
  name: string
  sort: number
  type: number
  config?: SysCategoryConfig
};
