import dotenv from 'dotenv'
dotenv.config()

export default {
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100000,
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpires: process.env.ACCESSTOKEN_EXPIRES || '15d',
  telegramBotId: process.env.TELEGRAM_BOT_ID || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramGroupId: process.env.TELEGRAM_GROUP_ID || '',
  mailNotifyAddress: process.env.MAIL_NOTIFY_ADDRESS || '',
  appMailNotifyPassword: process.env.APP_MAIL_NOTIFY_PASSWORD || '',
  mailNotifyHost: process.env.MAIL_HOST || '',
  mailNotifyPort: process.env.MAIL_PORT || '',
  domainGetIp: process.env.DOMAIN_GET_IP || '',
}
