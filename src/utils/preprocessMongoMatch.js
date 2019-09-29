import ObjectID from 'bson-objectid';

export default (model, query = {}) => Object.entries(query)
  .map(([key, value]) => {
    const propertyPath = model.schema.path(key);
    if (!propertyPath) throw new Error('Invalid property');

    if (propertyPath.instance === 'ObjectID') {
      return [key, ObjectID(value)];
    }
    return [key, value];
  })
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
