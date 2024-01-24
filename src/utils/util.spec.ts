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
})
