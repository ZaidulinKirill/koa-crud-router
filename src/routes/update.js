export default ({ model, preUpdate = x => x.request.body, postUpdate }) => async (ctx) => {
  const body = await preUpdate(ctx);
  const { _id } = body;

  const oldValue = postUpdate ? await model.findById(_id).lean() : null;

  ctx.body = await model.findByIdAndUpdate(_id, body, { new: postUpdate !== null });

  if (postUpdate) {
    await postUpdate(ctx.body, oldValue);
  }
};
