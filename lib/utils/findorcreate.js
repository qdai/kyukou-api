'use strict';

/**
 * @this Model
 * @param {Object} query - Query.
 * @param {Object} doc - Doc.
 * @returns {Object} Doc.
 */
const findOrCreate = async function findOrCreate (query, doc) {
  const Model = this;
  const result = await Model.findOne(query).lean().exec();
  if (result) {
    return [result, false];
  }
  const model = new Model(doc);
  const saveResult = await model.save();
  return [saveResult.toObject(), true];
};

module.exports = schema => {
  schema.static('findOrCreate', findOrCreate);
};
