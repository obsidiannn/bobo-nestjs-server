import aes from '@/utils/aes'
describe('aes test', () => {
  const key = '123'
  const text = '123'
  const textBuffer = Buffer.from('hello world!', 'utf-8')

  it('aes test text de & en', () => {
    const en = aes.En(text, key)
    const de = aes.De(en, key)
    expect(de).toEqual(text)
  })

  it('aes test textBuffer de & en', () => {
    const en = aes.EnBuffer(textBuffer, key)
    const de = aes.DeBuffer(en, key)
    expect(de).toEqual(textBuffer)
  })
})
