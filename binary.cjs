#!/usr/bin/env node

const {mkdir, readdir, stat, statSync} = require('fs');
const {join, resolve} = require('path');

const ucompress = require('./cjs/index.js');
const blur = require('./cjs/preview.js');

let source = '.';
let dest = '';
let headers = false;
let help = false;
let preview = false;
let maxWidth, maxHeight;

for (let {argv} = process, {length} = argv, i = 2; i < length; i++) {

  // utils
  const asInt = ({$1}) => parseInt($1 ? $1.slice(1) : argv[++i], 10);
  const asString = ({$1}) => ($1 ? $1.slice(1) : argv[++i]);

  switch (true) {

    // integers
    case /^--max-width(=\d+)?$/.test(argv[i]):
      maxWidth = asInt(RegExp);
      break;
    case /^--max-height(=\d+)?$/.test(argv[i]):
      maxHeight = asInt(RegExp);
      break;

    // strings as paths
    case /^--dest(=.+)?$/.test(argv[i]):
      dest = resolve(process.cwd(), asString(RegExp));
      break;
    case /^--source(=.+)?$/.test(argv[i]):
      source = resolve(process.cwd(), asString(RegExp));
      break;

    // no value needed
    case /^--create-headers$/.test(argv[i]):
      headers = true;
      break;
    case /^--with-preview$/.test(argv[i]):
    case /^--preview$/.test(argv[i]):
      preview = true;
      break;
    case /^--help$/.test(argv[i]):
    default:
      help = true;
      i = length;
      break;
  }
}

if ((headers || preview) && !dest)
  dest = source;

if (help || !dest) {
  console.log('');
  console.log(`\x1b[1mucompress --source ./path/ --dest ./other-path/\x1b[0m`);
  console.log(`  --dest ./          \x1b[2m# destination folder where files are created\x1b[0m`);
  console.log(`  --source ./        \x1b[2m# file or folder to compress, default current folder\x1b[0m`);
  console.log(`  --max-width X      \x1b[2m# max images width in pixels\x1b[0m`);
  console.log(`  --max-height X     \x1b[2m# max images height in pixels\x1b[0m`);
  console.log(`  --create-headers   \x1b[2m# creates .json files to serve as headers\x1b[0m`);
  console.log(`  --with-preview     \x1b[2m# enables *.preview.jpeg images\x1b[0m`);
  console.log(`  --preview          \x1b[2m# alias for --with-preview\x1b[0m`);
  console.log('');
}
else {
  const error = err => {
    console.error(err);
    process.exit(1);
  };
  if (headers && dest === source)
    ucompress.createHeaders(dest).catch(error);
  else if (preview && dest === source && statSync(source).isFile())
    blur(dest).catch(error);
  else {
    const crawl = (source, dest, options) => new Promise((res, rej) => {
      stat(source, (err, stat) => {
        /* istanbul ignore if */
        if (err)
          rej(err);
        else {
          if (stat.isFile())
            ucompress(source, dest, options).then(res, rej);
          /* istanbul ignore else */
          else if (stat.isDirectory())
            mkdir(dest, {recursive: true}, err => {
              if (err)
                rej(err);
              else
                readdir(source, (err, files) => {
                  /* istanbul ignore if */
                  if (err)
                    rej(err);
                  else
                    Promise.all(files
                      .filter(file => !/^[._]/.test(file))
                      .map(file => crawl(join(source, file), join(dest, file), options))
                    ).then(res, rej);
                });
            });
        }
      });
    });
    crawl(source, dest, {maxWidth, maxHeight, preview})
      .then(() => headers && ucompress.createHeaders(dest).catch(error))
      .catch(error);
  }
}
