import { Injectable } from '@nestjs/common'
import { UserService } from './user.service'
import { AuthEnumIsRegister } from '@/enums'

@Injectable()
export class AuthService {
  constructor (private readonly userService: UserService) { }
  async isRegister (id: string): Promise<AuthEnumIsRegister> {
    const user = await this.userService.findById(id)
    return (user != null) ? AuthEnumIsRegister.YES : AuthEnumIsRegister.NO
  }

  // async register (req: Request, res: Response) {
  // }

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
