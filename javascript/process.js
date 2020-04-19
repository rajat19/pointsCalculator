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
    this.singleChampionships = [
      this.primaryChampionships,
      this.secondaryChampionships,
      this.tertiaryChampionships,
    ];
  }

  calculatePoints(maleWrestlers, femaleWrestlers) {
    let p, s, t, tt;
    Object.keys(maleWrestlers).forEach((key) => {
      p = s = t = tt = 0;
      const wrestler = maleWrestlers[key];
      this.primaryChampionships.forEach(c => p+=wrestler[c]);
      this.secondaryChampionships.forEach(c => s+=wrestler[c]);
      this.tertiaryChampionships.forEach(c => t+=wrestler[c]);
      this.tagTeamChampionships.forEach(c => tt+=wrestler[c]);
      wrestler['primary'] = p;
      wrestler['secondary'] = s;
      wrestler['tertiary'] = t;
      wrestler['tag_team'] = tt;
      wrestler['points'] = 3*p + 2*s + t + tt;
    });
    Object.keys(femaleWrestlers).forEach((key) => {
      p = tt = 0;
      const wrestler = femaleWrestlers[key];
      this.womenChampionships.forEach(c => p+=wrestler[c]);
      this.womenTagTeamChampionships.forEach(c => tt+=wrestler[c]);
      wrestler['primary'] = p;
      wrestler['tag_team'] = tt;
      wrestler['points'] = 2*p + tt;
    });
  }

  evaluate(events, maleWrestlers, femaleWrestlers) {
    events.forEach((row) => {
      console.log(`Evaluating event: ${row.Event}`);
      this.singleChampionships.forEach((championshipType) => {
        championshipType.forEach((championship) => {
          const wrestler = row[championship];
          if(row[championship]) {
            if (!maleWrestlers.hasOwnProperty(wrestler)) {
              maleWrestlers[wrestler] = Template.male();
            }
            maleWrestlers[wrestler][championship]++;
          }
        })
      });
      this.womenChampionships.forEach((championship) => {
        const wrestler = row[championship];
        if (row[championship]) {
          if (!femaleWrestlers.hasOwnProperty(wrestler)) {
            femaleWrestlers[wrestler] = Template.female();
          }
          femaleWrestlers[wrestler][championship]++;
        }
      });
      this.tagTeamChampionships.forEach((championship) => {
        if(row[championship]) {
          const x = row[championship].split('\/');
          const wrestler1 = x[0];
          const wrestler2 = x[1];
          if (!maleWrestlers.hasOwnProperty(wrestler1)) {
            maleWrestlers[wrestler1] = Template.male();
          }
          if (!maleWrestlers.hasOwnProperty(wrestler2)) {
            maleWrestlers[wrestler2] = Template.male();
          }
          maleWrestlers[wrestler1][championship]++;
          maleWrestlers[wrestler2][championship]++;
        }
      });
      this.womenTagTeamChampionships.forEach((championship) => {
        if(row[championship]) {
          const x = row[championship].split('\/');
          const wrestler1 = x[0];
          const wrestler2 = x[1];
          if (!femaleWrestlers.hasOwnProperty(wrestler1)) {
            femaleWrestlers[wrestler1] = Template.female();
          }
          if (!femaleWrestlers.hasOwnProperty(wrestler2)) {
            femaleWrestlers[wrestler2] = Template.female();
          }
          femaleWrestlers[wrestler1][championship]++;
          femaleWrestlers[wrestler2][championship]++;
        }
      });
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
    const maleWrestlers = {};
    const femaleWrestlers = {};
    this.evaluate(events, maleWrestlers, femaleWrestlers);
    this.calculatePoints(maleWrestlers, femaleWrestlers);

    const maleWrestlersArr = this.getSortedArrFromObj(maleWrestlers, constants.maleFields);
    const femaleWrestlersArr = this.getSortedArrFromObj(femaleWrestlers, constants.femaleFields);

    FileHandler.writeCsv('male', maleWrestlersArr);
    FileHandler.writeCsv('female', femaleWrestlersArr);
  }
}

module.exports = WWE;

(function () {
  const wwe = new WWE();
  wwe.process().then(() => console.log('done'));
})();
