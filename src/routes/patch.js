export default ({ model, prePatch = x => x.request.body, postPatch }) => async (ctx) => {
  const { op, path, value } = await prePatch(ctx);
  const { id } = ctx.params;

  const oldValue = postPatch ? await model.findById(id).lean() : null;

  switch (op) {
    case 'replace': {
      ctx.body = await model.findByIdAndUpdate(id, {
        $set: {
          [path.replace('/', '')]: value,
        },
      }, { new: postPatch !== null });
      break;
    }
    default: {
      throw new Error('Not implemented');
    }
  }

  if (postPatch) {
    await postPatch(ctx.body, oldValue);
  }
};
