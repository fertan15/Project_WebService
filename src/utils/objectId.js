const { ObjectId } = require("mongodb");

const isValidObjectId = (id) => {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
};

const toObjectId = (id) => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return new ObjectId(id);
};

module.exports = {
  isValidObjectId,
  toObjectId,
};
