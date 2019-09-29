import applyProjection from '../utils/applyProjection'

export default ({
  model,
  searchQuery = () => {},
  briefColumns = '_id'
}) => async (ctx) => {
  const {
    sortBy, sortDesc, page = 1, itemsPerPage = '-1', columns, filter = '{}', postGet = x => x
  } = ctx.request.query

  const totalSearchQuery = {
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true }
  }

  const [items, total] = await Promise.all([
    model
      .aggregate([
        { $match: totalSearchQuery },
        sortBy && { [sortBy]: sortDesc === 'true' ? -1 : 1 },
        itemsPerPage !== '-1' && { $skip: (page - 1) * parseInt(itemsPerPage, 10) },
        itemsPerPage !== '-1' && { $limit: parseInt(itemsPerPage, 10) },
        columns && { $project: applyProjection(columns === 'brief' ? briefColumns : columns) }
      ].filter(x => !!x))
      .collation({ locale: 'ru' }),

    model.countDocuments(totalSearchQuery)
  ])

  ctx.body = {
    items: items
      .map(x => postGet(x)),
    total
  }
}
