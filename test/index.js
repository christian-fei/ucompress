const {readdir} = require('fs');
const {basename, join} = require('path');
const {log, ok, error} = require('essential-md');
const ucompress = require('../cjs');

const TIMEOUT = 1000;

log`# ucompress test`;



// regular test for each kind of file
readdir(join(__dirname, 'source'), (_, files) => {
  for (const file of files) {
    ucompress(
      join(__dirname, 'source', file),
      join(__dirname, 'dest', file)
    )
    .then(dest => ok(`\`${basename(dest)}\``))
    .catch(err => {
      error`\`\`\`${err}\`\`\``;
      process.exit(1);
    });
  }
});

setTimeout(
  () => {
    // regular test for each kind of file + extras
    readdir(join(__dirname, 'source'), (_, files) => {
      for (const file of files) {
        ucompress(
          join(__dirname, 'source', file),
          join(__dirname, 'dest', file),
          {createFiles: true}
        )
        .then(dest => ok(`\`${basename(dest)}\``))
        .catch(err => {
          error`\`\`\`${err}\`\`\``;
          process.exit(1);
        });
      }
    });
    setTimeout(
      () => {
        // regular test for each kind of file + extras + maxWidth
        readdir(join(__dirname, 'source'), (_, files) => {
          for (const file of files) {
            ucompress(
              join(__dirname, 'source', file),
              join(__dirname, 'dest', file),
              {
                createFiles: true,
                maxWidth: 320,
                maxHeight: 320,
                preview: true
              }
            )
            .then(dest => ok(`\`${basename(dest)}\``))
            .catch(err => {
              error`\`\`\`${err}\`\`\``;
              process.exit(1);
            });
          }
        });
        setTimeout(
          () => {
            // wrong source files
            readdir(join(__dirname, 'source'), (_, files) => {
              for (const file of files) {
                ucompress(
                  join(__dirname, 'source', `no-${file}`),
                  join(__dirname, 'dest', `no-${file}`)
                )
                .then(dest => {
                  error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
                  process.exit(1);
                })
                .catch(() => ok`\`no-${file}\` failed`);
              }
            });
            setTimeout(
              () => {
                ucompress.createHeaders(join(__dirname, 'prepared')).then(
                  () => ok`createHeaders works`,
                  () => {
                    error`createHeaders failure`;
                    process.exit(1);
                  }
                );
                setTimeout(
                  lastChecks,
                  TIMEOUT
                );
              },
              TIMEOUT
            );
          },
          TIMEOUT
        );
      },
      TIMEOUT
    );
  },
  TIMEOUT
);

function lastChecks() {
  // wrong destination folders
  ucompress.css(
    join(__dirname, 'source', 'index.css'),
    join(__dirname, 'shenanigans', `index.css`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`wrong CSS destination fails as expected`);

  ucompress.js(
    join(__dirname, 'source', 'index.js'),
    join(__dirname, 'shenanigans', `index.js`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`wrong JS destination fails as expected`);

  ucompress.html(
    join(__dirname, 'source', 'index.html'),
    join(__dirname, 'shenanigans', `index.html`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`wrong HTML destination fails as expected`);

  ucompress.svg(
    join(__dirname, 'source', 'benja-dark.svg'),
    join(__dirname, 'shenanigans', `benja-dark.svg`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`wrong SVG destination fails as expected`);

  // other kind of failures
  ucompress.js(
    join(__dirname, 'source', 'favicon.ico'),
    join(__dirname, 'dest', `shenanigans.js`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`bad JS fails as expected`);

  ucompress.html(
    join(__dirname, 'source', 'favicon.ico'),
    join(__dirname, 'dest', `shenanigans.html`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`bad HTML fails as expected`);

  ucompress.png(
    join(__dirname, 'source', 'shenanigans.png'),
    join(__dirname, 'dest', `shenanigans.png`)
  )
  .then(dest => {
    error`\`\`\`${dest}\`\`\` did not exists, this should've failed!`;
    process.exit(1);
  })
  .catch(() => ok`bad PNG fails as expected`);
}
