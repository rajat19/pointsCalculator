const csv = require('fast-csv');
const fs = require('fs');

class FileHandler {
  static readCsv(filename) {
    const data = [];
    const filepath = `./data/${filename}.csv`;
    return new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csv.parse({headers: true}))
        .on('data', row => data.push(row))
        .on('error', err => reject(err))
        .on('end', () => resolve(data));
    });
  }

  static readJson(filename) {
    const filepath = `../data/${filename}.json`;
    return require(filepath);
  }

  /**
   * @param {String} filename
   * @param {Array} rows
   */
  static writeCsv(filename, rows) {
    const filepath = `./out/${filename}.csv`;
    const writeStream = fs.createWriteStream(filepath);
    const csvStream = csv.format({headers: true});
    csvStream.pipe(writeStream);

    rows.forEach((row) => {
      const values = [];
      Object.keys(row).forEach(c => values.push(row[c]));
      csvStream.write(row);
    });
    csvStream.end();
    writeStream.on('finish', () => {
      console.log('updated in csv '+filename);
    });
    writeStream.end();
  }

  /**
   * @param {String} filename
   * @param {Array} rows
   */
  static writeJson(filename, rows) {
    const filepath = `./out/${filename}.json`;
    const writeStream = fs.createWriteStream(filepath);
    writeStream.write(JSON.stringify(rows));
    writeStream.on('finish', () => {
      console.log('updated in json '+filename);
    });
    writeStream.end();
  }
}

module.exports = FileHandler;
