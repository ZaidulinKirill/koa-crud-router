import applyProjection from '../utils/applyProjection';

export default ({
  model,
  searchQuery = () => {},
  briefColumns = '_id',
  postGet = x => x,
  includedColumns = '',
}) => async (ctx) => {
  const {
    sortBy, sortDesc, page = 1, itemsPerPage = '-1', columns: columnsQuery = '', filter = '{}',
  } = ctx.request.query;

  const totalSearchQuery = {
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true },
  };


  const columns = [
    ...(columnsQuery.length
      ? (columnsQuery !== 'brief' ? columnsQuery : briefColumns).split(',').map(x => x.trim())
      : []),
    ...(includedColumns.length ? (includedColumns || '').split(',').map(x => x.trim()) : []),
  ];

  const [items, total] = await Promise.all([
    model
      .find(totalSearchQuery)
      .collation({ locale: 'ru' })
      .sort(sortBy && { [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip(itemsPerPage !== '-1' ? (page - 1) * parseInt(itemsPerPage, 10) : 0)
      .limit(itemsPerPage !== '-1' ? parseInt(itemsPerPage, 10) : 0),
    model.countDocuments(totalSearchQuery),
  ]);

  ctx.body = {
    items: items
      .map(x => applyProjection(x, columns))
      .map(x => postGet(x)),
    total,
  };
};
