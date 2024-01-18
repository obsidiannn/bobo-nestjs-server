import { UserGenderEnum } from '@/enums'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class UpdateNameParams {
  @IsString({ message: '类型不一致' })
  @IsNotEmpty({ message: 'valid error' })
    username: string
}

export class UpdateGenderParams {
  @IsEnum(UserGenderEnum, { message: 'valid error' })
  @IsNotEmpty({ message: 'valid error' })
    gender: UserGenderEnum
}
