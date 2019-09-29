import ObjectID from "bson-objectid";

export default (model, query = {}) => {
  return Object.entries(query)
    .map(([key, value]) => {
      const propertyPath = model.schema.path(key);
      if (!propertyPath) throw ModelError.INVALID_FILTER_PROPERTY;

      if (propertyPath.instance === 'ObjectID') {
        return [key, ObjectID(value)]
      } else {
        return [key, value]
      }
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}