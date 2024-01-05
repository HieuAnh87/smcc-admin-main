import {gotScraping} from "got-scraping"

export async function getHtml(url: string, userAgent: string, proxy_URL: string) {
  let html = ""
  let redirectUrl = ""
  let response: any = {}
  let optionsGot: any = {}
  optionsGot.headerGeneratorOptions = {
    browsers: [
      {
        name: "chrome",
        minVersion: 87,
      },
      {
        name: "firefox",
      },
    ],
    devices: ["desktop"],
    locales: ["en-US"],
    operatingSystems: ["windows", "linux", "macos"],
  }
  optionsGot.url = url
  ;(optionsGot.timeout = {request: 60000}), (optionsGot.retry = {limit: 2})
  if (userAgent && userAgent != "") {
    optionsGot.headers = {
      "user-agent": userAgent,
    }
  }

  if (proxy_URL && proxy_URL != "" && proxy_URL != "localhost") {
    optionsGot.proxyUrl = proxy_URL
  }
  try {
    response = await gotScraping(optionsGot)
    if (response.redirectUrls?.length > 0) {
      redirectUrl = response.redirectUrls[0].href
      if (redirectUrl.endsWith("/")) {
        redirectUrl = redirectUrl.slice(0, -1)
      }
    }
    html = response?.body
  } catch (error1) {
    try {
      if (url.includes("http://")) {
        url = url.replace("http://", "https://")
      } else if (url.includes("https://")) {
        url = url.replace("https://", "http://")
      }
      optionsGot.url = url
      response = await gotScraping(optionsGot)
      html = response?.body
    } catch (error2) {
      try {
        if (url.includes("://www.")) {
          url = url.replace("://www.", "://")
        } else {
          url = url.replace("://", "://www.")
        }
        optionsGot.url = url
        response = await gotScraping(optionsGot)
        html = response?.body
      } catch (error3) {
        console.error("Error when get html by Got with url: " + url)
        console.error(error1)
      }
    }
  }
  return {html, redirectUrl}
}
