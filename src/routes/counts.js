import parseFilters from '../utils/parseFilters';

export default ({
  model,
  preSearch = (_, x) => x,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filters = [],
  } = ctx.request.body;

  const parsedFilters = parseFilters(JSON.stringify(filters));

  const totalSearchQuery = async filter => ({
    ...await preSearch(ctx, searchQuery(ctx)),
    ...filter,
    isRemoved: { $ne: true },
  });

  const totals = await Promise.all(
    parsedFilters.map(async (filter) => {
      const query = await totalSearchQuery(filter);
      return model.countDocuments(query);
    }),
  );

  ctx.body = {
    totals,
  };
};
