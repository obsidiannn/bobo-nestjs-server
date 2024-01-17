// 求数组差集
export const arrayDifference = (arr1: any[], arr2: any[]): any[] => {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const difference = Array.from(new Set([...set1].filter(x => !set2.has(x))))
  return difference
}

export const virtualCurrentUser = (): string => {
  return '8df02aa4-c708-41fe-a224-54c81e20dd6a'
}

export default {
  arrayDifference
}
