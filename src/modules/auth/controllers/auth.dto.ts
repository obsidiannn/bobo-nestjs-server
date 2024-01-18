import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateNameParams {
  @IsString({ message: '类型不一致' })
  @IsNotEmpty({ message: 'valid error' })
    username: string
}
