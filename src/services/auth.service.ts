import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { UserService } from './user.service'
import { AuthEnumIsRegister } from '@/enums'
import { RegisterReq, RegisterResp } from '@/dto/auth'
import { Prisma } from '@prisma/client'
import bufferUtil from '@/util/bufferUtil'

@Injectable()
export class AuthService {
  constructor (private readonly userService: UserService) { }

  async isRegister (id: string): Promise<AuthEnumIsRegister> {
    const user = await this.userService.findById(id)
    return (user != null) ? AuthEnumIsRegister.YES : AuthEnumIsRegister.NO
  }

  async register (param: RegisterReq): Promise<RegisterResp> {
    const exist: AuthEnumIsRegister = await this.isRegister(param.id)
    if (exist === AuthEnumIsRegister.YES) {
      console.log('已注333册')
      throw new HttpException('已注册', HttpStatus.BAD_REQUEST)
    }

    const user: Prisma.UserCreateInput = {
      id: param.id,
      unionId: bufferUtil.strMd5(param.id),
      avatar: param.avatar,
      name: param.name,
      nameIdx: '',
      gender: param.gender,
      pubKey: param.pubKey,
      dbIdx: bufferUtil.changeStr2HexNumber(param.id) % 500,
      createdAt: new Date()
    }
    const entity = await this.userService.create(user)
    return new RegisterResp(entity)
  }

  // async login (req: Request, res: Response) {
  // }

  // async updateName (req: Request, res: Response) {
  // }

  // async updateAvatar (req: Request, res: Response) {
  // }

  // async updateGender (req: Request, res: Response) {
  // }

  // async destroy (req: Request, res: Response) {
  // }
}
