import { UserGenderEnum } from '@/enums'
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class UpdateNameParams {
  @IsString({ message: '类型不一致' })
  @IsNotEmpty({ message: 'valid error' })
    name: string
}

export class UpdateSignParams {
  @IsString({ message: '类型不一致' })
  @IsNotEmpty({ message: 'valid error' })
    sign: string
}

export class UpdateGenderParams {
  @IsEnum(UserGenderEnum, { message: 'valid error' })
  @IsNotEmpty({ message: 'valid error' })
    gender: UserGenderEnum
}

export class UpdateAvatarParams {
  @IsString({ message: '类型不一致' })
  @IsNotEmpty({ message: 'valid error' })
  @Matches(/(webp)$/, { message: '格式不正确' })
    avatar: string
}

export class UpdateMessageTokenReq {
  @IsString()
  @IsOptional()
    token: string
}
