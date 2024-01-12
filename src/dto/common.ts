import { HttpStatus } from '@nestjs/common'

export class BaseResp<T> {
  code: number
  msg: string = 'success'
  data: T
}
export const okResp = <T>(param: T): BaseResp<T> => {
  const resp: BaseResp<T> = new BaseResp<T>()
  resp.code = HttpStatus.OK
  resp.data = param
  return resp
}

export const errResp = <T>(code: number, msg: string): BaseResp<T> => {
  const resp: BaseResp<T> = new BaseResp<T>()
  resp.code = code
  resp.msg = msg
  return resp
}

export interface BasePageReq {
  limit: number
  page: number
}

export interface BasePageResp<T> {
  page: number
  limit: number
  items: T[]
  status: number
}

export interface BaseArrayResp<T> {
  items: T[]
}

export interface BaseIdReq {
  id: string
}

export interface BaseIdsArrayReq {
  ids: string[]
}

export interface BaseUIdArrayReq {
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
