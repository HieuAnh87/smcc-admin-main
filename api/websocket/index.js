import {authenticate} from "./auth.js"
import {Server} from "socket.io"
import {notifyEmail, notifyTelegram, notifyTelegramGroup} from "../util/Notify.js"
import * as NotificationRepo from "../repositories/Notification.repo.js"
import * as ContentRepo from "../repositories/Content.repo.js"
import {PrismaClient} from "../../lib/index.js"
let io
const prisma = new PrismaClient()
export const crawlerSockets = {
  fbCrawler: null,
  webCrawler: null,
  searchEngineCrawler: null,
}

export const initWs = (server) => {
  io = new Server(server, {
    path: "/ws",
    cors: {
      origin: process.env.WHITE_LISTS.split(","),
      methods: ["GET", "POST"],
    },
  })

  io.use(authenticate)

  io.on("connection", (socket) => {
    console.log(`a user connected: ${socket.id}`)
    socket.on("disconnect", () => {
      console.log(`user disconnected: ${socket.id}`)
    })

    socket.on("new_fb_crawler", () => {
      console.log("New facebook crawler connect: ", socket.id)
      crawlerSockets.fbCrawler = socket
    })

    socket.on("new_website_crawler", () => {
      console.log("New website crawler connect: ", socket.id)
      crawlerSockets.webCrawler = socket
    })

    socket.on("new_search_crawler", () => {
      console.log("New search crawler connect: ", socket.id)
      crawlerSockets.searchEngineCrawler = socket.id
    })

    // setInterval(() => {
    //   socket.emit('notification', {detail: 'Test notification', contentIds: [0, 1, 2]})
    // }, 2000)
    socket.on("new_content", async (content) => {
      console.log("new_content", content)

      let priority = false
      let allKeywordContent = ""
      try {
        // for (const keywordSetting of content.matchKeywordSettings) {
        //   if (keywordSetting?.notify?.priority.length > 0) {
        //     for (const userId of keywordSetting?.notify?.priority) {
        //       const index = userNotiPriority.findIndex((el) => el.userId == userId)
        //       if (index == -1) {
        //         const pushObj = {userId: userId, keyword: [keywordSetting.keywords]}
        //         userNotiPriority.push(pushObj)
        //       } else {
        //         userNotiPriority[index].keyword.push(keywordSetting.keywords)
        //       }
        //     }
        //   }
        // }
        // for (const noti of userNotiPriority) {
        //   let contentNoti = `Bài viết mới : ${
        //     content?.editedTextContent != '' && content?.editedTextContent
        //       ? content.editedTextContent
        //       : content.textContent.substring(0, 100)
        //   } ${process.env.HOMEURL + '/bai-viet?id=' + content.id} thuộc các cụm keyword: `
        //   for (const keyword of noti.keyword) {
        //     contentNoti = contentNoti + '"' + keyword + '", '
        //   }
        //   const userNotiSetting = await prisma.settingNotify.findFirst({
        //     where: {
        //       userId: noti.userId,
        //     },
        //   })
        //   if (userNotiSetting && userNotiSetting.telegram) {
        //     await notifyTelegram(noti.userId, contentNoti, [content.id], userNotiSetting)
        //   }
        //   if (userNotiSetting && userNotiSetting.email) {
        //     await notifyEmail(userNotiSetting.email, noti.userId, 'Thông báo bài viết quan trọng mới', contentNoti, [
        //       content.id,
        //     ])
        //   }
        //   if (userNotiSetting && userNotiSetting.webapp) {
        //     await NotificationRepo.add({
        //       type: 'WEBAPP',
        //       userId: noti.userId,
        //       notifycationContent: contentNoti,
        //       contentIds: [content.id],
        //     }).catch((err) => {
        //       console.log('Save webapp notification to', noti.userId, 'fail: ', err)
        //       socket.emit('notification', {
        //         contentIds: [content.id],
        //         detail: contentNoti,
        //       })
        //     })
        //   }
        // }
        for (const keywordSetting of content.matchKeywordSettings) {
          // if (keywordSetting?.notify == "priority") {
          //   priority = true
          // }
          allKeywordContent = allKeywordContent + keywordSetting.keywords + " "
        }
        // if (priority) {
        // let contentNoti = `Bài viết mới : ${
        //   content?.editedTextContent != "" && content?.editedTextContent
        //     ? content.editedTextContent
        //     : content.textContent.substring(0, 200)
        // } ${content.link} thuộc các cụm keyword: ${allKeywordContent.substring(0, 50)}${
        //   allKeywordContent?.length > 50 ? "..." : ""
        // }`
        // const resTele = await notifyTelegramGroup(contentNoti)
        // await ContentRepo.update(content.id, resTele, {idTeleGroup: resTele, contentTeleNoti: contentNoti})
        // socket.emit("notification", {
        //   detail: `Bài viết mới:  ${
        //     content?.title != "" && content?.title ? content.title : content.textContent.substring(0, 300)
        //   } thuộc các cụm keyword: ${allKeywordContent.substring(0, 50)}${allKeywordContent?.length > 50 ? "..." : ""}`,
        //   contentIds: [0, 1, 2],
        // })
        // }
      } catch (error) {
        console.log("Error when notifyTelegram:", error)
      }

      // Todo: Save screenShot
      // Todo: Setup notification
      socket.broadcast.emit("update_dashboard", content)
    })
    socket.on("connect_error", (e) => {
      console.log("socket error 1: ", e)
    })
  })
  return io
}
