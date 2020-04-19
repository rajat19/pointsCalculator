const csv = require('csv-parser');
const fs = require('fs');

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
  'wwe women\'s tag team'
];

function maleTemplate() {
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
  
  function femaleTemplate() {
    const obj = {};
    obj['points'] = 0;
    obj['primary'] = 0;
    obj['tagteam'] = 0;
    womenChampionships.forEach(c => obj[c] = 0);
    womenTagTeamChampionships.forEach(c => obj[c] = 0);
    return obj;
  }
  
  function writeToJsonFile(filename, data) {
    const writeStream = fs.createWriteStream(filename+'.json');
    writeStream.write(JSON.stringify(data));
    writeStream.on('finish', () => {
      console.log('updated in json '+filename);
    });
    writeStream.end();
  }
  
  function writeToCsvFile(filename, data) {
    const writeStream = fs.createWriteStream(filename+'.csv');
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
  
  function process() {
    const maleWrestlers = {};
    const femaleWrestlers = {};
    const singleChampionships = [primaryChampionships, secondaryChampionships, tertiaryChampionships];
  
    fs.createReadStream('data/events.csv').pipe(csv())
        .on('data', (row) => {
          console.log(`Evaluating event: ${row.Event}`);
          singleChampionships.forEach((championshipType) => {
            championshipType.forEach((championship) => {
              const wrestler = row[championship];
              if(row[championship]) {
                if (!maleWrestlers.hasOwnProperty(wrestler)) {
                  maleWrestlers[wrestler] = maleTemplate();
                }
                maleWrestlers[wrestler][championship]++;
              }
            })
          });
          womenChampionships.forEach((championship) => {
            const wrestler = row[championship];
            if (row[championship]) {
              if (!femaleWrestlers.hasOwnProperty(wrestler)) {
                femaleWrestlers[wrestler] = femaleTemplate();
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
                maleWrestlers[wrestler1] = maleTemplate();
              }
              if (!maleWrestlers.hasOwnProperty(wrestler2)) {
                maleWrestlers[wrestler2] = maleTemplate();
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
                femaleWrestlers[wrestler1] = femaleTemplate();
              }
              if (!femaleWrestlers.hasOwnProperty(wrestler2)) {
                femaleWrestlers[wrestler2] = femaleTemplate();
              }
              femaleWrestlers[wrestler1][championship]++;
              femaleWrestlers[wrestler2][championship]++;
            }
          });
        }).on('end', () => {
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
          writeToCsvFile('out/male', maleWrestlers);
          writeToCsvFile('out/female', femaleWrestlers);
          // writeToJsonFile('male', maleWrestlers);
          // writeToJsonFile('female', femaleWrestlers);
    });
  }
  
  module.exports = process();
  
  (function () {
    process();
  })();