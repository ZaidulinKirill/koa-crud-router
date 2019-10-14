export default ({
  model,
  preSearch = (_, x) => x,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filters = [],
  } = ctx.request.body;

  const totalSearchQuery = async filter => ({
    ...await preSearch(ctx, searchQuery(ctx)),
    ...filter,
    isRemoved: { $ne: true },
  });

  const totals = await Promise.all(
    filters.map(async (filter) => {
      const query = await totalSearchQuery(filter);
      return model.countDocuments(query);
    }),
  );

  ctx.body = {
    totals,
  };
};
