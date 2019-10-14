import applyProjection from '../utils/applyProjection';

export default ({
  model,
  searchQuery = () => {},
  briefColumns = '_id',
  postGet = x => x,
  preSearch = (_, x) => x,
  includedColumns = '',
}) => async (ctx) => {
  const {
    sortBy, sortDesc, page = 1, itemsPerPage = '-1', columns: columnsQuery = '', filter = '{}',
  } = ctx.request.query;

  const totalSearchQuery = await preSearch(ctx, {
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true },
  });

  const columns = [
    ...(columnsQuery.length
      ? (columnsQuery !== 'brief' ? columnsQuery : briefColumns).split(',').map(x => x.trim())
      : []),
    ...(includedColumns.length ? (includedColumns || '').split(',').map(x => x.trim()) : []),
  ];

  const [items, total] = await Promise.all([
    model
      .aggregate([
        { $match: totalSearchQuery },
        sortBy && { $sort: { [sortBy]: sortDesc === 'true' ? -1 : 1 } },
        itemsPerPage !== '-1' && { $skip: (page - 1) * parseInt(itemsPerPage, 10) },
        itemsPerPage !== '-1' && { $limit: parseInt(itemsPerPage, 10) },
        columns && columns.length && { $project: applyProjection(columns) },
      ].filter(x => !!x))
      .collation({ locale: 'ru' }),

    model.countDocuments(totalSearchQuery),
  ]);

  ctx.body = {
    items: items
      .map(x => postGet(x)),
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
