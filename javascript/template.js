const constants = require('./constants');
const FileHandler = require('./file');

const championships = FileHandler.readJson('championships');

class Template {
  static male() {
    const obj = {};
    constants.maleFields.forEach(field => obj[field] = 0);
    championships.primary.forEach(c => obj[c] = 0);
    championships.secondary.forEach(c => obj[c] = 0);
    championships.tertiary.forEach(c => obj[c] = 0);
    championships.tag_team.forEach(c => obj[c] = 0);
    return obj;
  }

  static female() {
    const obj = {};
    constants.femaleFields.forEach(field => obj[field] = 0);
    championships.women.forEach(c => obj[c] = 0);
    championships.women_tag_team.forEach(c => obj[c] = 0);
    return obj;
  }
}

module.exports = Template;
