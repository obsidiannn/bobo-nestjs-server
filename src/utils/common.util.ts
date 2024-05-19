import { BasePageReq, BasePageResp } from '@/modules/common/dto/common.dto'
import { HttpException, HttpStatus } from '@nestjs/common'
import { pinyin } from 'pinyin-pro'
import * as Crypto from 'crypto'

const generateId = (): string => {
  return Buffer.from(Crypto.randomBytes(12)).toString('hex')
}

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

export const notBlank = (o: string): boolean => {
  return o !== undefined && o !== null && o.length > 0 && o !== ''
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

export const randomSplit = (n: number, total: number): number[] => {
  const res: number[] = [] // 最后返回的数组
  let range = total // 生成随机金额的范围
  let preTotal = 0 // 已经生成的金额的和
  for (let i = 0; i < (n - 1); i++) {
    const item = Math.ceil(Math.random() * (range / 2))
    res.push(item)
    range -= item // 从范围内减去已经生成的金额
    preTotal += item // 将已经生成的金额进行累加
  }
  res.push(total - preTotal) // 最后将剩下的金额添加到数组中
  return res
}

/**
 * 随机数组下标
 * @param length
 * @returns index
 */
export const randomIndex = (length: number): number => {
  return Math.floor((Math.random() * length))
}

export const hashValueDefault = <T> (k: any, hash: Map<any, any>, defaultValue: T): T => {
  const v = hash.get(k)
  if (v === null) {
    return defaultValue
  }
  return v
}

// 定义一个函数来获取汉字的拼音首字母
const getFirstLetterOfPinyin = (word: string): string => {
  if (notBlank(word)) {
    const result = pinyin(word.charAt(0), { type: 'array', toneType: 'none' })
      .map(i => i[0].toUpperCase())
    return result[0]
  } else {
    return '#' // 如果没有拼音，返回空字符串
  }
}

export interface ChunkSliceResult {
  min: number
  max: number
  valArr: number[]
}

/**
 * 函数用于切割数组为子数组
 * @param array 正序后的数组
 * @param size chunk size
 * @returns
 */
function sliceIntoChunks (array: number[], size: number): ChunkSliceResult [] {
  const result: ChunkSliceResult[] = []
  let current = -1
  let valArr: number[] = []
  for (let index = 0; index < array.length; index++) {
    const val = array[index]
    if (val <= 0) {
      continue
    }
    let idx = Math.floor(val / size)

    const idx2 = val % size
    console.log('idx=', idx, 'idx2=', idx2)

    if (idx2 === 0) {
      idx -= 1
    }
    if (current < 0) {
      current = idx
    } else {
      if (current !== idx) {
        // addSlice
        const r = {
          min: (current * size) + 1,
          max: ((current + 1) * size),
          valArr
        }
        console.log(r)
        result.push(r)
        current = idx
        valArr = [val]
        continue
      }
    }
    valArr.push(val)
  }
  const r = {
    min: (current * size) + 1,
    max: ((current + 1) * size),
    valArr
  }
  console.log(r)
  result.push(r)

  return result
}

export default {
  arrayDifference,
  pageSkip,
  notNull,
  notEmpty,
  nullThrow,
  emptyThrow,
  randomSplit,
  randomIndex,
  hashValueDefault,
  notBlank,
  getFirstLetterOfPinyin,
  generateId,
  sliceIntoChunks
}
