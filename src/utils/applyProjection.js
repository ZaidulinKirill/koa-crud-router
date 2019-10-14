export default (keys = []) => {
  if (!keys.length) {
    return {};
  }

  return Object.assign({ _id: 1, isRemoved: 1 }, ...keys.map(column => ({
    [column]: 1,
  })));
};
