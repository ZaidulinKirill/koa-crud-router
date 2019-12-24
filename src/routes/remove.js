import parseFilters from '../utils/parseFilters';

export default ({
  model, removedKey = 'isRemoved',
}) => async (ctx) => {
  const query = (ctx.request.query || {});
  await model.updateOne({
    ...Object.assign({}, ...Object.entries(query).map(([key, value]) => ({
      [key]: parseFilters(value || '{}'),
    }))),
    [removedKey]: { $ne: true },
  }, { $set: { [removedKey]: true } });
  ctx.status = 200;
};
