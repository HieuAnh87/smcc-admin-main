import * as TopicRepo from '../repositories/Topic.repo.js'
import * as ContentRepo from '../repositories/Content.repo.js'
import {Response, PagedResponse} from '../util/Response.js'
import {normalizePaging} from '../util/Paging.js'
import * as constants from '../config/constants.js'
import * as messages from '../config/messages.js'

export const getTopics = async (req, res, next) => {
  try {
    const {page, from, pageSize} = normalizePaging(req.query.page, req.query.pageSize)
    const result = await TopicRepo.findAll(
      req.query,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc === 'true' ? constants.ORDER_BY_DESC : constants.DEFAULT_ORDER_BY_TYPE,
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
    console.log('Error when getTopics', err)
    req.log.error(messages.ERROR_GET_ALL_TOPICS)
    next(err)
  }
}

export const addTopic = async (req, res, next) => {
  try {
    for (const k of req.body.keywords) {
      // Normalize keywords and remove duplicate
      k.keywords = k.keywords
        .toLowerCase()
        .split(' ')
        .map((c) => c.trim())
        .filter((c) => c !== '')
        .join(' ')
    }

    const topic = await TopicRepo.add(req.body)
    if (topic) {
      res.json(
        new Response({
          code: 200,
          doc: topic,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 500,
          message: messages.CREATE_TOPIC_FAIL,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_TOPIC)
    next(err)
  }
}

export const updateTopic = async (req, res, next) => {
  try {
    for (const k of req.body.keywords) {
      // Normalize keywords and remove duplicate
      k.keywords = k.keywords
        .toLowerCase()
        .split(' ')
        .map((c) => c.trim())
        .filter((c) => c !== '')
        .join(' ')
    }

    const topic = await TopicRepo.update(req.params.id, req.body)

    if (!topic) {
      res.json(
        new Response({
          code: 404,
          message: messages.TOPIC_NOT_FOUND,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 200,
          doc: topic,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_TOPIC)
    next(err)
  }
}

export const deleteTopic = async (req, res, next) => {
  try {
    const topic = await TopicRepo.remove(req.params.id)
    if (topic) {
      // Get contents in deleted topic to update
      // const result = await ContentRepo.findAll(null, topic.id, null, null, null, null, null, null, 0, 100000, constants.DEFAULT_ORDER_BY_ATR, constants.DEFAULT_ORDER_BY_TYPE);
      // const contents = result.docs;

      // if (contents && contents.length) {
      //   for (let content of contents) {
      //     if (content.topicsInfo.length == 1) {
      //       // Delete content which only in this topic
      //       await ContentRepo.remove(content.id);
      //     } else {
      //       // Update topicIds attribute of content
      //       const topicsInfo = content.topicsInfo.filter((t) => t.id !== topic.id);
      //       const topicIds = topicsInfo.map((t) => t.id);
      //       await ContentRepo.update(content.id, { topicIds, process: content.process, editedTextContent: content.editedTextContent, tagIds: content.tagIds });
      //     }
      //   }
      // }
      res.json(
        new Response({
          code: 200,
          doc: topic,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.TOPIC_NOT_FOUND,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_TOPIC)
    next(err)
  }
}
