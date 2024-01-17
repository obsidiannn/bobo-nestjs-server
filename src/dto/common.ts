
export class BaseResp<T> {
  code: number
  msg: string = 'success'
  data: T
}

export const errResp = <T>(code: number, msg: string): BaseResp<T> => {
  const resp: BaseResp<T> = new BaseResp<T>()
  resp.code = code
  resp.msg = msg
  return resp
}

export class BasePageReq {
  limit: number
  page: number
}

export class BasePageResp<T> {
  page: number
  limit: number
  items: T[]
  status: number
}

export class BaseArrayResp<T> {
  items: T[]
}

export class BaseIdReq {
  id: string
}

export class BaseIdsArrayReq {
  ids: string[]
}

export class BaseUIdArrayReq {
  uids: string[]
}

export enum CommonEnum {
  OFF = 0,
  ON = 1,
}

export enum GroupTypeEnum {
  NORMAL = 1,
  PAY = 2,
  PRIVATE = 3,
}
