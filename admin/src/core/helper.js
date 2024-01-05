export const makeQueryString = (params) => {
  return Object.entries(params)
    .map((pair) => pair.map(encodeURIComponent).join('='))
    .join('&')
}
