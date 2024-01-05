import {getHtml} from "../getHtml"
import {parse} from "node-html-parser"
export const getContentWp = async (url: string) => {
  let imageLink = ""
  let title = ""
  let description = ""
  try {
    const html = await getHtml(url, "", "")
    let domOrigin: any
    try {
      domOrigin = parse(html.html)
    } catch (error) {
      console.log("Error when parse html with url: " + url)
    }
    if (!domOrigin) {
      return null
    }
    const meta = domOrigin.querySelectorAll("meta")
    imageLink = meta.find((e: any) => e.getAttribute("property") == "og:image")?.getAttribute("content") || ""
    description = meta.find((e: any) => e.getAttribute("property") == "og:description")?.getAttribute("content") || ""

    title = domOrigin.querySelector("title")?.innerHTML || ""
  } catch (error) {
    console.log("Error when get ContentWp: ", error)
  }

  return {title, description, imageLink}
}
