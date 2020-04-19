const csv = require('csv-parser');
const fs = require('fs');
const _ = require('lodash');

const primaryChampionships = [
  'wwe universal', 'wwe', 'wwe world heavyweight', 'ecw world',
];
const secondaryChampionships = [
  'wwe intercontinental', 'wwe united states', 'wwe hardcore', 'nxt',
];
const tertiaryChampionships = [
  'wwe cruserweight', 'wwe united kingdom', 'wwe european', 'nxt north american'
];
const tagTeamChampionships = [
  'wwe universal tag team', 'wwe/wwe smackdown tag team', 'wwe world/wwe raw tag team', 'nxt tag team',
];
const womenChampionships = [
  'wwe divas', 'wwe raw women', 'wwe smackdown women', 'nxt women'
];
const womenTagTeamChampionships = [
  'wwe women tag team'
];

class Template {
  static male() {
    const obj = {};
    obj['points'] = 0;
    obj['primary'] = 0;
    obj['secondary'] = 0;
    obj['tertiary'] = 0;
    obj['tagteam'] = 0;
    primaryChampionships.forEach(c => obj[c] = 0);
    secondaryChampionships.forEach(c => obj[c] = 0);
    tertiaryChampionships.forEach(c => obj[c] = 0);
    tagTeamChampionships.forEach(c => obj[c] = 0);
    return obj;
  }

  static female() {
    const obj = {};
    obj['points'] = 0;
    obj['primary'] = 0;
    obj['tagteam'] = 0;
    womenChampionships.forEach(c => obj[c] = 0);
    womenTagTeamChampionships.forEach(c => obj[c] = 0);
    return obj;
  }
}

class FileHandler {
  readCsv() {
    const events = [];
    const filepath = 'data/events.csv';
    const stream = fs.createReadStream(filepath).pipe(csv());
    return new Promise((resolve, reject) => {
      stream.on('data', (row) => events.push(row));
      stream.on('end', () => resolve(events));
    });
  }

  writeJson(filename, data) {
    const writeStream = fs.createWriteStream(`out/${filename}.json`);
    writeStream.write(JSON.stringify(data));
    writeStream.on('finish', () => {
      console.log('updated in json '+filename);
    });
    writeStream.end();
  }

  writeCsv(filename, data) {
    const writeStream = fs.createWriteStream(`out/${filename}.csv`);
    let i = 0;
    const headers = ['wrestler'];
    Object.keys(data).forEach((key) => {
      const championships = data[key];
      const values = [];
      values.push(key);
      if (i === 0) {
        Object.keys(championships).forEach(c => headers.push(c));
        writeStream.write(headers.join(',')+'\n');
        i++;
      }
      Object.keys(championships).forEach((c) => {
        values.push(championships[c]);
      });
      writeStream.write(values.join(',')+'\n');
    });
    writeStream.on('finish', () => {
      console.log('updated in csv '+filename);
    });
    writeStream.end();
  }
}

class WWE {
  constructor() {
    this.fileHandler = new FileHandler();
  }

  calculatePoints(maleWrestlers, femaleWrestlers) {
    let p, s, t, tt;
    Object.keys(maleWrestlers).forEach((key) => {
      p = s = t = tt = 0;
      const wrestler = maleWrestlers[key];
      primaryChampionships.forEach(c => p+=wrestler[c]);
      secondaryChampionships.forEach(c => s+=wrestler[c]);
      tertiaryChampionships.forEach(c => t+=wrestler[c]);
      tagTeamChampionships.forEach(c => tt+=wrestler[c]);
      wrestler['primary'] = p;
      wrestler['secondary'] = s;
      wrestler['tertiary'] = t;
      wrestler['tagteam'] = tt;
      wrestler['points'] = 3*p + 2*s + t + tt;
    });
    Object.keys(femaleWrestlers).forEach((key) => {
      p = tt = 0;
      const wrestler = femaleWrestlers[key];
      womenChampionships.forEach(c => p+=wrestler[c]);
      womenTagTeamChampionships.forEach(c => tt+=wrestler[c]);
      wrestler['primary'] = p;
      wrestler['tagteam'] = tt;
      wrestler['points'] = 2*p + tt;
    });
  }

  evaluate(events, maleWrestlers, femaleWrestlers) {
    const singleChampionships = [primaryChampionships, secondaryChampionships, tertiaryChampionships];
    events.forEach((row) => {
      console.log(`Evaluating event: ${row.Event}`);
      singleChampionships.forEach((championshipType) => {
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
      womenChampionships.forEach((championship) => {
        const wrestler = row[championship];
        if (row[championship]) {
          if (!femaleWrestlers.hasOwnProperty(wrestler)) {
            femaleWrestlers[wrestler] = Template.female();
          }
          femaleWrestlers[wrestler][championship]++;
        }
      });
      tagTeamChampionships.forEach((championship) => {
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
      womenTagTeamChampionships.forEach((championship) => {
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

  async process() {
    const events = await this.fileHandler.readCsv();
    let maleWrestlers = {};
    let femaleWrestlers = {};
    this.evaluate(events, maleWrestlers, femaleWrestlers);
    this.calculatePoints(maleWrestlers, femaleWrestlers);

    // maleWrestlers = _.sortBy(maleWrestlers, ['points', 'primary', 'secondary', 'tertiary', 'tagteam']);
    // femaleWrestlers = _.sortBy(femaleWrestlers, ['points', 'primary', 'tagteam']);

    this.fileHandler.writeCsv('male', maleWrestlers);
    this.fileHandler.writeCsv('female', femaleWrestlers);
  }
}

module.exports = WWE;

(function () {
  const wwe = new WWE();
  wwe.process().then(() => console.log('done'));
})();