import { BasePageReq, BasePageResp } from '@/modules/common/dto/common.dto'
import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * 求数组差集
 * @param arr1 [0,1,2]
 * @param arr2 [1,2]
 * @returns [0]
 */
export const arrayDifference = (arr1: any[], arr2: any[]): any[] => {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const difference = Array.from(new Set([...set1].filter(x => !set2.has(x))))
  return difference
}

export const pageSkip = (param: BasePageReq): number => {
  if (param.page === null || param.page === undefined) {
    param.page = 1
  }
  if (param.limit === null || param.limit === undefined) {
    param.limit = 10
  }
  return (param.page - 1) * param.limit
}

export const notNull = (o: any): boolean => {
  return o !== null && o !== undefined
}

export const nullThrow = (o: any): any => {
  if (!notNull(o)) {
    throw new HttpException('入参有误', HttpStatus.BAD_REQUEST)
  }
  return o
}

export const notEmpty = (o: any[] | undefined): boolean => {
  if (o === undefined) {
    return false
  }
  return notNull(o) && o.length > 0
}

export const emptyThrow = (o: any[] | undefined): any[] => {
  if (o === undefined || !notEmpty(o)) {
    throw new HttpException('入参有误', HttpStatus.BAD_REQUEST)
  }
  return o
}

export const emptyPageResp = <T> (param: BasePageReq): BasePageResp<T> => {
  return new BasePageResp(param, [], 0)
}

export const changeF2Y = (amount: number): number => {
  return 0
}

export default {
  arrayDifference,
  pageSkip,
  notNull,
  notEmpty,
  nullThrow,
  emptyThrow
}
