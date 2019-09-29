export default (keys) => {
  if (!keys) {
    return {}
  }

  const columns = keys.split(',').map(x => x.trim())

  return Object.assign({ _id: 1, isRemoved: 1 }, ...columns.map(column => ({
    [column]: 1
  })))
}
