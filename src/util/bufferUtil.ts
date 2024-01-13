const crypto = require('crypto')

export const changeStr2HexNumber = (str: string): number => {
  const bufferData = Buffer.from(str, 'utf8')
  const hexNumbers = Array.from(bufferData, byte => byte)
  return parseInt(hexNumbers.map(byte => byte.toString(16)).join(''), 16)
}

export const strMd5 = (str: string): string => {
  return crypto.createHash('md5').update(str).digest('hex')
}

export default {
  changeStr2HexNumber,
  strMd5
}
