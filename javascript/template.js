const constants = require('./constants');

class Template {
  static male(championships) {
    const obj = {};
    constants.maleFields.forEach(field => obj[field] = 0);
    championships.forEach(c => obj[c] = 0);
    return obj;
  }

  static female(championships) {
    const obj = {};
    constants.femaleFields.forEach(field => obj[field] = 0);
    championships.forEach(c => obj[c] = 0);
    return obj;
  }
}

module.exports = Template;
