import ObjectID from 'bson-objectid';

export default filter => JSON.parse(filter, (name, value) => {
  if (value.startsWith && value.startsWith('_(') && value.endsWith(')')) {
    return ObjectID(value.replace('_(', '').replace(')', ''));
  }

  if (value.startsWith && value.startsWith('_d(') && value.endsWith(')')) {
    return new Date(value.replace('_d(', '').replace(')', ''));
  }

  return value;
});
