export default ({
  model,
  preSearch = (_, x) => x,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filter = '{}',
  } = ctx.request.query;

  const totalSearchQuery = await preSearch(ctx, {
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true },
  });

  const total = await model.countDocuments(totalSearchQuery);

  ctx.body = {
    total,
  };
};
