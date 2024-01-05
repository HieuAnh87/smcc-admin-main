export const removeAccents = (str: string) => {
  return str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export const matchTopic = (content: string, keyword: string) => {
  const normContent = removeAccents(content)
  const pattern = new RegExp(`\\b${keyword}\\b`)
  if (normContent?.match(pattern)) {
    return true
  } else {
    return false
  }
}
export const genSlug = (title: string) => {
  let slug
  slug = removeAccents(title)
  slug = title.toLowerCase()

  // remove special characters
  slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '')
  // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

  // replace spaces with dash symbols
  slug = slug.replace(/ /gi, '-')

  // remove consecutive dash symbols
  slug = slug.replace(/\-\-\-\-\-/gi, '-')
  slug = slug.replace(/\-\-\-\-/gi, '-')
  slug = slug.replace(/\-\-\-/gi, '-')
  slug = slug.replace(/\-\-/gi, '-')

  // remove the unwanted dash symbols at the beginning and the end of the slug
  slug = '@' + slug + '@'
  slug = slug.replace(/\@\-|\-\@|\@/gi, '')
  return slug
}
