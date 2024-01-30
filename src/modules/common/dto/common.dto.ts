
export class BaseResp<T> {
  code: number
  msg: string = 'success'
  data: T
}

export class BasePageReq {
  // 限制 最多 100个
  limit: number = 10
  // 当前页
  page: number = 1
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

export class BaseArrayResp<T> {
  items: T[]
}

export class BaseIdReq {
  id: string
}

export class BaseUIdReq {
  uid: string
}

export class BaseIdsArrayReq {
  ids: string[]
}

export class BaseUIdArrayReq {
  uids: string[]
}

export class FieldChange {
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
