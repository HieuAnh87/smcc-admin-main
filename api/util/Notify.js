import nodemailer from "nodemailer"
import TelegramBot from "node-telegram-bot-api"
import configKeys from "../config/keys.config.js"
import * as NotificationRepo from "../repositories/Notification.repo.js"
import * as ContentRepo from "../repositories/Content.repo.js"
import * as HistoryRepo from "../repositories/History.repo.js"

import got from "got"

const botId = configKeys.telegramBotId
const token = configKeys.telegramBotToken
const groupId = configKeys.telegramGroupId

// let bot
// try {
//   bot = new TelegramBot(token, {polling: true})
// } catch (error) {
//   // bot = new TelegramBot(token, {polling: true})
//   console.log("error", error)
// }

// bot.onText(/\/start/, async (msg) => {
//   let reply = `ID: ${msg.chat.id}\nFirst name: ${msg.chat.first_name}\nLast name: ${msg.chat.last_name}\nUser name: ${msg.chat.username}`
//   const username = msg.chat.username
//   if (username) {
//     const userNotiSetting = await prisma.settingNotify.findFirst({
//       where: {
//         telegram: {
//           startsWith: `https://t.me/${username}`,
//         },
//       },
//     })

//     if (userNotiSetting) {
//       await prisma.settingNotify.update({
//         where: {id: userNotiSetting.id},
//         data: {
//           telegram: `https://t.me/${username}?chat_id=${msg.chat.id}`,
//         },
//       })
//       reply += '\nCài đặt thông báo thành công!'
//     }
//   }
//   try {
//     await bot.sendMessage(msg.chat.id, reply)
//   } catch (err) {
//     console.log('Response /start telegram command: ', err)
//   }
//   if (msg.text.toString().toLowerCase().includes('bye')) {
//     bot.sendMessage(groupId, 'Have a nice day ' + msg.from.first_name)
//   }
// })
// bot.on('message', async (msg) => {
//   var bye = 'bye'
//   if (msg.text.toString().toLowerCase().includes(bye)) {
//     try {
//       // bot.sendMessage(msg.chat.id, '*Some* message here.', options)
//       const response = await bot.sendMessage(
//         msg.chat.id,
//         'Bài viết mới : Thông tin nữ sinh nhảy lầu: &apos;Đây là thông tin bịa đặt, hoàn toàn sai sự thật&apos; - đại diện Trường quân sự Quân khu 7 nói về thông tin lan truyền trên mạng liên quan sinh viên HUFLIT học quân sự tại trung tâm giáo dục quốc phòng của trường. https://afamily.vn/truong-quan-su-quan-khu-7-noi-gi-ve-thong-tin-sinh-vien-huflit-hoc-quan-su-lan-tren-mang-20230112114231609.chn thuộc các cụm keyword: (tin nong|xe biển đỏ|bộ đội|quân nhân|chiến sỹ|thi...:',
//         {
//           reply_markup: {
//             inline_keyboard: [
//               [
//                 {
//                   text: 'Bỏ qua',
//                   callback_data: 'Boqua',
//                 },
//                 {
//                   text: 'Xử lý',
//                   callback_data: 'Xuly',
//                 },
//               ],
//             ],
//           },
//         },
//       )
//       console.log('response: ',response)
//     } catch (error) {
//       console.log('Error when send message with option keyboard')
//     }
//   }
// })
// bot.on("callback_query", async function onCallbackQuery(callbackQuery) {
//   const action = callbackQuery.data
//   const msg = callbackQuery.message
//   const opts = {
//     chat_id: msg.chat.id,
//     message_id: msg.message_id,
//   }

//   if (action === "Boqua") {
//     try {
//       await ContentRepo.update(null, opts.message_id, {userHandle: "skippedPost"})
//       await bot.deleteMessage(opts.chat_id, opts.message_id)
//       await HistoryRepo.add({
//         teleInfo: {
//           id: callbackQuery?.from?.id,
//           first_name: callbackQuery?.from?.first_name,
//           last_name: callbackQuery?.from?.last_name,
//           user_name: callbackQuery?.from?.username,
//         },
//         description: `Đã bỏ qua bài viết có teleId: ${opts.message_id}`,
//       })
//     } catch (error) {
//       console.log("Error when skip post on telegram: ", error)
//     }
//   } else if (action === "Xuly") {
//     try {
//       await ContentRepo.update(null, opts.message_id, {userHandle: "handledPost"})
//       // await bot.deleteMessage(opts.chat_id, opts.message_id)
//       await bot.editMessageReplyMarkup(
//         {
//           inline_keyboard: [
//             [
//               {
//                 text: "Bỏ qua",
//                 callback_data: "Nothing",
//               },
//               {
//                 text: "Đã xử lý",
//                 callback_data: "Nothing",
//               },
//             ],
//           ],
//         },
//         opts,
//       )
//       await HistoryRepo.add({
//         teleInfo: {
//           id: callbackQuery?.from?.id,
//           first_name: callbackQuery?.from?.first_name,
//           last_name: callbackQuery?.from?.last_name,
//           user_name: callbackQuery?.from?.username,
//         },
//         description: `Đã thêm vào xử lý bài viết có teleId: ${opts.message_id}`,
//       })
//     } catch (error) {
//       console.log("Error when handle post on telegram: ", error)
//     }
//   }
// })

export const notifyTelegramGroup = async (notifycationContent) => {
  // let res
  try {
    // res = await got
    //   .post(`https://api.telegram.org/bot${token}/sendMessage`, {
    //     json: {
    //       chat_id: groupId,
    //       text: notifycationContent,
    //       parse_mode: 'HTML',
    //     },
    //   })
    //   .json()
    const res = await bot.sendMessage(groupId, notifycationContent, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Bỏ qua",
              callback_data: "Boqua",
            },
            {
              text: "Xử lý",
              callback_data: "Xuly",
            },
          ],
        ],
      },
    })
    return res.message_id
  } catch (error) {
    console.log("Error when notify Tele", error)
  }

  // if (res.ok) {
  //   return res.result.message_id
  // }
  return null
}

export const editTelegramMessage = async (messageId, messageTele) => {
  const editedMessageTele = messageTele.replace("Bài viết mới", "Bài viết đã xử lý")
  try {
    if (messageId) {
      await got.post(`https://api.telegram.org/bot${token}/editMessageText`, {
        json: {
          chat_id: groupId,
          message_id: messageId,
          text: editedMessageTele,
          parse_mode: "HTML",
        },
      })
    }
  } catch (error) {
    console.log("Error when edit message notify Tele", error)
  }
}
export const deleteTelegramMessage = async (messageId) => {
  try {
    // res = await got
    //   .post(`https://api.telegram.org/bot${token}/deleteMessage`, {
    //     json: {
    //       chat_id: groupId,
    //       message_id: messageId,
    //       parse_mode: 'HTML',
    //     },
    //   })
    //   .json()
    if (messageId) {
      await bot.deleteMessage(groupId, messageId)
    }
  } catch (error) {
    console.log("Error when delete message notify Tele", error)
  }
}
export const updateHandledTelegramMessage = async (messageId) => {
  try {
    if (messageId) {
      await bot.editMessageReplyMarkup(
        {
          inline_keyboard: [
            [
              {
                text: "Bỏ qua",
                callback_data: "Nothing",
              },
              {
                text: "Đã xử lý",
                callback_data: "Nothing",
              },
            ],
          ],
        },
        {
          chat_id: groupId,
          message_id: messageId,
        },
      )
    }
  } catch (error) {
    console.log("Error when delete message notify Tele", error)
  }
}
export const notifyTelegram = async (userId, notifycationContent, contentIds, userNotiSetting) => {
  // Telegram bot token: 5739128344:AAGhKXhckcu353Dtk9E0jC9FLqy8Lg4RZQI
  // Telegram bot name: @BotTelegramSMCCDemo_bot
  // Api get chat id: https://api.telegram.org/bot<YourBOTToken>/getUpdates
  // Api send message:  https://api.telegram.org/bot{bot_token}/sendMessage?chat_id={chat_id}&text={notification_text}
  // Link telegram bot: http://t.me/BotTelegramSMCCDemo_bot
  if (configKeys.telegramBotToken) {
    if (userNotiSetting.telegram) {
      const chatId =
        userNotiSetting.telegram.match(/chat_id=(\d+)/)?.[1] || userNotiSetting.telegram.match(/^\d+$/g)?.[0]

      if (chatId) {
        const response = await bot.sendMessage(chatId, notifycationContent).catch((err) => {
          console.log("Send telegram message to", userId, "fail", err)
        })
        console.log("response-----------------", response)
        if (response) {
          await NotificationRepo.add({type: "TELEGRAM", userId, notifycationContent, contentIds}).catch((err) => {
            console.log("Save telegram notification to", userId, "fail: ", err)
          })
          return true
        }
      } else {
        console.log("Do not have telegram chatId with this userId: ", userId)
      }
    } else {
      console.log("Do not have telegram notification setting with this userId: ", userId)
    }
  } else {
    console.log("Do not have telegram bot token")
  }
  return false
}

export const notifyEmail = async (email, userId, subject, htmlContent, contentIds) => {
  // Add app password login to gmail: https://www.youtube.com/watch?v=xvX4gWRWIVY
  if (configKeys.mailNotifyAddress && configKeys.appMailNotifyPassword) {
    const transporter = nodemailer.createTransport({
      // service: 'gmail',
      host: configKeys.mailNotifyHost,
      port: configKeys.mailNotifyPort,
      secure: true,
      auth: {
        user: configKeys.mailNotifyAddress,
        pass: configKeys.appMailNotifyPassword,
      },
    })

    const response = await transporter
      .sendMail({
        from: configKeys.mailNotifyAddress,
        to: email,
        subject: subject,
        html: htmlContent,
      })
      .catch((err) => {
        console.log("Send mail to", userId, "fail")
        console.log(err)
      })

    if (response) {
      await NotificationRepo.add({type: "EMAIL", userId, notifycationContent: htmlContent, contentIds}).catch((err) => {
        console.log("Save email notification to", userId, "fail: ", err)
      })
      return true
    }
  } else {
    console.log("Do not have email host info")
  }
  return false
}
