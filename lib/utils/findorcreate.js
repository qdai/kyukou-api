'use strict';

/**
 * @this Model
 * @param {object} query - Query
 * @param {object} doc - Doc
 * @return {object} Doc
 */
const findOrCreate = function findOrCreate (query, doc) {
  const Model = this;
  return Model.findOne(query).lean().exec()
    .then(result => {
      if (result) {
        return [result, false];
      }
      const model = new Model(doc);
      return model.save()
        .then(saveResult => [saveResult.toObject(), true]);
    });
};

module.exports = schema => {
  schema.static('findOrCreate', findOrCreate);
};
