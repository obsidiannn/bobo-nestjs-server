import { IsString } from 'class-validator'

export class BaseResp<T> {
  code: number
  msg: string = 'success'
  data: T
}

export class BasePageReq {
  // 限制 最多 100个
  limit: number
  // 当前页
  page: number
}

export class BasePageResp<T> {
  constructor (param: BasePageReq, data: T[], total: number) {
    this.page = param.page
    this.limit = param.limit
    this.items = data
    this.total = total
  }

  page: number
  limit: number
  total: number
  items: T[]
  status: number = 0

  transfer <R>(data: R[]): BasePageResp<R> {
    const result: BasePageResp<R> = {
      ...this,
      items: data
    }
    return result
  }
}

export interface BaseArrayResp<T> {
  items: T[]
}

export class BaseIdReq {
  @IsString()
    id: string
}

export interface BaseUIdReq {
  uid: string
}

export interface BaseIdsArrayReq {
  ids: string[]
}

export interface BaseUIdArrayReq {
  uids: string[]
}

export interface FieldChange {
  id: string
  fieldKey: string
  fieldValue: string
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
