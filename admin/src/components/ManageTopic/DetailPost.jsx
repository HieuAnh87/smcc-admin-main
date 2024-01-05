import {Avatar} from "primereact/avatar"
import React, {useEffect, useState} from "react"
import "./DetailPost.css"
import {useHistory, useLocation} from "react-router-dom"

import imageInvalid from "../../assets/images/invalid.jpg"
import {AutoComplete} from "primereact/autocomplete"
import {InputTextarea} from "primereact/inputtextarea"
import {createTag, getAllTags} from "../../service/tagAPI"
import {useMutation, useQuery, useQueryClient} from "react-query"

import {removePost, updatePost} from "../../service/postAPI"
import {createProfile, getAllProfiles, updateProfile} from "../../service/profileAPI"
import axios from "axios"
import {createHistory} from "../../service/historyAPI"
import {Image} from "primereact/image"
import {Toast} from "primereact/toast"
import {useDispatch, useSelector} from "react-redux"
import {clearQueryStr} from "../../store/queryStore"
import ReactHtmlParser from "react-html-parser"
import {Dropdown} from "primereact/dropdown"
import {Button} from "primereact/button"
import {ConfirmPopup} from "primereact/confirmpopup" // To use <ConfirmPopup> tag
import {confirmPopup} from "primereact/confirmpopup" // To use confirmPopup method
DetailPost.propTypes = {}

function DetailPost({data, toast, closeDialog}) {
  let cateName = "Du lịch"
  if (data.category == "SPAM") {
    cateName = "SPAM"
  } else if (data.category == "AGENCY") {
    cateName = "AGENCY"
  } else if (data.category == "SHARING") {
    cateName = "SHARING"
  } else if (data.category == "POTENTIAL") {
    cateName = "POTENTIAL"
  }
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const [desc, setDesc] = useState(data?.editedTextContent || "")
  const [title, setTitle] = useState(data?.title || "")
  const [violationcontent, setViolationcontent] = useState(data?.violationContent || "")
  const [violationenactment, setViolationenactment] = useState(data?.violationEnactment || "")
  const [contentCategory, setContentCategory] = useState({
    name: cateName,
    code: data.category,
  })
  const [violationTimes, setViolationTimes] = useState(data?.violationTimes || "")
  const [edit, setEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(false)

  const [editViolationContent, setEditViolationContent] = useState(false)
  const [editViolationenactment, setEditViolationenactment] = useState(false)
  const [editViolationTimes, setEditViolationTimes] = useState(false)

  const [keywords, setKeywords] = useState("")
  const category = [
    {name: "SPAM", code: "SPAM"},
    {name: "AGENCY", code: "AGENCY"},
    {name: "SHARING", code: "SHARING"},
    {name: "POTENTIAL", code: "POTENTIAL"},
  ]

  const [arrayTags, setArrayTags] = useState(
    [
      ...data?.tagsInfo?.map((p) => ({
        label: p.name,
        value: p.id,
      })),
    ] || [],
  )
  const [filterTags, setFilterTags] = useState([])
  const [keywordsProfile, setKeywordsProfile] = useState("")
  const [arrayProfiles, setArrayProfiles] = useState(
    [
      ...data?.profilesInfo?.map((p) => ({
        label: p.name,
        value: p.id,
      })),
    ] || [],
  )
  const [filterProfiles, setFilterProfiles] = useState([])
  const history = useHistory()
  const location = useLocation()
  const token = useSelector((state) => state.user.token)
  const userId = useSelector((state) => state.user.userData.id)

  const handleError = (err) => {
    if (err?.response?.data?.msg) {
      toast.current.show({severity: "error", summary: err.response.data.msg, detail: "Lỗi"})
      throw new Error(err.response.data.msg)
    } else if (err?.message) {
      toast.current.show({severity: "error", summary: err.message, detail: "Lỗi"})
      throw new Error(err.message)
    } else {
      toast.current.show({severity: "error", summary: err, detail: "Lỗi"})
    }
  }
  const updateStatus = useMutation(updatePost, {
    onSuccess: () => {
      toast.current.show({severity: "success", summary: "Cập nhật bài viết thành công", detail: "Thành công"})
    },
    onError: (error) => {
      handleError(error)
    },
    onSettled: () => {
      closeDialog()
      //   setDisplayDialog(false)
      history.push({
        pathname: location.pathname,
        search: ``,
      })
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/content`)
        },
      })
    },
  })
  const handlePost = (val) => {
    if (val === "cancelHandle") {
      updateStatus.mutate({
        id: data?.id,
        newData: {
          userHandle: "skippedPost",
          process: false,
        },
        token,
      })
    } else if (val === "handle") {
      updateStatus.mutate({
        id: data?.id,
        newData: {
          userHandle: "handledPost",
          process: true,
          violationEnactment:
            "Vi phạm điểm a, d, e khoản 1, Điều 5 Nghị định 72/2013/NĐ-CP ngày 15/7/2013 của Chính phủ về quản lý, cung cấp, sử dụng dịch vụ Internet và thông tin trên mạng.",
        },
        token,
      })
    }
  }
  const key = `${process.env.REACT_APP_API_URL}/tag?page=1&pageSize=12&name=${keywords}`
  const tags = useQuery(key, (query) => getAllTags(query, token), {
    onSuccess: (data) => {
      if (data)
        setFilterTags([
          ...data?.docs.map((p) => ({
            value: p.id,
            label: p.name,
          })),
        ])
    },
  })
  const keyProfile = `${process.env.REACT_APP_API_URL}/profile?page=1&pageSize=12&name=${keywordsProfile}`
  const profiles = useQuery(keyProfile, (query) => getAllProfiles(query, token), {
    onSuccess: (data) => {
      if (data)
        setFilterProfiles([
          ...data?.docs.map((p) => ({
            value: p.id,
            label: p.name,
          })),
        ])
    },
  })
  const addHistory = useMutation(createHistory, {
    onError: (e) => {
      console.log(e)
    },
  })
  const createTagFromContent = useMutation(createTag, {
    onError: (error) => handleError(error),
    onSuccess: (newData) => {
      let arrayTagsFormat = arrayTags.map((p) => p.value)
      arrayTagsFormat.push(newData?.doc?.id)
      updateContentMutation.mutate({
        id: data.id,
        newData: {tagIds: arrayTagsFormat},
        token,
      })
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/tag`)
        },
      })
    },
  })
  const createProfileFromContent = useMutation(createProfile, {
    onError: (error) => handleError(error),
    onSuccess: (newData) => {
      setArrayProfiles([
        ...arrayProfiles,
        {
          label: newData?.doc?.name,
          value: newData?.doc?.id,
        },
      ])
      const arrayProfilesFormat = arrayProfiles.map((p) => p.value)

      updateContentMutation.mutate({
        id: data.id,
        newData: {profileIds: [...arrayProfilesFormat, newData?.doc?.id]},
        token,
      })
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/tag`)
        },
      })
    },
  })
  const updateContentMutation = useMutation(updatePost, {
    onSuccess: (updateData) => {
      toast.current.show({severity: "success", summary: "Cập nhật thành công", detail: "Thành công"})

      addHistory.mutate({
        newData: {
          screen: "Bài viết",
          description: `Cập nhật bài viết id: ${updateData?.doc?.id} từ: {title: ${data?.title || ""},  userHandle: ${
            data?.userHandle
          },editedTextContent : ${data?.editedTextContent} , profileids: [${
            data?.profilesInfo?.map((p) => p?.id).join(", ") || ""
          }], tagids: [${data?.tagsInfo?.map((p) => p?.id)?.join(", ") || ""}], violationContent: ${
            data?.violationContent
          }, violationEnactment: ${data?.violationEnactment}, title: ${data?.title}} sang: { title: ${
            updateData?.doc?.title || ""
          }, userHandle: ${updateData?.doc?.userHandle},editedTextContent : ${
            updateData?.doc?.editedTextContent
          } , profileids: [${updateData?.doc?.profileIds.join(", ") || ""}], tagids: [${
            updateData?.doc?.tagIds.join(", ") || ""
          }], violationContent: ${updateData?.doc?.violationContent}, violationEnactment: ${
            updateData?.doc?.violationEnactment
          }, title: ${updateData?.doc?.title} }`,
        },
        token,
      })
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/content`)
        },
      })
    },
  })
  const deleteContent = useMutation(removePost, {
    onSuccess: (updateData) => {
      toast.current.show({severity: "success", summary: "Xóa bài viết thành công", detail: "Thành công"})
      closeDialog()
      console.log("updateData", updateData)
      console.log("data", data)
      addHistory.mutate({
        newData: {
          screen: "Bài viết",
          description: `Bỏ qua bài viết id: ${updateData?.doc[0]?.id} từ: {title: ${
            data?.title || ""
          }, editedTextContent : ${data?.editedTextContent} , profileids: [${
            data?.profilesInfo?.map((p) => p?.id).join(", ") || ""
          }], tagids: [${data?.tagsInfo?.map((p) => p?.id).join(", ") || ""}], violationContent: ${
            data?.violationContent
          }, violationEnactment: ${data?.violationEnactment}}`,
        },
        token,
      })
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/content`)
        },
      })
    },
  })
  const updateProfileFromContent = useMutation(updateProfile, {
    onError: (error) => handleError(error),
  })
  const searchTags = (event) => {
    let timeout
    let query = event.query

    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => {
      setKeywords(query)
    }, 300)
  }
  const enterNoExit = (e) => {
    if (e.charCode == 13 && filterTags.length == 0 && e.target.value.trim()) {
      setArrayTags([
        ...arrayTags,
        {
          label: e.target.value,
          value: e.target.value,
        },
      ])
      createTagFromContent.mutate({newData: {name: e.target.value}, token})
      e.target.value = ""
    }
  }
  const unSelectTag = (e) => {
    const newArrayTags = arrayTags.filter((p) => p.value !== e.value.value)
    setArrayTags(newArrayTags)
    const arrayTagsFormat = newArrayTags.map((p) => p.value)
    let updateData = {tagIds: arrayTagsFormat}
    if (e.value.value === "878aa7a3-8691-49b9-8018-2159a8b55175") {
      updateData.meta = null
    }
    updateContentMutation.mutate({
      id: data.id,
      newData: updateData,
      token,
    })
  }
  const selectTag = (e) => {
    if (!arrayTags.find((p) => p.value.trim() === e?.value?.value?.trim())) {
      const newArrayTags = [...arrayTags, e.value]
      setArrayTags(newArrayTags)
      const arrayTagsFormat = newArrayTags.map((p) => p.value)
      let updateData = {tagIds: arrayTagsFormat}
      if (e.value.value === "878aa7a3-8691-49b9-8018-2159a8b55175") {
        updateData.meta = 100
      }

      updateContentMutation.mutate({
        id: data.id,
        newData: updateData,
        token,
      })
    }
  }
  const searchProfiles = (event) => {
    let timeout
    let query = event.query

    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => {
      setKeywordsProfile(query)
    }, 300)
  }
  const enterNoExitProfiles = (e) => {
    if (e.charCode == 13 && filterProfiles.length == 0 && e.target.value.trim()) {
      setArrayProfiles([
        ...arrayProfiles,
        {
          label: e.target.value,
          value: e.target.value,
        },
      ])
      createProfileFromContent.mutate({newData: {name: e.target.value}, token})
      e.target.value = ""
    }
  }
  const removeContentFromProfile = async (idSource, idProfile) => {
    const detailProfile = await axios.get(`${process.env.REACT_APP_API_URL}/profile/${idProfile}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    let sourceIds = detailProfile.data.doc.sourceIds || []
    let authorIds = detailProfile.data.doc.authorIds || []
    let contentIds = detailProfile.data.doc.contentIds || []
    let name = detailProfile.data.doc.name
    let description = detailProfile.data.doc.description

    if (contentIds && contentIds.length) {
      contentIds = contentIds.filter((p) => p != idSource)
    }
    updateProfileFromContent.mutate({
      id: idProfile,
      newData: {sourceIds, authorIds, contentIds, name, description},
      token,
    })
  }
  const addContentFromProfile = async (idContent, idProfile) => {
    const detailProfile = await axios.get(`${process.env.REACT_APP_API_URL}/profile/${idProfile}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    let sourceIds = detailProfile.data.doc.sourceIds || []
    let authorIds = detailProfile.data.doc.authorIds || []
    let contentIds = detailProfile.data.doc.contentIds || []
    let name = detailProfile.data.doc.name
    let description = detailProfile.data.doc.description

    contentIds.push(idContent)
    updateProfileFromContent.mutate({
      id: idProfile,
      newData: {sourceIds, authorIds, contentIds, name, description},
      token,
    })
  }
  const unSelectProfile = (e) => {
    const newArrayProfiles = arrayProfiles.filter((p) => p.value != e.value.value)
    setArrayProfiles(newArrayProfiles)
    const arrayProfilesFormat = newArrayProfiles.map((p) => p.value)
    removeContentFromProfile(data?.id, e?.value?.value)
    updateContentMutation.mutate({
      id: data.id,
      newData: {
        userHandle: data?.userHandle,
        tagIds: arrayTags.map((p) => p.value),
        profileIds: arrayProfilesFormat,
        editedTextContent: data?.editedTextContent,
        violationContent: data?.violationContent,
        violationEnactment: data?.violationEnactment,
        title: data?.title,
        meta: data?.meta,
      },
      token,
    })
  }
  const selectProfile = (e) => {
    if (!arrayProfiles.find((p) => p.value.trim() === e?.value?.value?.trim())) {
      const newArrayProfiles = [...arrayProfiles, e.value]

      setArrayProfiles(newArrayProfiles)
      const arrayProfilesFormat = newArrayProfiles.map((p) => p.value)

      addContentFromProfile(data?.id, e?.value?.value)
      updateContentMutation.mutate({
        id: data.id,
        newData: {profileIds: arrayProfilesFormat},
        token,
      })
    }
  }
  const updateEditContext = () => {
    setEdit(false)
    updateContentMutation.mutate({
      id: data.id,
      newData: {editedTextContent: desc},
      token,
    })
  }
  const updateViolationContent = () => {
    setEditViolationContent(false)
    updateContentMutation.mutate({
      id: data.id,
      newData: {violationContent: violationcontent},
      token,
    })
  }
  const updateViolationenactment = () => {
    setEditViolationenactment(false)
    updateContentMutation.mutate({
      id: data.id,
      newData: {violationEnactment: violationenactment},
      token,
    })
  }
  const updateViolationTimes = () => {
    setEditViolationTimes(false)
    updateContentMutation.mutate({
      id: data.id,
      newData: {violationTimes: violationTimes},
      token,
    })
  }
  const updateContentCategory = (value) => {
    updateContentMutation.mutate({
      id: data.id,
      newData: {category: value.code},
      token,
    })
    setContentCategory(value)
    console.log(value)
  }

  const updateEditTitle = () => {
    setEditTitle(false)
    updateContentMutation.mutate({
      id: data.id,
      newData: {title: title},
      token,
    })
  }

  useEffect(() => {
    if (data) {
      addHistory.mutate({
        newData: {
          screen: "Bài viết",
          description: `Xem hoặc update chi tiết bài viết id: ${data?.id} từ: {title: ${
            data?.title || ""
          },userHandle: ${data?.userHandle},editedTextContent : ${data?.editedTextContent} , profileids: [${
            data?.profilesInfo?.map((p) => p?.id).join(", ") || ""
          }], tagids: [${data?.tagsInfo?.map((p) => p?.id).join(", ") || ""}], violationContent: ${
            data?.violationContent
          }, violationEnactment: ${data?.violationEnactment}}`,
        },
        token,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const setEmpty = () => {
    setArrayProfiles([])
    setArrayTags([])
    setDesc("")
    setViolationcontent("")
    setViolationenactment("")
    setTitle("")
  }
  const acceptFunc = async () => {
    deleteContent.mutate({
      id: data.id,
      token,
    })
  }
  const rejectFunc = () => {}
  const confirm = (event) => {
    const myConfirm = confirmPopup({
      target: event.currentTarget,
      message: "Bạn xác nhận muốn bỏ qua bài viết?",
      icon: "pi pi-exclamation-triangle",
      accept: () => acceptFunc(),
      reject: () => rejectFunc(),
    })

    setTimeout(() => {
      myConfirm.hide()

      setTimeout(() => {
        myConfirm.show()
      }, 1000)
    }, 500)
  }
  return (
    <>
      <div className="xl:flex-row xl:flex-nowrap flex flex-column justify-content-end gap-4 relative">
        <div className="xl:w-7 xl:pl-4 h-32rem xl:overflow-y-scroll" id="style-4">
          {/* <div className="flex align-items-center gap-2 mb-3">
            {data?.authorInfo?.name && (
              <>
                <Avatar image={data?.authorInfo?.avatar} className="mr-2" size="xlarge" shape="circle" />
                <div>
                  <div className="font-bold">{data?.authorInfo?.name}</div>
                </div>
              </>
            )}
          </div> */}
          <div className="mb-5">
            {data?.renderedContent ? (
              <div dangerouslySetInnerHTML={{__html: data.renderedContent}} />
            ) : (
              data?.textContent
            )}
          </div>
          <div className="flex flex-column align-items-center gap-2">
            {data?.imageContents && data?.imageContents?.length
              ? data?.imageContents?.map((image, i) => (
                  <React.Fragment>
                    <img
                      className="w-full h-full"
                      src={image ? image : imageInvalid}
                      onError={(e) => (e.target.src = imageInvalid)}
                      alt=""
                    />
                  </React.Fragment>
                ))
              : ""}
          </div>
          <div className="flex flex-column align-items-center gap-2">
            {data?.videoContents && data?.videoContents?.length
              ? data?.videoContents?.map((video, i) => (
                  <React.Fragment>
                    <video controls className="w-full">
                      <source src={video} type="video/mp4" />
                    </video>
                  </React.Fragment>
                ))
              : ""}
          </div>
          <hr className="my-2" />
          <div className="flex justify-content-between">
            <div className="flex" style={{gap: "30px"}}>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {data.views}</span>{" "}
                <i className="pi pi-eye" style={{color: "blue"}}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {data.likes}</span>{" "}
                <i className="pi pi-thumbs-up" style={{color: "blue"}}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {data.commentCount}</span>{" "}
                <i className="pi pi-comments" style={{color: "#a89b32"}}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {data.shares}</span>{" "}
                <i
                  className="pi pi-share-alt
"
                ></i>
              </div>
            </div>
          </div>
          <hr className="my-2" />
          {data?.topicsInfo && data?.topicsInfo.length ? (
            <div className="gap-2 flex flex-wrap">
              {data?.topicsInfo?.map((topic, i) => (
                <span
                  key={i}
                  onClick={() => {
                    history.push({
                      pathname: "/bai-viet",
                      search: `?topicId=${topic.id}`,
                    })
                    dispatch(clearQueryStr())
                  }}
                  className="product-badge status-new inline-block cursor-pointer"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          ) : (
            ""
          )}
          <hr />
          <div className="flex flex-wrap" style={{rowGap: "15px"}}>
            {data.commentInfos && data.commentInfos.length
              ? data.commentInfos.map((comment, index) => (
                  <div className="flex" style={{columnGap: "15px"}} key={index}>
                    <img className="w-4rem h-4rem border-circle" src={comment?.authorId?.avatar} alt="" />
                    <p className="inline-block">{comment?.textContent}</p>
                  </div>
                ))
              : ""}
          </div>
        </div>
        <div className="xl:w-5 h-32rem overflow-y-scroll">
          <div className="mb-2 mr-2">
            <h5>Tiêu đề</h5>
            <div className="relative ">
              {editTitle ? (
                <i className="pi pi-check absolute top--5" onClick={() => updateEditTitle()}></i>
              ) : (
                <i className="pi pi-pencil absolute top--5" onClick={() => setEditTitle(true)}></i>
              )}
              {editTitle ? (
                <InputTextarea className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
              ) : (
                <p className="border-400 border-round border-round-md border-1 pb-4 pt-2 px-2">{title}</p>
              )}
            </div>
          </div>
          <div className="mb-2  mr-2">
            <h5>Tóm tắt</h5>
            <div className="relative ">
              {edit ? (
                <i className="pi pi-check absolute top--5" onClick={() => updateEditContext()}></i>
              ) : (
                <i className="pi pi-pencil absolute top--5" onClick={() => setEdit(true)}></i>
              )}
              {edit ? (
                <InputTextarea autoResize className="w-full" value={desc} onChange={(e) => setDesc(e.target.value)} />
              ) : (
                <p className="border-400 border-round border-round-md border-1 pb-4 pt-2 px-2">{desc}</p>
              )}
            </div>
          </div>
          {/* <div className="mb-2  mr-2">
            <h5>Nội dung vi phạm</h5>
            <div className="relative ">
              {editViolationContent ? (
                <i className="pi pi-check absolute top--5" onClick={() => updateViolationContent()}></i>
              ) : (
                <i className="pi pi-pencil absolute top--5" onClick={() => setEditViolationContent(true)}></i>
              )}

              {editViolationContent ? (
                <InputTextarea
                  autoResize
                  className="w-full"
                  value={violationcontent}
                  onChange={(e) => setViolationcontent(e.target.value)}
                />
              ) : (
                <p className="border-400 border-round border-round-md border-1 pb-4 pt-2 px-2">{violationcontent}</p>
              )}
            </div>
          </div> */}
          {/* <div className="mb-2  mr-2">
            <h5>Điều khoản vi phạm</h5>
            <div className="relative ">
              {editViolationenactment ? (
                <i className="pi pi-check absolute top--5" onClick={() => updateViolationenactment()}></i>
              ) : (
                <i className="pi pi-pencil absolute top--5" onClick={() => setEditViolationenactment(true)}></i>
              )}

              {editViolationenactment ? (
                <InputTextarea
                  className="w-full"
                  value={violationenactment}
                  onChange={(e) => setViolationenactment(e.target.value)}
                />
              ) : (
                <p className="border-400 border-round border-round-md border-1 pb-4 pt-2 px-2">{violationenactment}</p>
              )}
            </div>
          </div> */}
          {/* <div className="mb-2  mr-2">
            <h5>Danh mục bài viết</h5>
            <div className="relative ">
              <Dropdown
                value={contentCategory}
                onChange={(e) => updateContentCategory(e.value)}
                options={category}
                optionLabel="name"
                placeholder="Chọn danh mục"
                className="w-full "
              />
            </div>
          </div> */}
          {/* {data.type === "YOUTUBE" ? (
            <div className="mb-2  mr-2">
              <h5>Khoảng thời gian vi phạm</h5>
              <div className="relative ">
                {editViolationTimes ? (
                  <i className="pi pi-check absolute top--5" onClick={() => updateViolationTimes()}></i>
                ) : (
                  <i className="pi pi-pencil absolute top--5" onClick={() => setEditViolationTimes(true)}></i>
                )}

                {editViolationTimes ? (
                  <InputTextarea
                    className="w-full"
                    value={violationTimes}
                    onChange={(e) => setViolationTimes(e.target.value)}
                  />
                ) : (
                  <p className="border-400 border-round border-round-md border-1 pb-4 pt-2 px-2">{violationTimes}</p>
                )}
              </div>
            </div>
          ) : (
            ""
          )} */}

          <div className="p-fluid mb-2  mr-2">
            <h5>Thẻ</h5>
            <AutoComplete
              className="w-full flex"
              dropdown
              multiple
              field="label"
              onKeyPress={(e) => enterNoExit(e)}
              suggestions={filterTags}
              onDropdownClick={() => setFilterTags([...filterTags])}
              completeMethod={searchTags}
              value={arrayTags}
              onUnselect={(e) => unSelectTag(e)}
              onSelect={(e) => selectTag(e)}
            />
          </div>
          <div className="p-fluid  mr-2">
            <h5>Thông tin người đăng</h5>
            <AutoComplete
              className="w-full flex"
              dropdown
              multiple
              field="label"
              onKeyPress={(e) => enterNoExitProfiles(e)}
              suggestions={filterProfiles}
              onDropdownClick={() => setFilterProfiles([...filterProfiles])}
              completeMethod={searchProfiles}
              value={arrayProfiles}
              onUnselect={(e) => unSelectProfile(e)}
              onSelect={(e) => selectProfile(e)}
            />
          </div>
          {data?.screenShot && (
            <div className="flex flex-wrap justify-content-center mt-2">
              <h5 className="w-full">Ảnh chụp</h5>
              <Image src={data?.screenShot} alt="Image screenshot" width="250" className="" preview />
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-1 mt-3 justify-content-end">
        <Button
          className="p-button-secondary w-auto"
          onClick={() => {
            closeDialog()
            setEmpty()
          }}
        >
          Đóng
        </Button>
        <Button onClick={confirm} className="w-auto" label="Bỏ qua"></Button>
        <ConfirmPopup />
        <Button
          className="p-button-primary w-auto"
          onClick={() => {
            handlePost(data?.userHandle === "handledPost" ? "cancelHandle" : "handle")
            closeDialog()
            setEmpty()
          }}
        >
          {data?.userHandle === "handledPost" ? "Ngưng xử lý" : "Xử lý"}
        </Button>
      </div>
    </>
  )
}

export default DetailPost
