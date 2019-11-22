export default ({
  model, removedKey = 'isRemoved', preDelete = ctx => ctx.params.id, postDelete,
}) => async (ctx) => {
  const _id = await preDelete(ctx);

  await model.updateOne({ _id }, { $set: { [removedKey]: true } });
  ctx.status = 200;

  if (postDelete) {
    const item = await model.findOne({ _id });
    await postDelete(item);
  }
};
