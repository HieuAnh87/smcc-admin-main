import express from 'express'

const router = express.Router()
import {
  getContents,
  getContent,
  getTotalSourceHaveNewContent,
  getOutstanding,
  updateContent,
  updateMultilContent,
  deleteContent,
  getStatisticsContentForMonth,
  getStatisticsContentForMonthPerSource,
  getStatisticsContentForMonthPerTopic,
  getStatistics,
  getStatBySource,
  getStatByTopic,
  getStatByCategory
} from '../controllers/Content.controller.js'
import { authenticate } from '../controllers/User.controller.js'

//router.get('/', authenticate(), getContents)
router.get('/', getContents)
router.get('/totalSource/dashboard', authenticate(), getTotalSourceHaveNewContent)
router.get('/outstanding', authenticate(), getOutstanding)
router.get('/:id', getContent)
router.get('/statistics/monthly', getStatisticsContentForMonth)
router.get('/statistics/monthly/all', getStatistics)
router.get('/statistics/source', getStatBySource)
router.get('/statistics/topic', getStatByTopic)
router.get('/statistics/category', getStatByCategory)
router.get('/statistics/monlyForSources', getStatisticsContentForMonthPerSource)
router.put('/:id', authenticate(), updateContent)
router.put('/', authenticate(), updateMultilContent)
router.delete('/:id', authenticate(), deleteContent)

export default router
