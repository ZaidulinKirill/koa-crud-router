import ObjectID from 'bson-objectid';

export default filter => JSON.parse(filter, (name, value) => {
  if (value.startsWith && value.startsWith('_(') && value.endsWith(')')) {
    return ObjectID(value.replace('_(', '').replace(')', ''));
  }

  return value;
});
