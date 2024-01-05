import { RadioButton } from 'primereact/radiobutton'
const Tags = ({ tagList, selectTag, post }) => {
  const onChangeTag = (e) => {
    selectTag(e.value)
  }
  return (
    <div className="flex justify-content-center h-7rem">
      <div className="flex flex-column status h-7rem">
        {tagList?.map((tag) => {
          return (
            <div key={tag.id} className="flex align-items-center">
              <RadioButton
                inputId={tag.key}
                name="tag"
                onChange={onChangeTag}
                value={tag}
                checked={post?.tagsInfo?.find((f) => f?.id === tag?.id) !== undefined}
              />
              <label htmlFor={tag.key} className="ml-2">
                {tag.name}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default Tags
