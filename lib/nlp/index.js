export const removeAccents = (str) => {
  return str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export const matchTopic = (content, keyword) => {
  const normContent = removeAccents( content )
  const pattern=new RegExp(`\\b${ keyword }\\b`)
  if (normContent?.match(pattern)) {
    return true
  }
  else
  {
    return false
  }
}
