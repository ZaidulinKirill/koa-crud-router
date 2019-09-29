export default ({
  model,
  searchQuery = () => {},
}) => async (ctx) => {
  const {
    filters = [],
  } = ctx.request.body;

  const totalSearchQuery = filter => ({
    ...searchQuery(ctx),
    ...filter,
    isRemoved: { $ne: true },
  });

  const totals = await Promise.all(
    filters.map(filter => model.countDocuments(totalSearchQuery(filter))),
  );

  ctx.body = {
    totals,
  };
};
