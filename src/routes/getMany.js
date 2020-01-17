import applyProjection from '../utils/applyProjection';
import parseFilters from '../utils/parseFilters';

export default ({
  model,
  searchQuery = () => {},
  briefColumns = '_id',
  postGetMany = x => x,
  preMatch = () => [],
  preSearch = (_, x) => x,
  includedColumns = '',
  postResponse,
}) => async (ctx) => {
  const {
    sortBy, sortDesc, page = 1, itemsPerPage = '-1', columns: columnsQuery = '', filter = '{}', includeRemoved,
  } = ctx.request.query;

  const parsedFilter = parseFilters(filter);

  const query = {
    ...searchQuery(ctx),
    ...parsedFilter,
    ...includeRemoved !== 'true' ? { isRemoved: { $ne: true } } : {},
  };

  const [startPipeline, totalSearchQuery] = await Promise.all([
    preMatch(ctx, query),
    preSearch(ctx, query),
  ]);

  const columns = [
    ...(columnsQuery.length
      ? (columnsQuery !== 'brief' ? columnsQuery : briefColumns).split(',').map(x => x.trim())
      : []),
    ...(includedColumns.length ? (includedColumns || '').split(',').map(x => x.trim()) : []),
  ];

  const itemsQuery = [
    sortBy && { $sort: { [sortBy]: sortDesc === 'true' ? -1 : 1 } },
    itemsPerPage !== '-1' && { $skip: (page - 1) * parseInt(itemsPerPage, 10) },
    itemsPerPage !== '-1' && { $limit: parseInt(itemsPerPage, 10) },
    columns && columns.length && { $project: applyProjection(columns) },
  ].filter(x => !!x);

  if (itemsQuery.length) {
    const [{ count: [totalInfo], items }] = await model.aggregate([
      ...startPipeline,
      { $match: totalSearchQuery },
      {
        $facet: {
          count: [
            { $count: 'total' },
          ],
          items: itemsQuery,
        },
      },
    ]).collation({ locale: 'ru' });

    const totalItems = await postGetMany(items)
    const totalCount = (totalInfo || {}).total || 0

    if (postResponse) {
      postResponse(ctx, totalItems, totalCount)
    } else {
      ctx.body = {
        items: totalItems,
        total: totalCount,
      };
    }
  } else {
    const items = await model.aggregate([
      ...startPipeline,
      { $match: totalSearchQuery },
    ]).collation({ locale: 'ru' });

    const totalItems = await postGetMany(items)
    const totalCount = items.length

    if (postResponse) {
      postResponse(ctx, totalItems, totalCount)
    } else {
      ctx.body = {
        items: totalItems,
        total: totalCount,
      };
    }
  }
};
