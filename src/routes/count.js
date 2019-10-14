export default ({
  model,
  preSearch = x => x,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filter = '{}',
  } = ctx.request.query;

  const totalSearchQuery = await preSearch({
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true },
  });

  const total = await model.countDocuments(totalSearchQuery);

  ctx.body = {
    total,
  };
};
