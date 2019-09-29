export default ({
  model,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filter = '{}',
  } = ctx.request.query;

  const totalSearchQuery = {
    ...searchQuery(ctx),
    ...JSON.parse(filter),
    isRemoved: { $ne: true },
  };

  const total = await model.countDocuments(totalSearchQuery);

  ctx.body = {
    total,
  };
};
