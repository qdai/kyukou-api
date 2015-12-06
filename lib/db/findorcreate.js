'use strict';

module.exports = schema => {
  schema.static('findOrCreate', function (query, doc) {
    const Model = this; // eslint-disable-line no-invalid-this
    return Model.findOne(query).lean().exec().then(result => {
      if (result) {
        return [result, false];
      } else {
        const model = new Model(doc);
        return model.save().then(saveResult => {
          return [saveResult.toObject(), true];
        });
      }
    });
  });
};
