import commonUtil from './common.util'

describe('工具类的测试', () => {
  describe('common.util.ts test', () => {
    it('数组差集', () => {
      const a = [1, 2, 3]
      const b = [1]

      const result = commonUtil.arrayDifference(a, b)
      console.log('====================================')
      console.log(result)
      console.log('====================================')
      expect(result).toEqual([2, 3])
    })
  })

  describe('红包随机拆分等份', () => {
    const total = 2553
    const result = commonUtil.randomSplit(23, total)
    console.log(result)
    const resultTotal = result.reduce((a, b) => { return a + b })
    console.log(resultTotal)
    expect(resultTotal).toEqual(total)
  })

  describe('拼音test', () => {
    console.log(commonUtil.getFirstLetterOfPinyin('你好'))
    console.log(commonUtil.getFirstLetterOfPinyin('李文哲'))
    console.log(commonUtil.getFirstLetterOfPinyin('陈世美'))
    console.log(commonUtil.getFirstLetterOfPinyin('tom'))
  })

  describe('bitmap 用户seq 分片测试', () => {
    it('id 分片', () => {
      console.log(commonUtil.sliceIntoChunks([2, 16, 21, 27, 30, 45], 1024))
      // console.log(commonUtil.sliceIntoChunks([2, 16, 27, 30, 45], 10))
    })
  })
})
