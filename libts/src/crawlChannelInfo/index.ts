import {getHtml} from "../getHtml"
import {parse} from "node-html-parser"
export async function crawlChannelInfo(link: string, proxy_URL: string) {
  try {
    let result = {
      name: "",
      avatar: "",
      uploads: "",
      subscribe: "",
      allViews: "",
      country: "",
      type: "",
      createdAt: new Date(),
    }
    const url = new URL(link)
    const requestUrl = "https://socialblade.com/youtube" + url.pathname
    const contentHtml = await getHtml(requestUrl, "", proxy_URL)
    let document: any
    try {
      document = parse(contentHtml.html)
    } catch (error) {
      console.log("Error when parse html with url: " + requestUrl)
    }
    if (!document) {
      return result
    }
    result.name = document?.querySelector("h1")?.textContent || ""
    result.avatar = document?.querySelector("#YouTubeUserTopInfoAvatar")?.getAttribute("src") || ""
    result.uploads = document?.querySelector("#youtube-stats-header-uploads")?.textContent || ""
    result.subscribe = document?.querySelector("#youtube-stats-header-subs")?.textContent || ""
    result.allViews = document?.querySelector("#youtube-stats-header-views")?.textContent || ""
    result.country = document?.querySelector("#youtube-stats-header-country")?.textContent || ""
    result.type = document?.querySelector("#youtube-stats-header-channeltype")?.textContent || ""
    result.createdAt = new Date(
      (document?.querySelectorAll(".YouTubeUserTopInfo")?.[4]?.textContent || "")
        .replace("st", "")
        .replace("nd", "")
        .replace("rd", "")
        .replace("th", "")
        .replace("User Created", ""),
    )
    return result
  } catch (error) {
    console.log("Error when crawl Channel Youtube:", error)
  }
}
