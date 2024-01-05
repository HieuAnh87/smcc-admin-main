import React, { useState, useEffect, useRef } from "react"
import { Dropdown } from "primereact/dropdown"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { SelectButton } from "primereact/selectbutton"
import { InputText } from "primereact/inputtext"
import axios from 'axios';
import moment from "moment"
import { RadioButton } from "primereact/radiobutton"
import { Dialog } from "primereact/dialog"
import { Avatar } from "primereact/avatar"
import imgValid from "../../../assets/images/invalid.jpg"
import "./DashboardTable.scss"
import { Button } from "primereact/button"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useSelector } from "react-redux"
import Tags from "../Tags/Tags"
import { getAllTags } from "../../../service/tagAPI"
import { updatePost, updateMultiPost } from "../../../service/postAPI"
import { createHistory } from "../../../service/historyAPI"
import { Toast } from "primereact/toast"
import { PostType, size, ActionsType, SourceType } from "../../QuickProcessing/index"
import DetailPost from "../../../components/ManageTopic/DetailPost"
const keyTags = `${process.env.REACT_APP_API_URL}/tag?showOnPost=true&page=1&pageSize=12`

const DashboardTable = ({
  dataList,
  type,
  handleChangeType,
  source,
  handleChangeSource,
  handlePageChange,
  params,
  hand,
}) => {
  console.log("params", params)
  const token = useSelector((state) => state.user.token)
  const queryClient = useQueryClient()
  const toast = useRef(null)
  const [loading, setLoading] = useState(false)
  const [filterTags, setFilterTags] = useState([])
  const [keywordsTag, setKeywordsTag] = useState("")
  const [selectedContents, setSelectedContents] = useState([])
  const [types] = useState([
    { label: "Mới", value: PostType.postedAt },
    // { label: "Nổi bật trong ngày", value: PostType.totalReactions },
    // { label: "Được theo dõi", value: PostType.follow },
  ])
  const [sourceType] = useState([
    { label: "Toàn bộ", value: SourceType.all },
    { label: "Facebook", value: SourceType.facebook },
    { label: "Website", value: SourceType.website },
    // { label: "Youtube", value: SourceType.youtube },
  ])
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [displayDialog, setDisplayDialog] = useState(false)
  const [dataDialog, setDataDialog] = useState(null)

  const tags = useQuery(keyTags, (query) => getAllTags(query, token), {
    onSuccess: (data) => {
      setFilterTags([
        ...data?.docs.map((p) => ({
          value: p.id,
          label: p.name,
        })),
      ])
    },
  })
  const [lazyParams, setLazyParams] = useState({
    filters: {
      tagIds: { value: [] },
    },
  })
  const onFilter = (event) => {
    event["page"] = 0
    console.log("event", event)
    // setLazyParams({...lazyParams, page: event.page, limit: 10, first: event.first, filters: event.filters})
    setLazyParams({ filters: event.filters })
    handlePageChange(event)
  }
  const Header = (
    <>

      <div className="mb-5 quick-link-main">
        <div className="p-inputgroup" style={{ maxWidth: "400px" }}>
          <Button onClick={() => handleSearch()} label="Tìm kiếm" />
          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Từ khóa"
          />
          <Button onClick={() => handleClear()} label="Xóa" />
        </div>
      </div>
      <div className="flex flex-wrap align-items-center justify-content-between gap-2">
        <span className="text-xl text-900 font-bold">Bài viết</span>
        <Button disabled={selectedContents.length != 0} onClick={() => UpdateClassify()}>
          Xử lý bài viết
        </Button>
        <Button disabled={selectedContents.length == 0} onClick={() => handleMultilple("handledPost")}>
          Xử lý hàng loạt
        </Button>
        <Button disabled={selectedContents.length == 0} onClick={() => handleMultilple("skippedPost")}>
          Bỏ qua hàng loạt
        </Button>
        <SelectButton value={source} onChange={(e) => handleChangeSource(e.value)} options={sourceType} />
        <SelectButton value={type} onChange={(e) => handleChangeType(e.value)} options={types} />
      </div>
    </>
  )
  const handleSearch = () => {
    if (globalFilterValue.length > 0) {
      handlePageChange(globalFilterValue)
    }
  }
  const searchTags = (event) => {
    let timeout
    let query = event.query

    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => {
      setKeywordsTag(query)
    }, 300)
  }
  const selectTag = (e, values) => {
    values.value = values.value || []
    const findTag = values.value.find((p) => p.value == e.value.value)
    if (!findTag) {
      values.filterCallback([...values.value, e.value])
    }
  }
  const unSelectTag = (e, values) => {
    values.value = values.value || []
    const newArrayTags = values.value.filter((p) => p.value != e.value.value)
    values.filterCallback([...newArrayTags])
  }
  const tagIdsFilterTemplate = (values) => {
    return (
      <Dropdown
        value={values.value}
        options={filterTags}
        onChange={(e) => values.filterCallback(e.value)}
        optionLabel="label"
        placeholder="Toàn bộ"
        className="p-column-filter"
      />
    )
  }
  const headerDialog = (_data) => {
    return (
      <div className="flex align-items-center gap-2 mb-3">
        <Avatar
          image={_data.sourceInfo?.avatar || _data.authorInfo?.avatar}
          className="mr-2"
          style={{ width: "100px", height: "auto" }}
          size="xlarge"
          shape="circle"
        />
        <div className="font-normal">
          <div className="font-bold">
            {_data.type === "WEBSITE_POST" ? "Webiste: " : ""} {_data.sourceInfo?.name}
          </div>
          <div className="flex" style={{ gap: "20px" }}>
            <div className="flex align-items-center gap-1 text-base mt-1">
              {moment(_data.postedAt).format("HH:mm DD/MM/YYYY")} <i className="pi pi-clock"></i>
            </div>
            <div className="flex justify-content-start text-sm" style={{ gap: "20px" }}>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(_data.views || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-eye" style={{ color: "blue" }}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(_data.likes || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-thumbs-up" style={{ color: "blue" }}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(_data.comments || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-comments" style={{ color: "#a89b32" }}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(_data.shares || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-share-alt"></i>
              </div>
            </div>
            <div>
              <Button
                title="Xem bài viết"
                icon="pi pi-external-link"
                className="p-button-text"
                onClick={() => window.open(_data.link)}
              />

              <Button
                title="Sao chép link"
                icon="pi pi-copy"
                className="p-button-text"
                onClick={() => navigator.clipboard.writeText(_data.link)}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const openDetailPost = (post) => {
    setDataDialog(post)
    setDisplayDialog(true)
  }
  const handleClear = () => {
    setGlobalFilterValue("")
    handlePageChange("")
  }
  const TopicBodyTemplate = (post) => {
    return post?.topicsInfo?.map((topic, i) => (
      <React.Fragment key={i}>
        {topic?.name}
        {i != post?.topicsInfo?.length - 1 && <>, </>}
      </React.Fragment>
    ))
  }
  const SourceInfoBodyTemplate = (post) => {
    return (
      <>
        <div className="flex align-items-center justify-content-center source-info">
          <div className="w-3rem h-3rem flex align-items-start justify-content-center bg-blue-100 border-circle mr-3 mt-2 flex-shrink-0">
            <img
              className="w-full h-full border-circle"
              src={post?.authorInfo?.avatar || post?.sourceInfo?.avatar}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src = imgValid
              }}
            ></img>
          </div>
          <a target="_blank" href={post?.sourceInfo.link}>
            {post?.sourceInfo?.name}
          </a>
          <span></span>
        </div>
      </>
    )
  }
  const PostedAtBodyTemplate = (post) => (
    <>
      <p>{post?.postedAt ? moment(post.postedAt).format("HH:mm") : moment(post?.createdAt).format("HH:mm")}</p>
      <p>{post?.postedAt ? moment(post.postedAt).format("DD/MM/YYYY") : moment(post.createdAt).format("DD/MM/YYYY")}</p>
    </>
  )
  const ContentBodyTemplate = (post) => (
    <>
      <div className="flex align-items-center  source-info">
        <div className="w-9rem h-auto	 flex align-items-start justify-content-center bg-blue-100 border-circle mr-3 mt-2 flex-shrink-0">
          {post?.imageContents?.length > 0 ? (
            <a target="_blank" href={post?.link}>
              <img
                className="w-full h-full"
                src={post?.imageContents?.[0]}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null // prevents looping
                  currentTarget.src = imgValid
                }}
              ></img>
            </a>
          ) : (
            ""
          )}
        </div>

        <div>
          <div>
            {post?.type == "YOUTUBE"
              ? post.title
              : post?.editedTextContent
                ? post.editedTextContent
                : post?.textContent?.substr(0, 200) || ""}
          </div>
          <p>
            <a onClick={() => openDetailPost(post)}>Mở hiển thị chi tiết</a>
          </p>
        </div>
      </div>
    </>
  )


  const KeywordBodyTemplate = (post) => (
    <>
      <div className="flex align-items-center  source-info">
        <div>
          <div>
            {post?.topicsInfo?.map((topic, i) => (
              <React.Fragment key={i}>
                {topic?.keywords?.map((keyword, i) => (
                  <React.Fragment key={i}>
                    {keyword ? keyword.keywords : ""}
                    <br />
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </>
  )

  const StatusBodyTemplate = (post) => {
    return (
      <Tags
        tagList={tags?.data?.docs.filter((e) => e.showOnPost)}
        selectTag={(e) => handleChangeTag(e.id, post)}
        post={post}
      />
    )
  }
  const ActionsBodyTemplate = (post) => {
    return (
      <div className="flex align-items-center flex-column actions w-14rem h-7rem">
        <Button
          label={post?.userHandle === "handledPost" ? "Ngưng xử lý" : "Xử lý"}
          onClick={() => {
            handlePost(post?.userHandle === "handledPost" ? ActionsType.cancelHandle : ActionsType.handlePost, post)
          }}
        />
        <Button severity="secondary" className="btn-reject" label="Bỏ qua" onClick={() => handleReject(post)} />
      </div>
    )
  }

  const updateStatus = useMutation(updatePost, {
    onSuccess: () => {
      setLoading(false)
      toast.current.show({ severity: "success", summary: "Cập nhật bài viết thành công", detail: "Thành công" })
    },
    onError: (error) => {
      setLoading(false)
      handleError(error)
    },
    onSettled: () => {
      //   setDisplayDialog(false)
      // history.push({
      //     pathname: `/bai-viet`,
      //     search: `?id=${data.id}`,
      // })
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/content`)
        },
      })
    },
  })
  const updateMultil = useMutation(updateMultiPost, {
    onSuccess: () => {
      setLoading(false)
      toast.current.show({ severity: "success", summary: "Cập nhật hàng loạt bài viết thành công", detail: "Thành công" })
    },
    onError: (error) => {
      setLoading(false)
      handleError(error)
    },
    onSettled: () => {
      //   setDisplayDialog(false)
      // history.push({
      //     pathname: `/bai-viet`,
      //     search: `?id=${data.id}`,
      // })
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/content`)
        },
      })
    },
  })

  const handleChangeTag = (tagId, post) => {
    setLoading(true)

    updateStatus.mutate({
      id: post?.id,
      newData: {
        tagIds: [tagId],
      },
      token,
    })
  }

  const addHistory = useMutation(createHistory, {
    onError: (e) => {
      console.log(e)
      setLoading(false)
    },
  })

  const handleContent = useMutation(updatePost, {
    onSuccess: (updateData) => {
      setLoading(false)
      toast.current.show({ severity: "success", summary: "Đã bỏ qua bài viết", detail: "Thành công" })
      addHistory.mutate({
        newData: {
          screen: "Bài viết",
          description: `Bỏ qua bài viết id: ${updateData?.doc[0]?.id} từ: {title: ${updateData?.doc[0]?.title || ""
            }, editedTextContent : ${updateData?.doc[0]?.editedTextContent} , profileids: [${updateData?.doc[0]?.profilesInfo?.map((p) => p?.id).join(", ") || ""
            }], tagids: [${updateData?.doc[0]?.tagsInfo?.map((p) => p?.id).join(", ") || ""}]}`,
        },
        token,
      })
    },
    onError: (e) => {
      console.log(e)
      setLoading(false)
      handleError(e)
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/content`)
        },
      })
    },
  })

  const handleError = (err) => {
    if (err?.response?.data?.msg) {
      toast.current.show({ severity: "error", summary: err.response.data.msg, detail: "Lỗi" })
      throw new Error(err.response.data.msg)
    } else if (err?.message) {
      toast.current.show({ severity: "error", summary: err.message, detail: "Lỗi" })
      throw new Error(err.message)
    } else {
      toast.current.show({ severity: "error", summary: err, detail: "Lỗi" })
    }
  }

  const handlePost = (val, dataPost) => {
    setLoading(true)
    if (val === ActionsType.cancelHandle) {
      updateStatus.mutate({
        id: dataPost?.id,
        newData: {
          userHandle: "skippedPost",
          process: false,
        },
        token,
      })
    } else if (val === ActionsType.handlePost) {
      updateStatus.mutate({
        id: dataPost?.id,
        newData: {
          userHandle: "handledPost",
          process: true,
          violationEnactment:
            "Trống",
        },
        token,
      })
    }
  }
  const handleReject = (post) => {
    setLoading(true)
    handleContent.mutate(
      {
        id: post.id,
        newData: {
          userHandle: "skippedPost",
          process: false,
        },
        token,
      },
      {
        onSuccess: () => {
          setLoading(false)
          toast.current.show({ severity: "success", summary: "Cập nhật bài viết thành công", detail: "Thành công" })
        },
        onError: (error) => {
          console.log(error)
          setLoading(false)
          handleError(error)
        },
      },
    )
  }
  const handleMultilple = (e) => {
    setLoading(true)
    updateMultil.mutate({
      ids: selectedContents.map((f) => f.id),
      userHandleType: e,
      token,
    })
    setSelectedContents([])
  }

  const UpdateClassify = async () => {
    try {

      toast.current.show({ severity: "info", summary: "Đang xử lý", detail: "Vui lòng đợi..." });

      const res = await axios.post(`http://127.0.0.1:8000/predict-batch`,{
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      console.log(res.data);
      toast.current.show({ severity: "success", summary: "Cập nhật thành công", detail: "Thành công" });

    } catch (error) {
      console.error('Error while making POST request:', error);
    }


  };



  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={displayDialog}
        dismissableMask
        header={() => headerDialog(dataDialog)}
        // footer={footerDialog}
        className="p-fluid w-12 width-dialog dialog-fix-height"
        modal
        onHide={() => {
          setDisplayDialog(false)
        }}
      >
        <DetailPost
          data={dataDialog}
          toast={toast}
          closeDialog={() => {
            setDisplayDialog(false)
          }}
        />
      </Dialog>
      <div className="col-12 dashboard-table">
        <div className="card">
          <DataTable
            value={dataList?.data?.docs}
            lazy
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Hiển thị {first} - {last} của tổng {totalRecords} bản ghi"
            onPage={handlePageChange}
            totalRecords={dataList?.data?.total}
            className="p-datatable-gridlines"
            rows={size}
            onFilter={onFilter}
            filters={lazyParams.filters}
            dataKey="id"
            header={Header}
            loading={loading}
            responsiveLayout="scroll"
            emptyMessage="Không tìm thấy dữ liệu"
            paginatorPosition="bottom"
            first={params?.first}
            selectionMode="checkbox"
            selection={selectedContents}
            onSelectionChange={(e) => {
              console.log("e", e)
              setSelectedContents(e.value)
            }}
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} style={{ width: "2%" }}></Column>
            <Column
              body={(data, props) => <div className="text-center">{props.rowIndex + 1}</div>}
              header="STT"
              className="w-1rem"
              style={{ width: "2%" }}
            />
            <Column header="Kênh đăng" body={SourceInfoBodyTemplate} style={{ width: "10%" }}></Column>
            <Column header="Chủ đề" body={TopicBodyTemplate} style={{ width: "7%" }}></Column>
            <Column header="Thời gian" body={PostedAtBodyTemplate} style={{ width: "3%" }} className="w-7rem"></Column>
            <Column header="Nội dung" body={ContentBodyTemplate} style={{ width: "66%" }}></Column>
            <Column header="Người đăng " body={KeywordBodyTemplate} style={{ width: "66%" }}></Column>
            <Column
              header="Tag"
              filter
              filterField="tagIds"
              showFilterMatchModes={false}
              showFilterMenuOptions={false}
              filterElement={tagIdsFilterTemplate}
              body={StatusBodyTemplate}
              style={{ width: "7%" }}
            ></Column>
            <Column
              header="Hành động"
              body={ActionsBodyTemplate}
              style={{ width: "3%" }}
              className="column-actions"
            ></Column>
          </DataTable>
        </div>
      </div>
    </>
  )
}
export default DashboardTable
