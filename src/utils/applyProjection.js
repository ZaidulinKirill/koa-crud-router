export default (item, keys = []) => {
  if (!keys.length) {
    return item;
  }

  return Object.assign({ _id: item._id, isRemoved: item.isRemoved }, ...keys.map(column => ({
    [column]: item[column],
  })));
};
