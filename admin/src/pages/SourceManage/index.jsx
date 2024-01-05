import moment from "moment"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { MultiSelect } from "primereact/multiselect"
import { Toast } from "primereact/toast"
import React, { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useSelector } from "react-redux"
import { createHistory } from "../../service/historyAPI.js"
import { getAllProfiles } from "../../service/profileAPI.js"
import { deleteSource, getAllSources, updateSource } from "../../service/sourceAPI.js"
import { getAllTags } from "../../service/tagAPI.js"
import Form from "./Form.jsx"
import { useHistory } from "react-router-dom"
import { ToggleButton } from "primereact/togglebutton"
import axios from "axios"
SourceManage.propTypes = {}

function SourceManage(props) {
  const [sourceDialog, setSourceDialog] = useState(false)
  const [selection, setSelection] = useState(null)
  const [deleteSourceDialog, setDeleteSourcenDialog] = useState(false)
  const [source, setSource] = useState(null)
  const [edit, setEdit] = useState(false)
  const toast = useRef(null)
  const [keywordsTag, setKeywordsTag] = useState("")
  const [keywordsProfile, setKeywordsProfile] = useState("")
  const token = useSelector((state) => state.user.token)
  const userId = useSelector((state) => state.user?.userData?.id || "")

  const [filterTags, setFilterTags] = useState([])
  const [filterProfiles, setFilterProfiles] = useState([])
  const history = useHistory()
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    limit: 10,
    page: 0,
    sortOrder: -1,
    sortField: "createdAt",
    filters: {
      name: { value: null },
      status: { value: null },
      type: { value: null },
      tagIds: { value: [] },
      profileIds: { value: [] },
    },
  })
  const statuses = [
    { label: "Hoạt động", value: "LIVE" },
    { label: "Dừng hoạt động", value: "DEAD" },
    { label: "Không xác định", value: "WAITING" },
  ]
  const types = [
    { label: "Website", value: "WEBSITE" },
    { label: "Facebook page", value: "FB_PAGE" },
    { label: "Facebook group", value: "FB_GROUP" },
    { label: "Facebook account", value: "FB_ACCOUNT" },
    { label: "Youtube", value: "YOUTUBE" },
    { label: "Tiktok", value: "TIKTOK" },
    { label: "Twitter", value: "TWITTER" },
    // {label: "Google search website", value: "GOOGLE_SEARCH_WEBSITE"},
  ]
  const queryClient = useQueryClient()
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
  const keyTags = `${process.env.REACT_APP_API_URL}/tag?page=1&pageSize=12&name=${keywordsTag}`
  const tags = useQuery(keyTags, (query) => getAllTags(query, token), {
    onSuccess: (data) => {
      if (data?.docs?.length)
        setFilterTags([
          ...data?.docs?.map((p) => ({
            value: p.id,
            label: p.name,
          })),
        ])
    },
  })
  const keyProfiles = `${process.env.REACT_APP_API_URL}/profile?page=1&pageSize=12&name=${keywordsProfile || ""}`
  const profiles = useQuery(keyProfiles, (query) => getAllProfiles(query, token), {
    onSuccess: (data) => {
      if (data?.docs?.length) {
        setFilterProfiles([
          ...data?.docs?.map((p) => ({
            value: p.id,
            label: p.name,
          })),
        ])
      }
    },
  })
  const key = `${process.env.REACT_APP_API_URL}/source?page=${lazyParams.page + 1}&pageSize=${lazyParams.limit}${lazyParams.filters?.name && lazyParams.filters?.name?.value ? `&name=${lazyParams.filters?.name?.value}` : ""
    }${lazyParams.sortField ? "&sortBy=" + lazyParams.sortField : "&sortBy=createdAt"}${lazyParams.sortOrder == 1 ? "&desc=false" : lazyParams.sortOrder == -1 ? "&desc=true" : ""
    }${lazyParams.filters &&
      lazyParams.filters.tagIds &&
      lazyParams.filters.tagIds.value &&
      lazyParams.filters.tagIds.value.length
      ? `&tagIds=${lazyParams.filters.tagIds.value.map((p) => p.value).join(",")}`
      : ""
    }${lazyParams.filters &&
      lazyParams.filters.profileIds &&
      lazyParams.filters.profileIds.value &&
      lazyParams.filters.profileIds.value.length
      ? `&profileIds=${lazyParams.filters.profileIds.value.map((p) => p.value).join(",")}`
      : ""
    }${lazyParams.filters && lazyParams?.filters?.type && lazyParams.filters?.type?.value
      ? `&type=${lazyParams.filters.type.value}`
      : ""
    }${lazyParams.filters && lazyParams?.filters?.status && lazyParams.filters?.status?.value
      ? `&status=${lazyParams.filters.status.value}`
      : ""
    }`
  // ${lazyParams.sortField ? "&sortBy=" + lazyParams.sortField : "&sortBy=createdat"}${lazyParams.sortOrder == 1 ? "&desc=asc" : lazyParams.sortOrder == -1 ? "&desc=desc" : "&desc=desc"}
  const { isLoading, error, data } = useQuery(key, (query) => getAllSources({ query, token }), {})
  const onPage = (event) => {
    setLazyParams({ ...lazyParams, page: event.page, limit: 10, first: event.first })
  }
  const onSort = (event) => {
    setLazyParams({ ...lazyParams, ...event })
  }

  const onFilter = (event) => {
    event["page"] = 0
    setLazyParams({ ...lazyParams, page: event.page, limit: 10, first: event.first, filters: event.filters })
  }
  const remove = useMutation(deleteSource, {
    onSuccess: () => {
      toast.current.show({ severity: "success", summary: "Xóa nguồn dữ liệu thành công", detail: "Thành công" })
      addHistory.mutate({
        newData: {
          screen: "Chủ đề",
          description: `Xóa nguồn có thông tin: { id: ${source?.id}, name: ${source?.name}, link: ${source?.link} , type: ${source?.type}, status: ${source?.status} }`,
        },
        token,
      })
      setSource({})
    },
    onError: (error) => handleError(error),
    onSettled: () =>
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/source`),
      }),
  })
  const update = useMutation(updateSource, {
    onSuccess: () => {
      queryClient.invalidateQueries(key)
      toast.current.show({ severity: "success", summary: "Cập nhật thành công", detail: "Thành công" })
    },
    onError: (error) => {
      handleError(error)
    },
    // onSettled: () => {
    //   console.log("vao setteled af")
    //   //   setDisplayDialog(false)
    //   history.push({
    //     pathname: `/bai-viet`,
    //     search: `?id=${data.id}`,
    //   })
    //   return queryClient.invalidateQueries({
    //     predicate: (query) => {
    //       return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/source`)
    //     },
    //   })
    // },
  })
  const changeIsQuality = (e, value) => {
    update.mutate({
      id: value?.id,
      newData: {
        [e]: !value[e],
      },
      token,
    })
  }

  const changeRanking = (e, value, newE) => {
    if (![1, 2, 3, 4, 5].includes(newE)) {
      console.error('Invalid newE value');
      return;
    }

    update.mutate({
      id: value?.id,
      newData: {
        ['ranking']: newE,
      },
      token,
    });
  };










  const openNew = () => {
    setEdit(false)
    setSourceDialog(true)
  }
  const hideDialog = () => {
    setSourceDialog(false)
    setSource({})
  }
  const confirmDeleteSource = (source) => {
    setSource(source)
    setDeleteSourcenDialog(true)
  }
  const openEditSource = (rowData) => {
    setEdit(true)
    setSourceDialog(true)
    setSource(rowData)
  }
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className="text-center flex gap-2 justify-content-center" style={{ color: "red" }}>
          <i title="Xóa" className="pi pi-trash cursor-pointer" onClick={() => confirmDeleteSource(rowData)}></i>
          <i
            title="Cập nhật"
            className="pi pi-cog cursor-pointer"
            style={{ color: "blue" }}
            onClick={() => openEditSource(rowData)}
          ></i>
          {/* <Button icon="pi pi-trash" className="p-button-danger" onClick={() => confirmDeleteCampaign(rowData)} /> */}
        </div>
      </React.Fragment>
    )
  }
  const nameFilterTemplate = (values) => {
    return (
      <InputText
        value={values.value}
        onChange={(e) => {
          values.filterCallback(e.target.value)
        }}
        placeholder="Name"
      />
    )
  }
  const editIsQuality = (rowData) => {
    return (
      <ToggleButton
        style={{ background: rowData.isQuality === true ? "blue" : "red", color: "white" }}
        onLabel="Chính thống"
        offLabel="Không chính thống"
        onIcon="pi pi-times"
        checked={rowData.isQuality}
        onChange={(e) => changeIsQuality("isQuality", rowData)}
      />
    )
  }
  const metaInfo = (rowData) =>
    rowData?.type === "YOUTUBE" ? (
      <div>
        <p>Uploads: {rowData?.metaInfo?.uploads ? rowData?.metaInfo?.uploads : "Chưa thu thập"}</p>
        <p>Số subscribe: {rowData?.metaInfo?.subscribe ? rowData?.metaInfo?.subscribe : "Chưa thu thập"}</p>
        <p>Tổng số view: {rowData?.metaInfo?.allViews ? rowData?.metaInfo?.allViews : "Chưa thu thập"}</p>
        <p>Quốc gia: {rowData?.metaInfo?.country ? rowData?.metaInfo?.country : "Chưa thu thập"}</p>
        <p>Kiểu kênh: {rowData?.metaInfo?.type ? rowData?.metaInfo?.type : "Chưa thu thập"}</p>
        <p>Thời gian tạo: {rowData?.metaInfo?.createdAt ? rowData?.metaInfo?.createdAt : "Chưa thu thập"}</p>
      </div>
    ) : rowData?.type === "FB_PAGE" || rowData?.type === "FB_ACCOUNT" ? (
      <>
        <p>Lượt theo dõi: {rowData?.metaInfo?.follow ? rowData?.metaInfo?.follow : "Chưa thu thập"}</p>
      </>
    ) : rowData?.type === "FB_GROUP" ? (
      <>
        <p>Số thành viên: {rowData?.metaInfo?.members ? rowData?.metaInfo?.members : "Chưa thu thập"}</p>
      </>
    ) : rowData?.type === "TIKTOK" ? (
      <div>
        <p>Lượt theo dõi: {rowData?.metaInfo?.follow ? rowData?.metaInfo?.follow : "Chưa thu thập"}</p>
        <p>Số like: {rowData?.metaInfo?.like ? rowData?.metaInfo?.like : "Chưa thu thập"}</p>
      </div>
    ) : (
      <></>
    )
  const editRanking = (rowData) => {
    const citySelectItems = [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 }
    ]
    return (
      <Dropdown
        optionLabel="value"
        optionValue="value"
        value={rowData.ranking}
        //onChange={(e) => changeRanking(value, rowData)} 
        options={citySelectItems}
        onChange={(e) => changeRanking(0, rowData, e.value)}
        placeholder="Xếp hạng"
      />
    )
  }

  const editIsCrawl = (rowData) => {
    return (
      <ToggleButton
        style={{ background: rowData.isCrawl === true ? "blue" : "red", color: "white" }}
        onLabel="Quét toàn bộ"
        offLabel="Không quét"
        onIcon="pi pi-times"
        checked={rowData.isCrawl}
        onChange={(e) => changeIsQuality("isCrawl", rowData)}
      />
    )
  }



  const typeTemplate = (rowData) => {
    return (
      <React.Fragment>
        <a className="text-start">
          {rowData.type == "FB_GROUP"
            ? "FB GROUP"
            : rowData.type == "FB_PAGE"
              ? "FB FANPAGE"
              : rowData.type == "FB_ACCOUNT"
                ? "FB ACCOUNT"
                : rowData.type == "GOOGLE_SEARCH_WEBSITE"
                  ? "Google search website"
                  : rowData.type == "YOUTUBE"
                    ? "YOUTUBE"
                    : rowData.type == "TIKTOK"
                      ? "TIKTOK"
                      : rowData.type == "TWITTER"
                        ? "TWITTER"
                        : "WEBSITE"}
        </a>
      </React.Fragment>
    )
  }
  const linkTemplate = (rowData) => {
    return (
      <React.Fragment>
        <a target="_blank" href={rowData.link} className="text-start flex align-items-center gap-2">
          <span>{rowData.link}</span>
        </a>
      </React.Fragment>
    )
  }
  const statusTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className="text-start">
          {rowData.status == "LIVE" ? "Hoạt động" : rowData.status == "DEAD" ? "Dừng hoạt động" : "Không xác định"}
        </div>
      </React.Fragment>
    )
  }
  const sourceTemplate = (rowData) => {
    return (
      <React.Fragment>
        <a target="_blank" href={rowData.link} className="text-start flex align-items-center gap-2">
          <img className="border-circle w-2rem h-auto" src={rowData.avatar} alt="" />
          <span>{rowData.name}</span>
        </a>
      </React.Fragment>
    )
  }
  const formatDate = (value) => {
    return moment(value).format("DD/MM/YYYY")
  }
  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData?.lastCrawledAt || new Date())
  }
  const deleteSourceConfirm = () => {
    remove.mutate({ id: source.id, token })
    setDeleteSourcenDialog(false)
  }
  const hideDeleteSourceDialog = () => {
    setDeleteSourcenDialog(false)
  }
  const deleteSourceDialogFooter = (
    <React.Fragment>
      <Button label="Hủy" icon="pi pi-times" className="p-button-text" onClick={hideDeleteSourceDialog} />
      <Button label="Đồng ý" icon="pi pi-check" className="p-button-text" onClick={deleteSourceConfirm} />
    </React.Fragment>
  )
  const representativeFilterTemplate = (values) => {
    return (
      <Dropdown
        value={values.value}
        options={statuses}
        onChange={(e) => values.filterCallback(e.value)}
        optionLabel="label"
        placeholder="Toàn bộ"
        className="p-column-filter"
      />
    )
  }
  const typeFilterTemplate = (values) => {
    return (
      <Dropdown
        value={values.value}
        options={types}
        onChange={(e) => values.filterCallback(e.value)}
        optionLabel="label"
        placeholder="Toàn bộ"
        className="p-column-filter"
      />
    )
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
      <AutoComplete
        className="w-full flex"
        dropdown
        multiple
        field="label"
        suggestions={filterTags}
        onDropdownClick={() => setFilterTags([...filterTags])}
        completeMethod={searchTags}
        value={values.value}
        onSelect={(e) => selectTag(e, values)}
        onUnselect={(e) => unSelectTag(e, values)}
      />
    )
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
  const selectProfile = (e, values) => {
    values.value = values.value || []
    const findTag = values?.value?.find((p) => p.value == e.value.value)
    if (!findTag) {
      values.filterCallback([...values.value, e.value])
    }
  }
  const unSelectProfile = (e, values) => {
    values.value = values.value || []
    const newArrayTags = values.value.filter((p) => p.value != e.value.value)
    values.filterCallback([...newArrayTags])
  }
  const profileIdsFilterTemplate = (values) => {
    return (
      <AutoComplete
        className="w-full flex"
        dropdown
        multiple
        field="label"
        suggestions={filterProfiles}
        onDropdownClick={() => setFilterProfiles([...filterProfiles])}
        completeMethod={searchProfiles}
        value={values.value}
        onSelect={(e) => selectProfile(e, values)}
        onUnselect={(e) => unSelectProfile(e, values)}
      />
    )
  }
  const addHistory = useMutation(createHistory, {
    onError: (e) => {
      console.log(e)
    },
  })
  useEffect(() => {
    if (data && data?.docs)
      addHistory.mutate({
        newData: {
          screen: "Nguồn dữ liệu",
          description: `Xem danh sách nguồn dữ liệu page ${data?.page} có ${data?.docs.length} bản ghi`,
        },
        token,
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.page])
  const [cate, setCate] = useState(null);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/category`).then((response) => {
      // Handle the successful response here
      setCate(response?.data?.doc);
      console.log(response?.data?.doc)
    })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error("Error fetching data:", error);
      });
  }, [])
  function categoryName(categoryId) {

    axios.get(`${process.env.REACT_APP_API_URL}/category/${categoryId}`).then((response) => {
      // Handle the successful response here
      setCate(response?.data?.doc?.name);
      console.log(cate)
    })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error("Error fetching data:", error);
      });
    return cate;
  }
  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <Button className="px-8" onClick={openNew}>
          Thêm
        </Button>
      </div>
      <div className="col-12">
        <div className="card">
          <h5>Nguồn dữ liệu</h5>
          <DataTable
            value={data?.docs}
            lazy
            selectionMode="checkbox"
            selection={selection}
            onSelectionChange={(e) => setSelection(e.value)}
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Hiển thị {first} - {last} của tổng {totalRecords} bản ghi"
            onPage={onPage}
            first={lazyParams.first}
            onSort={onSort}
            sortField={lazyParams.sortField}
            sortOrder={lazyParams.sortOrder}
            onFilter={onFilter}
            filters={lazyParams.filters}
            totalRecords={data?.total}
            className="p-datatable-gridlines"
            rows={10}
            dataKey="id"
            loading={isLoading}
            responsiveLayout="scroll"
            emptyMessage="Không tìm thấy dữ liệu"
            paginatorPosition="both"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "1%" }} />
            <Column
              header="Hành động"
              alignHeader="center"
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "5%" }}
            ></Column>
            {/* <Column field="id" header="ID" sortable style={{display: "none "}}  /> */}
            <Column
              body={(data, props) => <div className="text-center">{props.rowIndex + 1}</div>}
              header="STT"
              headerStyle={{ width: "1%" }}
            />
            <Column
              body={sourceTemplate}
              field="name"
              header="Tên nguồn dữ liệu"
              style={{ minWidth: "10%" }}
              headerStyle={{ width: "10%" }}
              sortable
              filter
              filterField="name"
              showFilterMatchModes={false}
              showFilterMenuOptions={false}
              filterElement={nameFilterTemplate}
            />
            <Column
              field="link"
              header="Liên kết"
              body={linkTemplate}
              // style={{minWidth: "10%"}}
              headerStyle={{ width: "10%" }}
            />

            <Column
              body={typeTemplate}
              field="type"
              header="Phân loại"
              style={{ minWidth: "12rem" }}
              sortable
              filter
              filterField="type"
              showFilterMatchModes={false}
              showFilterMenuOptions={false}
              filterElement={typeFilterTemplate}
            />
            {/* <Column
              field="ranking"
              header="Xếp hạng nguồn"
              body={(rowData) => (
                <div className="text-center">{Number(rowData.ranking || 0).toLocaleString("vi")}</div>
              )}
              style={{minWidth: "7rem"}}
              sortable
            />   */}

            <Column
              field="ranking"
              header="Xếp loại nguồn"
              body={editRanking}
              style={{ minWidth: "7rem" }}
              sortable
            />
            <Column
              field="isCrawl"
              header="Có quét toàn trang"
              body={editIsCrawl}
              style={{ minWidth: "12rem" }}
              sortable
            />
            <Column
              field="category"
              header="Danh mục"
              body={(rowData) => (
                <div className="text-center">{cate?.find(item => item.id === rowData?.categoryId) ? cate?.find(item => item.id === rowData.categoryId).name : "Không xác định"}</div>
              )}
              style={{ minWidth: "7rem" }}
              sortable
            />
            <Column field="metaInfo" header="Thông tin nguồn" body={metaInfo} style={{ minWidth: "12rem" }} />
            <Column
              field="isQuality"
              header="Kênh chính thống"
              body={editIsQuality}
              style={{ minWidth: "12rem" }}
              sortable
            />
            <Column
              body={statusTemplate}
              field="status"
              header="Trạng thái"
              style={{ minWidth: "3rem" }}
              sortable
            // filter
            // filterField="status"
            // showFilterMatchModes={false}
            // showFilterMenuOptions={false}
            // filterElement={representativeFilterTemplate}
            />
            <Column
              field="totalContent"
              header="Số bài viết"
              body={(rowData) => (
                <div className="text-center">{Number(rowData.totalContent || 0).toLocaleString("vi")}</div>
              )}
              style={{ minWidth: "7rem" }}
              sortable
            />
            {/* <Column body={dateBodyTemplate} field="lastCrawledAt" header="Lần cập nhật cuối" style={{ minWidth: "12rem" }} sortable /> */}
            <Column
              field="tagsInfo"
              header="Danh sách thẻ"
              body={(rowData) => (
                <div>
                  {rowData?.tagsInfo && rowData?.tagsInfo?.length
                    ? rowData?.tagsInfo?.map((p) => p.name).join(", ")
                    : ""}
                </div>
              )}
              filter
              filterField="tagIds"
              showFilterMatchModes={false}
              showFilterMenuOptions={false}
              filterElement={tagIdsFilterTemplate}
            />
            <Column
              field="profilesInfo"
              header="Danh sách hồ sơ"
              body={(rowData) => (
                <div>
                  {rowData?.profilesInfo && rowData?.profilesInfo?.length
                    ? rowData?.profilesInfo?.map((p) => p.name).join(", ")
                    : ""}
                </div>
              )}
              filter
              filterField="profileIds"
              showFilterMatchModes={false}
              showFilterMenuOptions={false}
              filterElement={profileIdsFilterTemplate}
            />

          </DataTable>
        </div>
      </div>
      <Dialog
        visible={sourceDialog}
        dismissableMask
        style={{ width: "800px" }}
        header="Nhập danh sách nguồn dữ liệu"
        modal
        className="p-fluid"
        onHide={hideDialog}
      >
        <Form data={source} btnText={edit ? "Edit" : "Add"} toast={toast} closeDialog={() => setSourceDialog(false)} />
      </Dialog>
      <Dialog
        visible={deleteSourceDialog}
        dismissableMask
        style={{ width: "450px" }}
        header="Xác nhận"
        modal
        footer={deleteSourceDialogFooter}
        onHide={hideDeleteSourceDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          {source && (
            <span>
              Bạn có chắc muốn xóa <b>{source.name}</b>, các bài viết từ nguồn dữ liệu này cũng sẽ bị xóa?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  )
}

export default React.memo(SourceManage)
