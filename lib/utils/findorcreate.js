'use strict';

/**
 * @param {object} query - Query.
 * @param {object} doc - Doc.
 * @returns {object} Doc.
 * @this Model
 */
const findOrCreate = async function findOrCreate (query, doc) {
  // eslint-disable-next-line consistent-this
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
