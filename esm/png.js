import {execFile} from 'child_process';
import {copyFile, unlink} from 'fs';

import pngquant from 'pngquant-bin';
import sharp from 'sharp';

import headers from './headers.js';

const fit = sharp.fit.inside;
const pngquantArgs = ['--skip-if-larger', '--speed', '1', '-f', '-o'];
const withoutEnlargement = true;

const optimize = (source, dest) => new Promise((res, rej) => {
  execFile(pngquant, pngquantArgs.concat(dest, source), err => {
    if (err) {
      copyFile(source, dest, err => {
        if (err) rej(err);
        else res(dest);
      });
    }
    else
      res(dest);
  });
});

/**
 * Create a file after optimizing via `pngquant`.
 * @param {string} source The source PNG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    const {maxWidth: width, maxHeight: height, createFiles} = options;
    const done = () => res(dest);
    const walkThrough = () => {
      if (createFiles) writeHeaders(dest).then(done, rej);
      else done();
    };
    const writeHeaders = dest => headers(source, dest, options.headers);
    if (width || height) {
      sharp(source)
        .resize({width, height, fit, withoutEnlargement})
        .toFile(`${dest}.resized.png`)
        .then(
          () => optimize(`${dest}.resized.png`, dest).then(
            () => {
              unlink(`${dest}.resized.png`, err => {
                /* istanbul ignore if */
                if (err) rej(err);
                else walkThrough();
              });
            },
            rej
          ),
          rej
        )
      ;
    }
    else
      optimize(source, dest).then(walkThrough, rej);
  });
