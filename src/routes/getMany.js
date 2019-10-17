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
}) => async (ctx) => {
  const {
    sortBy, sortDesc, page = 1, itemsPerPage = '-1', columns: columnsQuery = '', filter = '{}',
  } = ctx.request.query;

  const parsedFilter = parseFilters(filter);

  const query = {
    ...searchQuery(ctx),
    ...parsedFilter,
    isRemoved: { $ne: true },
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

  const [items, total] = await Promise.all([
    model
      .aggregate([
        ...startPipeline,
        { $match: totalSearchQuery },
        sortBy && { $sort: { [sortBy]: sortDesc === 'true' ? -1 : 1 } },
        itemsPerPage !== '-1' && { $skip: (page - 1) * parseInt(itemsPerPage, 10) },
        itemsPerPage !== '-1' && { $limit: parseInt(itemsPerPage, 10) },
        columns && columns.length && { $project: applyProjection(columns) },
      ].filter(x => !!x))
      .collation({ locale: 'ru' }),

    model
      .aggregate([
        ...startPipeline,
        { $match: totalSearchQuery },
        { $count: 'count' },
      ]).then(({ count }) => count),
  ]);

  ctx.body = {
    items: postGetMany(items),
    total,
  };
};


// {
//   $lookup: {
//     from: 'authors',
//     let: { authorId: '$author' },
//     pipeline: [{
//       $match: {
//         $expr: {
//           $eq: ['$_id', '$$authorId'],
//         },
//       },
//     }],
//     as: 'author',
//   },
// },
// { $unwind: '$author' },
// { $match: activeAuthors ? { 'author.isActive': 'Yes' } : {} }
