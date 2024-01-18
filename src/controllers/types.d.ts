import { AuthEnumIsRegister } from '@/enums'
import { IModel } from '@/index'

export namespace IAuthController {
  export interface IsRegisterResponse {
    is_register: AuthEnumIsRegister
  }
}

export namespace ISystemController {
  export interface InfoResponse extends IModel.SystemInfo {}
}
