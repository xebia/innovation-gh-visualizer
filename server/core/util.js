module.exports.dropKey = function dropKey(obj, key) {
  const result = Object.assign({}, obj);
  delete result[key];

  return result;
};