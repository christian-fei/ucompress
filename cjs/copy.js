'use strict';
const {copyFile} = require('fs');
const {extname} = require('path');

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
const compress = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compress.js'));
const headers = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./headers.js'));

compressed.add('.csv');
compressed.add('.json');
compressed.add('.md');
compressed.add('.txt');
compressed.add('.woff2');
compressed.add('.yml');

/**
 * Copy a source file into a destination.
 * @param {string} source The source file to copy.
 * @param {string} dest The destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    copyFile(source, dest, err => {
      if (err)
        rej(err);
      else {
        const ext = extname(source);
        if (compressed.has(ext))
          compress(dest, ext === '.woff2' ? 'font' : 'text', options)
            .then(() => res(dest), rej);
        else
          headers(dest, options.headers).then(() => res(dest), rej);
      }
    });
  });