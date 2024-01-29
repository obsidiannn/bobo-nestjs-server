import { BasePageReq, BasePageResp } from '@/modules/common/dto/common.dto'

// 求数组差集
export const arrayDifference = (arr1: any[], arr2: any[]): any[] => {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const difference = Array.from(new Set([...set1].filter(x => !set2.has(x))))
  return difference
}

export const virtualCurrentUser = (): string => {
  return '8e731c2ffde507e755a8b72513d59ca7'
}

export const pageSkip = (param: BasePageReq): number => {
  return (param.page - 1) * param.limit
}

export const emptyPageResp = <T> (param: BasePageReq): BasePageResp<T> => {
  return new BasePageResp(param, [], 0)
}

export default {
  arrayDifference,
  pageSkip
}
