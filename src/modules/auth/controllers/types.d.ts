import { AuthEnumIsRegister } from '@/enums'
import { IModel } from '@/index'
import { User } from '@prisma/client'

export namespace IAuthController {
  export interface IsRegisterResponse {
    isRegister: AuthEnumIsRegister
  }
  export interface RegisterResponse {
    user: User
  }
  export interface LoginResponse {
    user: User
  }
}

export namespace ISystemController {
  export interface InfoResponse extends IModel.SystemInfo {}
}
