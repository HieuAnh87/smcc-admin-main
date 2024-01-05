import jwt from 'jsonwebtoken'
import config from '../config/keys.config.js'
import * as UserRepo from "../repositories/User.repo.js";
import * as TokenRepo from "../repositories/Token.repo.js";
const { jwtSecret } = config

export const authenticate = async (socket, next) => {
  const token = socket.handshake.auth.token
  if (token == process.env.SOCKET_SECRET_TOKEN) {
    return next()
  } else if (!token) {
    return next(new Error('not authorized'))
  }
  try {
    const decode = jwt.verify(token, jwtSecret)
    if (decode && decode.exp > Math.floor(Date.now() / 1000)) {
      const user = await UserRepo.findById(decode.id)
      const tokenInfo = await TokenRepo.findByAccesstoken(token)

      if (user && tokenInfo.userId === user.id) {
        return next()
      } else {
        await TokenRepo.remove(null, token)
        const err = new Error('not authorized')
        err.data = { content: 'Please retry later' } // additional details
        err.code = 401
        return next(err)
      }
    }
  } catch (err) {
    console.log('Error when authenticate: ', err)
    await TokenRepo.remove(null, token)
    const error = new Error('not authorized')
    error.data = { content: 'Please retry later' } // additional details
    error.code = 401
    return next(err)
  }
}
