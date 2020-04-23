'use strict';
const {readFile, writeFile} = require('fs');

const uglify = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('uglify-es'));

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
const compress = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compress.js'));

const uglifyArgs = {output: {comments: /^!/}};

compressed.add('.js');

/**
 * Create a file after minifying it via `uglify-es`.
 * @param {string} source The source JS file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, data) => {
      if (err)
        rej(err);
      else {
        const {code, error} = uglify.minify(data.toString(), uglifyArgs);
        if (error)
          rej(error);
        else {
          writeFile(dest, code, err => {
            if (err)
              rej(err);
            else
              compress(dest, 'text', options).then(() => res(dest), rej);
          });
        }
      }
    });
  });