'use strict';

/**
 * @this Model
 * @param {object} query - Query
 * @param {object} doc - Doc
 * @param {object} projection - Projection
 * @return {object} Doc
 */
const findOrCreate = function findOrCreate (query, doc, projection) {
  const Model = this;
  const findOne = () => Model.findOne(query, projection).exec();
  return findOne().then(result => {
    if (result) {
      return [result, false];
    }
    const model = new Model(doc);
    return model.save().then(findOne).then(saveResult => {
      return [saveResult, true];
    });
  });
};

module.exports = schema => {
  schema.static('findOrCreate', findOrCreate);
};
