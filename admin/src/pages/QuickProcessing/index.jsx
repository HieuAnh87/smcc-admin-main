import moment from "moment"

import React, { useEffect, useState } from "react"
import { useMutation, useQuery } from "react-query"
import { getAllPosts, getSimilarPosts } from "../../service/postAPI"
import { getAllSources } from "../../service/sourceAPI"
import { getAllTopics } from "../../service/topicAPI"
import { getAllTotalContentOfMonth } from '../../service/contentWordpressAPI'
import socket from "../../service/socket.js"
import { createHistory } from "../../service/historyAPI"
import { useSelector } from "react-redux"
// import Statistical from "./Statistical"
// import ChartDisplay from '../Statistic/index'
import DashboardTable from "./DashboardTable/DashboardTable"
import { makeQueryString } from "../../core/helper"
import axios from "axios"
export const FollowTagId = "878aa7a3-8691-49b9-8018-2159a8b55175"
export const size = 10
export const ActionsType = {
  cancelHandle: "cancelHandle",
  handlePost: "handlePost",
}
export const PostType = {
  postedAt: "postedAt",
  totalReactions: "totalReactions",
  follow: "follow",
}
export const SourceType = {
  all: "all",
  facebook: "facebook",
  website: "website",
  youtube: "youtube",
}
const keyTotalTopic = `${process.env.REACT_APP_API_URL}/topic?page=1&pageSize=1`
const keyTotalPostFollow = `${process.env.REACT_APP_API_URL}/content?page=1&pageSize=1`
const keyTotalTodayTopic = `${process.env.REACT_APP_API_URL}/topic?page=1&pageSize=0&updatedAt=${moment()
  .startOf("day")
  .toISOString()}`
const keyTotalContentToday = `${process.env.REACT_APP_API_URL}/content?page=1&pageSize=1&fromDate=${moment()
  .startOf("day")
  .toISOString()}&toDate=${moment().endOf("day").toISOString()}`
const keyTotalFBFollow = `${process.env.REACT_APP_API_URL}/source?page=1&pageSize=0&type=FB_PAGE`
const keyTotalToday = `${process.env.REACT_APP_API_URL}/content/totalSource/dashboard`
const keyTotalWebFollow = `${process.env.REACT_APP_API_URL}/source?page=1&pageSize=0&type=WEBSITE`
const keySimilarPost = `${process.env.REACT_APP_API_URL}/content/outstanding`
const keyTotalContentPerDay = `${process.env.REACT_APP_API_URL}/content/statistics/monthly`
const defaultParams = {
  page: 0,
  total: 0,
  first: 0,
  desc: true,
  pageSize: size,
  userHandle: "notHandle",
}

const makeQuery = (params) => {
  const query = {
    ...params,
  }
  delete query.total
  delete query.first
  return makeQueryString({
    ...query,
    page: params.page + 1,
  })
}

const QuickProcess = (props) => {
  const token = useSelector((state) => state.user.token)
  const [lineOptions, setLineOptions] = useState(null)
  const [type, setType] = useState(PostType.postedAt)
  const [source, setSource] = useState(SourceType.all)
  const [params, setParams] = useState({
    ...defaultParams,
    sortBy: PostType.postedAt,
    // type: "FB_POST,WEBSITE_POST,YOUTUBE",
    toDate: new Date().toISOString(),
  })
  const totalTopic = useQuery(keyTotalTopic, (query) => getAllTopics({ query, token }))
  const totalContentPerDay = useQuery(keyTotalContentPerDay, (query) => getAllTotalContentOfMonth({ query, token }))
  const totalPostFollow = useQuery(keyTotalPostFollow, (query) => getAllTopics({ query, token }))
  const totalTodayTopic = useQuery(keyTotalTodayTopic, (query) => getAllTopics({ query, token }))
  const totalContentToday = useQuery(keyTotalContentToday, (query) => getAllPosts({ query, token }))
  const totalFBFollow = useQuery(keyTotalFBFollow, (query) => getAllSources({ query, token }))
  const totalPostToday = useQuery(keyTotalToday, (query) => getAllPosts({ query, token }))
  const totalWebFollow = useQuery(keyTotalWebFollow, (query) => getAllSources({ query, token }))

  // const similarPost = useQuery(keySimilarPost, (query) => getSimilarPosts(query, token))
  const keyPosts = `${process.env.REACT_APP_API_URL}/content?${makeQuery(params)}`

  let posts = useQuery(keyPosts, (query) => getAllPosts({ query, token }))
  const [selectedCluster, setSelectedCluster] = useState(" ");
  const [clusterContent, setClusterContent] = useState();

  const applyLightTheme = () => {
    const lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#495057",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
        y: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
      },
    }
    setLineOptions(lineOptions)
  }

  const applyDarkTheme = () => {
    const lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#ebedef",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#ebedef",
          },
          grid: {
            color: "rgba(160, 167, 181, .3)",
          },
        },
        y: {
          ticks: {
            color: "#ebedef",
          },
          grid: {
            color: "rgba(160, 167, 181, .3)",
          },
        },
      },
    }

    setLineOptions(lineOptions)
  }
  const handleChangeType = (type) => {
    setType(type)
    switch (type) {
      case PostType.postedAt:
        setParams({
          ...params,
          sortBy: PostType.postedAt,
        })
        break
      case PostType.follow:
        // setParams({
        //   ...params,
        //   tagIds: FollowTagId,
        // })
        break
      case PostType.totalReactions:
        setParams({
          ...params,
          sortBy: PostType.totalReactions,
          fromDate: moment().startOf("day").toISOString(),
          toDate: moment().endOf("day").toISOString(),
        })
        break
    }
  }
  const handleChangeSource = (source) => {
    setSource(source)
    const cloneParams = { ...params }
    switch (source) {
      case "all":
        delete cloneParams.type
        setParams(cloneParams)
        break
      case "facebook":
        setParams({
          ...params,
          type: "FB_POST",
        })
        break
      case "website":
        setParams({
          ...params,
          type: "WEBSITE_POST",
        })
        break
      case "youtube":
        setParams({
          ...params,
          type: "YOUTUBE",
        })
        break
      case null:
        delete cloneParams.type
        setParams(cloneParams)
        break
    }
  }

  const handlePageChange = (e) => {
    console.log("e", e)
    if (typeof e === "string") {
      if (e.length > 0) {
        setParams({
          ...params,
          search: e,
        })
      } else {
        let cloneParams = { ...params }
        delete cloneParams.search
        setParams(cloneParams)
      }
    } else if (e?.filters) {
      let filter
      if (e.filters?.tagIds) {
        const filterValue = e.filters.tagIds?.value
        if (filterValue) {
          filter = { tagIds: filterValue }
          setParams({
            ...params,
            ...(e?.page && { page: e.page }),
            ...(e?.first && { first: e.first }),
            ...filter,
          })
        } else {
          const cloneParams = { ...params }
          delete cloneParams.tagIds
          setParams({
            ...cloneParams,
            ...(e?.page && { page: e.page }),
            ...(e?.first && { first: e.first }),
          })
        }
      }
    } else {
      setParams({
        ...params,
        page: e.page,
        first: e.first,
      })
    }
  }
  useEffect(() => {
    socket.on("update_dashboard", (data) => {
      // totalTopic.refetch();
      totalPostFollow.refetch()
      totalContentToday.refetch()
      totalContentPerDay.refetch()
      posts.refetch()
      if (data?.type === "FB_POST") {
        totalFBFollow.refetch()
        totalPostToday.refetch()
      } else {
        totalWebFollow.refetch()
        totalPostToday.refetch()
      }
    })
  }, [posts, totalContentToday, totalFBFollow, totalPostToday, totalPostFollow, totalWebFollow, totalContentPerDay])

  useEffect(() => {
    if (props.colorMode === "light") {
      applyLightTheme()
    } else {
      applyDarkTheme()
    }
  }, [props.colorMode])
  const addHistory = useMutation(createHistory, {
    onError: (e) => {
      console.log(e)
    },
  })
  useEffect(() => {
    addHistory.mutate({ newData: { screen: "Dashboard", description: "Xem danh dashboard" }, token })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  console.log(totalContentPerDay)
  return (
    <div className="grid">
      <DashboardTable
        dataList={posts}
        handleChangeType={handleChangeType}
        handleChangeSource={handleChangeSource}
        type={type}
        source={source}
        handlePageChange={handlePageChange}
        params={params}
      />
    </div>
  )
}

export default React.memo(QuickProcess)
