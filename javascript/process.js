const _ = require('lodash');

const constants = require('./constants');
const FileHandler = require('./file');
const Template = require('./template');

class WWE {
  constructor() {
    const championships = FileHandler.readJson('championships');
    this.primaryChampionships = championships.primary;
    this.secondaryChampionships = championships.secondary;
    this.tertiaryChampionships = championships.tertiary;
    this.tagTeamChampionships = championships.tag_team;
    this.womenChampionships = championships.women;
    this.womenTagTeamChampionships = championships.women_tag_team;
    this.singleChampionships = []
        .concat(this.primaryChampionships)
        .concat(this.secondaryChampionships)
        .concat(this.tertiaryChampionships);
    this.maleChampionships = this.singleChampionships
        .concat(this.tagTeamChampionships);
    this.femaleChampionships = []
        .concat(this.womenChampionships)
        .concat(this.womenTagTeamChampionships);
    this.maleWrestlers = {};
    this.femaleWrestlers = {};
  }

  calculatePoints() {
    let p, s, t, tt;
    Object.keys(this.maleWrestlers).forEach((key) => {
      p = s = t = tt = 0;
      const wrestler = this.maleWrestlers[key];
      this.primaryChampionships.forEach(c => p+=wrestler[c]);
      this.secondaryChampionships.forEach(c => s+=wrestler[c]);
      this.tertiaryChampionships.forEach(c => t+=wrestler[c]);
      this.tagTeamChampionships.forEach(c => tt+=wrestler[c]);
      wrestler['primary'] = p;
      wrestler['secondary'] = s;
      wrestler['tertiary'] = t;
      wrestler['tag_team'] = tt;
      wrestler['points'] = 3*p + 2*s + t + tt;
      wrestler['total'] = p + s + t + tt;
    });
    Object.keys(this.femaleWrestlers).forEach((key) => {
      p = tt = 0;
      const wrestler = this.femaleWrestlers[key];
      this.womenChampionships.forEach(c => p+=wrestler[c]);
      this.womenTagTeamChampionships.forEach(c => tt+=wrestler[c]);
      wrestler['primary'] = p;
      wrestler['tag_team'] = tt;
      wrestler['points'] = 2*p + tt;
      wrestler['total'] = p + tt;
    });
  }

  addChampionshipToWrestler(wrestlers, wrestler, template, championship) {
    if (!wrestlers.hasOwnProperty(wrestler)) {
      wrestlers[wrestler] = Object.assign({}, template);
    }
    wrestlers[wrestler][championship]++;
  }

  evaluateSingleChampionship(row, wrestlers, template, championships) {
    championships.forEach((championship) => {
      const wrestler = row[championship];
      if(row[championship]) {
        this.addChampionshipToWrestler(wrestlers, wrestler, template, championship);
      }
    });
  }

  evaluateTagTeamChampionship(row, wrestlers, template, championships) {
    championships.forEach((championship) => {
      if(row[championship]) {
        const x = row[championship].split('\/');
        const wrestler1 = x[0];
        const wrestler2 = x[1];
        this.addChampionshipToWrestler(wrestlers, wrestler1, template, championship);
        this.addChampionshipToWrestler(wrestlers, wrestler2, template, championship);
      }
    });
  }

  evaluate(events) {
    const maleTemplate = Template.male(this.maleChampionships);
    const femaleTemplate = Template.female(this.femaleChampionships);
    Object.freeze(maleTemplate);
    Object.freeze(femaleTemplate);
    events.forEach((row) => {
      console.log(`Evaluating event: ${row.Event}`);
      this.evaluateSingleChampionship(row, this.maleWrestlers, maleTemplate, this.singleChampionships);
      this.evaluateSingleChampionship(row, this.femaleWrestlers, femaleTemplate, this.womenChampionships);
      this.evaluateTagTeamChampionship(row, this.maleWrestlers, maleTemplate, this.tagTeamChampionships);
      this.evaluateTagTeamChampionship(row, this.femaleWrestlers, femaleTemplate, this.womenTagTeamChampionships);
    });
  }

  getSortedArrFromObj(wrestlersObj, sortBy) {
    const wrestlerArr = [];
    Object.keys(wrestlersObj).forEach((key) => {
      const obj = { wrestler: key };
      Object.assign(obj, wrestlersObj[key]);
      wrestlerArr.push(obj);
    });

    const order = Array(sortBy.length).fill('desc');
    return _.orderBy(wrestlerArr, sortBy, order);
  }

  async process() {
    const events = await FileHandler.readCsv('events');
    this.evaluate(events);
    this.calculatePoints();

    const maleWrestlersArr = this.getSortedArrFromObj(this.maleWrestlers, constants.maleFields);
    const femaleWrestlersArr = this.getSortedArrFromObj(this.femaleWrestlers, constants.femaleFields);

    FileHandler.writeCsv('male', maleWrestlersArr);
    FileHandler.writeCsv('female', femaleWrestlersArr);
    FileHandler.writeJson('male', maleWrestlersArr);
    FileHandler.writeJson('female', femaleWrestlersArr);
  }
}

module.exports = WWE;

(function () {
  const wwe = new WWE();
  wwe.process().then(() => console.log('done'));
})();
