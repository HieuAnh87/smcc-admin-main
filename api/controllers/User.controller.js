import * as UserRepo from "../repositories/User.repo.js"
import * as TokenRepo from "../repositories/Token.repo.js"
import * as NotificationSettingRepo from "../repositories/NotificationSetting.repo.js"
import {Response, PagedResponse} from "../util/Response.js"
import {normalizePaging} from "../util/Paging.js"
import * as constants from "../config/constants.js"
import * as messages from "../config/messages.js"
import config from "../config/keys.config.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const {jwtSecret, accessTokenExpires} = config

export const getUsers = async (req, res, next) => {
  try {
    const {page, from, pageSize} = normalizePaging(req.query.page, req.query.pageSize)
    const result = await UserRepo.findAll(
      req.query.name || null,
      req.query.email || null,
      req.query.role || null,
      req.query.workTime || null,
      req.query.lock === "true" ? true : req.query.lock === "false" ? false : null,
      req.query.fromDate || null,
      req.query.toDate || null,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc === "true" ? constants.ORDER_BY_DESC : constants.DEFAULT_ORDER_BY_TYPE,
    )

    res.json(
      new PagedResponse({
        code: 200,
        page: page,
        pageSize: pageSize,
        total: result.total,
        docs: result.docs,
      }),
    )
  } catch (err) {
    req.log.error(messages.ERROR_GET_ALL_USERS)
    next(err)
  }
}

export const getUserByIdOrToken = async (req, res, next) => {
  try {
    let user = null

    if (req.params.value.split("-").length == 5) {
      user = await UserRepo.findById(req.params.value)
    } else {
      const decode = jwt.verify(req.params.value, jwtSecret)

      user = await UserRepo.findById(decode.id)
    }
    res.json(
      new Response({
        code: 200,
        doc: user,
      }),
    )
  } catch (err) {
    req.log.error(messages.ERROR_GET_USER)
    next(err)
  }
}

export const addUser = async (req, res, next) => {
  try {
    await bcrypt.hash(req.body.password, 9).then((hash) => {
      req.body.password = hash
    })

    const user = await UserRepo.add(req.body)
    if (user) {
      // Add default notification setting
      await NotificationSettingRepo.add({userId: user[0].id, email: user[0].email})

      res.json(
        new Response({
          code: 200,
          doc: user,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 500,
          message: messages.CREATE_USER_FAIL,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_USER)
    next(err)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    if (req.body.password) {
      await bcrypt.hash(req.body.password, 9).then((hash) => {
        req.body.password = hash
      })
    }
    const user = await UserRepo.update(req.params.id, req.body)

    if (!user) {
      res.json(
        new Response({
          code: 404,
          message: messages.USER_NOT_FOUND,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 200,
          doc: user,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_USER)
    next(err)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    await TokenRepo.remove(req.params.id, null)
    const user = await UserRepo.remove(req.params.id)
    if (user) {
      res.json(
        new Response({
          code: 200,
          doc: user,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.USER_NOT_FOUND,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_USER)
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const {email, password} = req.body
    const result = await UserRepo.findAll(
      null,
      email,
      null,
      null,
      false,
      null,
      null,
      0,
      1,
      constants.DEFAULT_ORDER_BY_ATR,
      constants.DEFAULT_ORDER_BY_TYPE,
    )

    const user = result.docs[0]
    const compareResult = await bcrypt.compare(password, user.password)
    if (user && compareResult) {
      const accessToken = jwt.sign({id: user.id}, jwtSecret, {
        expiresIn: accessTokenExpires,
      })

      const token = await TokenRepo.add({
        userId: user.id,
        accessToken: accessToken,
      })

      if (token) {
        return res.json(
          new Response({
            code: 200,
            doc: {token: accessToken, user: user},
          }),
        )
      }
    }

    return res.status(401).json(
      new Response({
        code: 401,
        message: messages.LOGIN_FAIL,
      }),
    )
  } catch (err) {
    req.log.error(messages.LOGIN_FAIL)
    console.log(err)
    next(err)
  }
}

export const logout = async (req, res, next) => {
  try {
    const token = await TokenRepo.remove(null, req.headers.authorization.split(" ")[1])

    if (token) {
      return res.json(
        new Response({
          code: 200,
          message: messages.LOGOUT_SUCCESS,
        }),
      )
    }

    res.json(
      new Response({
        code: 500,
        message: messages.LOGOUT_FAIL,
      }),
    )
  } catch (err) {
    next(err)
  }
}

export const authenticate =
  (roles = []) =>
  async (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1]
    try {
      const decode = jwt.verify(token, jwtSecret)

      if (decode && decode.exp > Math.floor(Date.now() / 1000)) {
        const user = await UserRepo.findById(decode.id)
        const tokenInfo = await TokenRepo.findByAccesstoken(token)

        if (user && tokenInfo.userId === user.id && roles.length == 0) {
          req.userId = user.id
          next()
        } else if (user && tokenInfo.userId === user.id && roles.length > 0) {
          if (roles.some((r) => user.roles.indexOf(r) > -1)) {
            req.userId = user.id
            next()
          } else {
            return res.status(403).json(
              new Response({
                code: 403,
                message: messages.FORBIDDEN,
              }),
            )
          }
        }
      } else {
        await TokenRepo.remove(null, token)
        return res.status(401).json(
          new Response({
            code: 401,
            message: messages.UNAUTHORIZED,
          }),
        )
      }
    } catch (err) {
      await TokenRepo.remove(null, token)
      res.status(401).json(
        new Response({
          code: 401,
          message: messages.UNAUTHORIZED,
        }),
      )
    }
  }
