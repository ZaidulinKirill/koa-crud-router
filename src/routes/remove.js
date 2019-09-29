export default ({ model, removedKey = 'isRemoved' }) => async (ctx) => {
  await model.updateOne({ _id: ctx.params.id }, { $set: { [removedKey]: true } });
  ctx.status = 200;
};
