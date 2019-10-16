import parseFilters from '../utils/parseFilters';

export default ({
  model,
  preSearch = (_, x) => x,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filter = '{}',
  } = ctx.request.query;

  const parsedFilter = parseFilters(filter);

  const totalSearchQuery = await preSearch(ctx, {
    ...searchQuery(ctx),
    ...parsedFilter,
    isRemoved: { $ne: true },
  });

  const total = await model.countDocuments(totalSearchQuery);

  ctx.body = {
    total,
  };
};
