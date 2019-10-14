export default ({ model, removedKey = 'isRemoved' }) => async (ctx) => {
  await model.updateOne({
    ...(ctx.request.query || {}),
    [removedKey]: { $ne: true },
  }, { $set: { [removedKey]: true } });
  ctx.status = 200;
};
