export const getPostsFromResponse = (items) => {
  if (typeof items != 'object') {
    return null
  }
  const posts = []
  let nextCursors = []
  for (const item of items) {
    const edges =
      item.data?.user?.timeline_list_feed_units?.edges ||
      item.data?.page?.timeline_feed_units?.edges ||
      item.data?.group?.group_feed?.edges ||
      item.data?.node?.group_feed?.edges ||
      item.data?.node?.timeline_feed_units?.edges ||
      item.data?.node?.timeline_list_feed_units?.edges
    const nodes = edges?.map((e) => e.node) || []
    if (item.data?.node) {
      nodes.push(item.data?.node)
    }
    for (const node of nodes) {
      if (
        node?.__typename == 'Story' &&
        !node?.comet_sections?.content?.story?.comet_sections
          ?.aggregated_stories
      ) {
        const author = node?.comet_sections?.content?.story?.actors[0]
        author.profile_picture =
          node?.comet_sections?.context_layout?.story?.comet_sections?.actor_photo?.story?.actors[0]?.profile_picture?.uri
        const id = Buffer.from(node.id, 'base64')
          .toString('utf8')
          ?.split(':').pop()
        // console.log(JSON.stringify(node, null, 2))
        let textContent = node?.comet_sections?.content?.story?.message?.text
        const link = node?.comet_sections?.content?.story?.wwwURL
        let images = []
        let videos = []
        const media =
          node?.comet_sections?.content?.story?.attachments[0]?.styles
            ?.attachment?.media
        if (media) {
          if (media.__typename == 'Photo') {
            images.push({
              id: media.id,
              previewImage: media.photo_image,
              fullImage: {
                ...media.viewer_image,
                uri: media.viewer_image?.uri || media.photo_image?.uri,
              },
            })
          } else if (media.__typename == 'Video') {
            videos.push({
              id: media.id,
              previewImage: media.thumbnailImage,
              videoUrl: media.playable_url,
            })
          } else if (media.__typename == 'GenericAttachmentMedia') {
            images.push({
              id: media.id,
              previewImage: media.large_share_image,
            })
          }
        }
        const footerAttachment =
          node?.comet_sections?.content?.story?.attachments[0]
            ?.comet_footer_renderer
        if (footerAttachment) {
          textContent += `\n${footerAttachment.attachment?.title_with_entities?.text}\n${footerAttachment.attachment?.description?.text}`
        }
        const attachments =
          node?.comet_sections?.content?.story?.attachments[0]?.styles
            ?.attachment?.all_subattachments?.nodes
        if (attachments?.length) {
          images.push(
            ...attachments
              .filter((a) => a?.media?.__typename == 'Photo')
              .map((a) => ({
                id: a?.media?.id,
                previewImage: a?.media?.image,
                fullImage: a?.media?.viewer_image,
              }))
          )
          videos.push(
            ...attachments
              .filter((a) => a?.media?.__typename == 'Video')
              .map((a) => ({
                id: a?.media?.id,
                previewImage: a?.media?.image,
                videoUrl: a?.media?.playable_url,
                videoUrlHD: a?.media?.playable_url_quality_hd,
              }))
          )
        }
        const interactions =
          node?.comet_sections?.feedback?.story?.feedback_context
            ?.feedback_target_with_context?.ufi_renderer?.feedback
            ?.comet_ufi_summary_and_actions_renderer?.feedback
        const likes = interactions?.reaction_count?.count || 0
        const comments = interactions?.comment_count?.total_count || 0
        const shares = interactions?.share_count?.count || 0
        const postedAt = new Date(
          node?.comet_sections?.context_layout?.story?.comet_sections?.metadata?.find(
            (m) => m?.story?.creation_time
          )?.story.creation_time * 1000
        )
        const isPublic =
          node?.comet_sections?.context_layout?.story?.comet_sections?.metadata?.find(
            (m) => m?.story?.privacy_scope?.icon_image?.name
          )?.story?.privacy_scope?.icon_image?.name == 'everyone'

        posts.push({
          id,
          author,
          textContent,
          link,
          images,
          videos,
          likes,
          comments,
          shares,
          postedAt,
          isPublic,
        })
      }
    }
    const nextCursor =
      item?.data?.page_info?.end_cursor ||
      item?.data?.node?.timeline_feed_units?.page_info?.end_cursor ||
      item?.data?.node?.timeline_list_feed_units?.page_info?.end_cursor ||
      item?.data?.node?.group_feed?.page_info?.end_cursor ||
      item?.data?.page?.timeline_feed_units?.page_info?.end_cursor ||
      item?.data?.user?.timeline_list_feed_units?.page_info?.end_cursor ||
      item?.data?.group?.group_feed?.page_info?.end_cursor

    if (nextCursor) {
      nextCursors.push(
        nextCursor
      )
    }
  }
  return { posts, nextCursors }
}

export const normalizeResponse = (res) => {
  if (res.startsWith('for (;;);')) {
    res = res.replace('for (;;);', '')
  }
  try {
    return JSON.parse(`[${res.replace(/\}(\s*\n*)*\{/g, '},{')}]`)
  } catch (error) {
    console.log('Error while normalizing response: ', error)
    console.log(res)
    return res
  }
}
