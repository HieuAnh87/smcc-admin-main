import React, {useRef} from "react"
import PropTypes from "prop-types"
import {Dialog} from "primereact/dialog"
import {useMutation, useQuery, useQueryClient} from "react-query"
import {Avatar} from "primereact/avatar"
import moment from "moment"
import {Button} from "primereact/button"
import {getAllPosts, getPostById, updatePost} from "../../service/postAPI"
import DetailPost from "../ManageTopic/DetailPost"
import {Toast} from "primereact/toast"
import {useHistory, useLocation} from "react-router-dom"
import {useDispatch, useSelector} from "react-redux"
import {clearQueryStr} from "../../store/queryStore"
import {useEffect} from "react"
DialogDetailContent.propTypes = {}

function DialogDetailContent({displayDialog, closeDialog, id}) {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.user.token)
  const key = `${process.env.REACT_APP_API_URL}/content/${id}`
  const {data, isLoading} = useQuery(key, (query) => getPostById({query, token}), {
    enabled: !!id,
  })
  const history = useHistory()
  const location = useLocation()
  const queryClient = useQueryClient()
  const toast = useRef(null)
  const headerDialog = () => {
    if (isLoading) return "Loading..."
    return (
      <div className="flex align-items-center gap-2 mb-3">
        <Avatar
          image={data?.doc?.sourceInfo?.avatar || data?.doc?.authorInfo?.avatar}
          className="mr-2"
          size="xlarge"
          shape="circle"
        />
        <div className="font-normal">
          <div className="font-bold">
            {data?.doc.type === "WEBSITE_POST" ? "Webiste: " : ""} {data?.doc?.sourceInfo?.name}
          </div>
          <div className="flex" style={{gap: "20px"}}>
            <div className="flex align-items-center gap-1 text-base mt-1">
              {moment(data?.doc.postedAt).format("HH:mm DD/MM/YYYY")} <i className="pi pi-clock"></i>
            </div>
            <div className="flex justify-content-start text-sm" style={{gap: "20px"}}>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(data?.doc?.views || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-eye" style={{color: "blue"}}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(data?.doc?.likes || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-thumbs-up" style={{color: "blue"}}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(data?.doc?.comments || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-comments" style={{color: "#a89b32"}}></i>
              </div>
              <div className="inline-flex align-items-center gap-1">
                <span className="mr-1 font-bold"> {Number(data?.doc?.shares || 0).toLocaleString("vi")}</span>{" "}
                <i className="pi pi-share-alt"></i>
              </div>
            </div>
            <div>
              <Button
                title="Xem bài viết"
                icon="pi pi-external-link"
                className="p-button-text"
                onClick={() => window.open(data?.doc?.link)}
              />

              <Button
                title="Sao chép link"
                icon="pi pi-copy"
                className="p-button-text"
                onClick={() => navigator.clipboard.writeText(data?.doc?.link)}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
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
  // const handlePost = (process) => {
  //   delete data?.doc.topics;
  //   updateStatus.mutate({
  //     id: data?.doc.id,
  //     newData: {
  //       process: process,
  //       tagIds: data?.doc?.tagsInfo?.map((p) => p.id),
  //       profileIds: data?.doc?.profilesInfo?.map((p) => p.id),
  //       editedTextContent: data?.doc?.editedTextContent,
  //       violationContent: data?.doc?.violationContent,
  //       violationEnactment: data?.doc?.violationEnactment,
  //     },
  //     token,
  //   });
  // };
  // const footerDialog = () => {
  //   return (
  //     <div className="flex gap-1 mt-3 justify-content-end">
  //       <Button className="p-button-secondary" onClick={() => handlePost(false)}>
  //         Bỏ qua
  //       </Button>
  //       <Button className="p-button-primary" onClick={() => handlePost(data?.doc?.process ? null : true)}>
  //         {data?.doc?.process ? "Ngưng xử lý" : "Xử lý"}
  //       </Button>
  //     </div>
  //   );
  // };
  const handleClose = () => {
    queryClient.removeQueries(`${process.env.REACT_APP_API_URL}/content/${id}`)
    closeDialog()
    history.push({
      pathname: location.pathname,
      search: ``,
    })
    dispatch(clearQueryStr())
  }

  return (
    <div>
      <Toast ref={toast} />
      {!isLoading && data?.doc && (
        <Dialog
          visible={displayDialog}
          dismissableMask
          header={headerDialog}
          // footer={footerDialog}
          className="p-fluid w-12 width-dialog dialog-fix-height"
          modal
          onHide={() => {
            handleClose()
          }}
        >
          <DetailPost data={data?.doc} toast={toast} closeDialog={handleClose} />
        </Dialog>
      )}
    </div>
  )
}

export default DialogDetailContent
