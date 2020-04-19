const csv = require('csv-parser');
const fs = require('fs');

class FileHandler {
  static readCsv(filename) {
    const data = [];
    const filepath = `./data/${filename}.csv`;
    const stream = fs.createReadStream(filepath).pipe(csv());
    return new Promise((resolve, reject) => {
      stream.on('data', (row) => data.push(row));
      stream.on('end', () => resolve(data));
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
    let i = 0;
    const headers = [];
    rows.forEach((row) => {
      const values = [];
      if (i === 0) {
        Object.keys(row).forEach(c => headers.push(c));
        writeStream.write(headers.join(',')+'\n');
        i++;
      }
      Object.keys(row).forEach(c => values.push(row[c]));
      writeStream.write(values.join(',')+'\n');
    });
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
