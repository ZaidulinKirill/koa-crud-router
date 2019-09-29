export default ({ model, preCreate = x => x.request.body, postCreate }) => async (ctx) => {
  ctx.body = await model.create(await preCreate(ctx));

  if (postCreate) {
    await postCreate(ctx.body);
  }
};
