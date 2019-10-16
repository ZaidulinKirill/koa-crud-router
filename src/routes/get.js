export default ({ model, postGet = x => x }) => async (ctx) => {
  ctx.body = await postGet(await model.findById(ctx.params.id));
};
